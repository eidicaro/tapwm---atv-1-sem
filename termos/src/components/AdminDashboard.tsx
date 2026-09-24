import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseconfig';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { AppColors } from '../../app/theme';

type Suggestion = { id: string; termo: string; descricao: string; status?: string };
type Term = { id: string; termo: string; descricao: string };
type Section = 'suggestions' | 'create' | 'terms';

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const styles = makeStyles(colors);
  const compact = width < 860;
  const [section, setSection] = useState<Section>('suggestions');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newTerm, setNewTerm] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editing, setEditing] = useState<Term | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [suggestionSnap, termSnap] = await Promise.all([
        getDocs(collection(db, 'sugestoes')),
        getDocs(collection(db, 'termos')),
      ]);
      setSuggestions(suggestionSnap.docs.map((item) => ({ id: item.id, ...item.data() } as Suggestion)).filter((item) => item.status === 'pendente'));
      setTerms(termSnap.docs.map((item) => ({ id: item.id, ...item.data() } as Term)).sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR')));
    } catch {
      Alert.alert('Não foi possível carregar o painel', 'Confira sua conexão e tente novamente.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (!authLoading && !user) router.replace('/login'); }, [user, authLoading, router]);

  const filteredTerms = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return query ? terms.filter((item) => item.termo.toLocaleLowerCase('pt-BR').includes(query)) : terms;
  }, [search, terms]);

  const approve = async (item: Suggestion) => {
    setBusyId(item.id);
    try {
      await addDoc(collection(db, 'termos'), { termo: item.termo.trim().toLowerCase(), descricao: item.descricao.trim() });
      await updateDoc(doc(db, 'sugestoes', item.id), { status: 'aprovado' });
      await loadData();
    } catch { Alert.alert('Erro ao aprovar sugestão'); } finally { setBusyId(null); }
  };

  const reject = async (item: Suggestion) => {
    setBusyId(item.id);
    try {
      await updateDoc(doc(db, 'sugestoes', item.id), { status: 'rejeitado' });
      setSuggestions((current) => current.filter((value) => value.id !== item.id));
    } catch { Alert.alert('Erro ao rejeitar sugestão'); } finally { setBusyId(null); }
  };

  const createTerm = async () => {
    if (!newTerm.trim() || !newDescription.trim()) { Alert.alert('Preencha o termo e a descrição'); return; }
    setBusyId('create');
    try {
      await addDoc(collection(db, 'termos'), { termo: newTerm.trim().toLowerCase(), descricao: newDescription.trim() });
      setNewTerm(''); setNewDescription(''); await loadData(); setSection('terms');
    } catch { Alert.alert('Erro ao criar termo'); } finally { setBusyId(null); }
  };

  const saveEdit = async () => {
    if (!editing || !editDescription.trim()) return;
    setBusyId(editing.id);
    try {
      await updateDoc(doc(db, 'termos', editing.id), { descricao: editDescription.trim() });
      setEditing(null); setEditDescription(''); await loadData();
    } catch { Alert.alert('Erro ao salvar alteração'); } finally { setBusyId(null); }
  };

  const removeTerm = (item: Term) => Alert.alert('Remover termo?', `“${item.termo}” será removido do dicionário.`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Remover', style: 'destructive', onPress: async () => {
      setBusyId(item.id);
      try { await deleteDoc(doc(db, 'termos', item.id)); setTerms((current) => current.filter((value) => value.id !== item.id)); }
      catch { Alert.alert('Erro ao remover termo'); } finally { setBusyId(null); }
    } },
  ]);

  if (authLoading || !user) return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;

  const NavButton = ({ value, icon, label, count }: { value: Section; icon: keyof typeof Ionicons.glyphMap; label: string; count?: number }) => {
    const active = section === value;
    return <Pressable onPress={() => setSection(value)} style={({ pressed }) => [styles.navButton, active && styles.navButtonActive, pressed && styles.pressed]}>
      <Ionicons name={icon} size={21} color={active ? colors.primaryText : colors.textSecondary} />
      <Text style={[styles.navText, active && styles.navTextActive]} numberOfLines={1}>{label}</Text>
      {!!count && <View style={[styles.navBadge, active && styles.navBadgeActive]}><Text style={[styles.navBadgeText, active && styles.navTextActive]}>{count}</Text></View>}
    </Pressable>;
  };

  return <View style={styles.page}>
    <View style={[styles.shell, compact && styles.shellCompact]}>
      <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
        <View style={styles.brand}><View style={styles.brandMark}><Ionicons name="code-slash" size={22} color={colors.primaryText} /></View><View><Text style={styles.brandName}>Dicionário Tech</Text><Text style={styles.brandRole}>PAINEL ADMINISTRATIVO</Text></View></View>
        <View style={[styles.navigation, compact && styles.navigationCompact]}>
          <NavButton value="suggestions" icon="file-tray-full-outline" label="Sugestões" count={suggestions.length} />
          <NavButton value="create" icon="add-circle-outline" label="Criar termo" />
          <NavButton value="terms" icon="library-outline" label="Gerenciar termos" />
        </View>
        {!compact && <View style={styles.sidebarFooter}><Pressable onPress={toggleTheme} style={styles.utilityButton}><Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.textSecondary}/><Text style={styles.utilityText}>Modo {isDark ? 'claro' : 'escuro'}</Text></Pressable><Pressable onPress={async()=>{await logout();router.replace('/');}} style={styles.utilityButton}><Ionicons name="log-out-outline" size={20} color={colors.danger}/><Text style={[styles.utilityText,{color:colors.danger}]}>Sair da conta</Text></Pressable></View>}
      </View>

      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}><View><Text style={styles.eyebrow}>CENTRAL DE CONTEÚDO</Text><Text style={styles.title}>{section === 'suggestions' ? 'Revisar sugestões' : section === 'create' ? 'Adicionar novo termo' : 'Gerenciar dicionário'}</Text><Text style={styles.subtitle}>{section === 'suggestions' ? 'Avalie as contribuições enviadas pela comunidade.' : section === 'create' ? 'Publique uma explicação clara e fácil de entender.' : 'Encontre, edite ou remova termos publicados.'}</Text></View>{compact && <View style={styles.topActions}><Pressable accessibilityLabel="Alternar tema" onPress={toggleTheme} style={styles.iconButton}><Ionicons name={isDark?'sunny-outline':'moon-outline'} size={21} color={colors.text}/></Pressable><Pressable accessibilityLabel="Sair" onPress={async()=>{await logout();router.replace('/');}} style={styles.iconButton}><Ionicons name="log-out-outline" size={21} color={colors.danger}/></Pressable></View>}</View>

        <View style={styles.stats}><View style={styles.stat}><Text style={styles.statValue}>{suggestions.length}</Text><Text style={styles.statLabel}>Aguardando revisão</Text></View><View style={styles.stat}><Text style={styles.statValue}>{terms.length}</Text><Text style={styles.statLabel}>Termos publicados</Text></View><View style={styles.stat}><Text style={styles.statValue}>3</Text><Text style={styles.statLabel}>Ferramentas de gestão</Text></View></View>

        {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary}/><Text style={styles.emptyText}>Atualizando dados...</Text></View> : section === 'suggestions' ? <View style={styles.list}>
          {suggestions.length === 0 ? <Empty icon="checkmark-circle-outline" title="Tudo revisado" text="Não há sugestões pendentes no momento." colors={colors} styles={styles}/> : suggestions.map((item)=><View key={item.id} style={styles.contentCard}><View style={styles.cardHeading}><View style={styles.cardIcon}><Ionicons name="bulb-outline" size={21} color={colors.warning}/></View><View style={styles.cardCopy}><Text style={styles.cardTitle}>{item.termo}</Text><Text style={styles.cardText}>{item.descricao}</Text></View></View><View style={styles.actions}><Pressable disabled={busyId===item.id} onPress={()=>approve(item)} style={({pressed})=>[styles.primaryButton,pressed&&styles.pressed]}><Ionicons name="checkmark" size={20} color={colors.primaryText}/><Text style={styles.primaryButtonText}>Aprovar</Text></Pressable><Pressable disabled={busyId===item.id} onPress={()=>reject(item)} style={({pressed})=>[styles.secondaryButton,styles.dangerButton,pressed&&styles.pressed]}><Ionicons name="close" size={20} color={colors.danger}/><Text style={[styles.secondaryButtonText,{color:colors.danger}]}>Rejeitar</Text></Pressable></View></View>)}
        </View> : section === 'create' ? <View style={styles.formCard}><View style={styles.formIntro}><View style={styles.largeIcon}><Ionicons name="add" size={26} color={colors.primary}/></View><View><Text style={styles.formTitle}>Novo verbete</Text><Text style={styles.formHint}>Use linguagem simples e direta.</Text></View></View><Text style={styles.label}>Nome do termo</Text><TextInput value={newTerm} onChangeText={setNewTerm} placeholder="Ex.: computação em nuvem" placeholderTextColor={colors.textMuted} style={styles.input}/><Text style={styles.label}>Descrição</Text><TextInput value={newDescription} onChangeText={setNewDescription} placeholder="Explique o significado e dê contexto..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" maxLength={600} style={[styles.input,styles.textarea]}/><Text style={styles.counter}>{newDescription.length}/600</Text><Pressable disabled={busyId==='create'} onPress={createTerm} style={({pressed})=>[styles.primaryButton,styles.submitButton,pressed&&styles.pressed]}>{busyId==='create'?<ActivityIndicator color={colors.primaryText}/>:<><Ionicons name="cloud-upload-outline" size={20} color={colors.primaryText}/><Text style={styles.primaryButtonText}>Publicar termo</Text></>}</Pressable></View> : <View>
          <View style={styles.searchBox}><Ionicons name="search" size={21} color={colors.textMuted}/><TextInput value={search} onChangeText={setSearch} placeholder="Buscar no dicionário" placeholderTextColor={colors.textMuted} style={styles.searchInput}/><Text style={styles.resultCount}>{filteredTerms.length} resultado{filteredTerms.length===1?'':'s'}</Text></View>
          <View style={styles.list}>{filteredTerms.length===0?<Empty icon="search-outline" title="Nenhum termo" text="Tente buscar com outra palavra." colors={colors} styles={styles}/>:filteredTerms.map((item)=><View key={item.id} style={styles.contentCard}>{editing?.id===item.id?<><Text style={styles.label}>Editando “{item.termo}”</Text><TextInput value={editDescription} onChangeText={setEditDescription} multiline textAlignVertical="top" style={[styles.input,styles.textarea]}/><View style={styles.actions}><Pressable onPress={saveEdit} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Salvar alteração</Text></Pressable><Pressable onPress={()=>setEditing(null)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancelar</Text></Pressable></View></>:<><Text style={styles.cardTitle}>{item.termo}</Text><Text style={styles.cardText}>{item.descricao}</Text><View style={styles.actions}><Pressable onPress={()=>{setEditing(item);setEditDescription(item.descricao)}} style={styles.secondaryButton}><Ionicons name="create-outline" size={19} color={colors.blue}/><Text style={[styles.secondaryButtonText,{color:colors.blue}]}>Editar</Text></Pressable><Pressable disabled={busyId===item.id} onPress={()=>removeTerm(item)} style={[styles.secondaryButton,styles.dangerButton]}><Ionicons name="trash-outline" size={19} color={colors.danger}/><Text style={[styles.secondaryButtonText,{color:colors.danger}]}>Remover</Text></Pressable></View></>}</View>)}</View>
        </View>}
      </ScrollView>
    </View>
  </View>;
}

function Empty({icon,title,text,colors,styles}:{icon:keyof typeof Ionicons.glyphMap;title:string;text:string;colors:AppColors;styles:ReturnType<typeof makeStyles>}) { return <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={icon} size={28} color={colors.primary}/></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>; }

const makeStyles = (c: AppColors) => StyleSheet.create({
  page:{flex:1,backgroundColor:c.background},center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:c.background},shell:{flex:1,flexDirection:'row'},shellCompact:{flexDirection:'column'},
  sidebar:{width:290,backgroundColor:c.surface,borderRightWidth:1,borderRightColor:c.border,padding:24},sidebarCompact:{width:'100%',padding:16,borderRightWidth:0,borderBottomWidth:1,borderBottomColor:c.border},
  brand:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:36},brandMark:{width:44,height:44,borderRadius:14,backgroundColor:c.primary,alignItems:'center',justifyContent:'center'},brandName:{color:c.text,fontSize:18,fontWeight:'900'},brandRole:{color:c.textMuted,fontSize:14,fontWeight:'700',marginTop:2},
  navigation:{gap:8},navigationCompact:{flexDirection:'row'},navButton:{minHeight:52,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:14,borderRadius:14},navButtonActive:{backgroundColor:c.primary},navText:{flex:1,color:c.textSecondary,fontSize:15,fontWeight:'700'},navTextActive:{color:c.primaryText},navBadge:{minWidth:26,height:26,paddingHorizontal:7,borderRadius:13,backgroundColor:c.warningSoft,alignItems:'center',justifyContent:'center'},navBadgeActive:{backgroundColor:'rgba(255,255,255,.22)'},navBadgeText:{color:c.warning,fontSize:14,fontWeight:'900'},sidebarFooter:{marginTop:'auto',gap:8,paddingTop:24},utilityButton:{minHeight:48,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:12,borderRadius:12},utilityText:{color:c.textSecondary,fontSize:15,fontWeight:'700'},
  main:{flex:1},mainContent:{width:'100%',maxWidth:1050,alignSelf:'center',paddingHorizontal:24,paddingVertical:34,paddingBottom:70},topbar:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:20},eyebrow:{color:c.primary,fontSize:14,fontWeight:'900',letterSpacing:1.1,marginBottom:8},title:{color:c.text,fontSize:32,fontWeight:'900',letterSpacing:-.7},subtitle:{color:c.textSecondary,fontSize:16,lineHeight:24,marginTop:7},topActions:{flexDirection:'row',gap:8},iconButton:{width:46,height:46,borderRadius:13,borderWidth:1,borderColor:c.border,backgroundColor:c.surface,alignItems:'center',justifyContent:'center'},
  stats:{flexDirection:'row',flexWrap:'wrap',gap:12,marginVertical:28},stat:{flex:1,minWidth:170,backgroundColor:c.surface,borderWidth:1,borderColor:c.border,borderRadius:18,padding:20},statValue:{color:c.text,fontSize:28,fontWeight:'900'},statLabel:{color:c.textMuted,fontSize:14,fontWeight:'600',marginTop:5},
  list:{gap:12},contentCard:{backgroundColor:c.surface,borderWidth:1,borderColor:c.border,borderRadius:18,padding:20},cardHeading:{flexDirection:'row',alignItems:'flex-start',gap:14},cardIcon:{width:44,height:44,borderRadius:13,backgroundColor:c.warningSoft,alignItems:'center',justifyContent:'center'},cardCopy:{flex:1},cardTitle:{color:c.text,fontSize:18,fontWeight:'900',textTransform:'capitalize'},cardText:{color:c.textSecondary,fontSize:15,lineHeight:23,marginTop:7},actions:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:18},
  primaryButton:{minHeight:46,paddingHorizontal:18,borderRadius:13,backgroundColor:c.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},primaryButtonText:{color:c.primaryText,fontSize:15,fontWeight:'900'},secondaryButton:{minHeight:46,paddingHorizontal:16,borderRadius:13,borderWidth:1,borderColor:c.border,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},secondaryButtonText:{color:c.textSecondary,fontSize:15,fontWeight:'800'},dangerButton:{backgroundColor:c.dangerSoft,borderColor:c.dangerSoft},pressed:{opacity:.68},
  formCard:{maxWidth:720,backgroundColor:c.surface,borderWidth:1,borderColor:c.border,borderRadius:20,padding:24},formIntro:{flexDirection:'row',alignItems:'center',gap:14,marginBottom:26},largeIcon:{width:52,height:52,borderRadius:16,backgroundColor:c.successSoft,alignItems:'center',justifyContent:'center'},formTitle:{color:c.text,fontSize:21,fontWeight:'900'},formHint:{color:c.textMuted,fontSize:14,marginTop:3},label:{color:c.textSecondary,fontSize:14,fontWeight:'800',marginBottom:8},input:{minHeight:54,borderRadius:14,backgroundColor:c.backgroundSoft,borderWidth:1,borderColor:c.border,color:c.text,fontSize:15,paddingHorizontal:15,marginBottom:18,outlineStyle:'none'} as any,textarea:{minHeight:140,paddingTop:14},counter:{color:c.textMuted,fontSize:14,textAlign:'right',marginTop:-10,marginBottom:18},submitButton:{alignSelf:'flex-start',minWidth:170},
  searchBox:{minHeight:58,flexDirection:'row',alignItems:'center',gap:10,backgroundColor:c.surface,borderWidth:1,borderColor:c.border,borderRadius:16,paddingHorizontal:16,marginBottom:16},searchInput:{flex:1,color:c.text,fontSize:15,outlineStyle:'none'} as any,resultCount:{color:c.textMuted,fontSize:14},loading:{paddingVertical:60,alignItems:'center',gap:14},empty:{paddingVertical:52,alignItems:'center',backgroundColor:c.surface,borderWidth:1,borderColor:c.border,borderRadius:18},emptyIcon:{width:56,height:56,borderRadius:18,backgroundColor:c.successSoft,alignItems:'center',justifyContent:'center',marginBottom:14},emptyTitle:{color:c.text,fontSize:19,fontWeight:'900'},emptyText:{color:c.textMuted,fontSize:15,textAlign:'center',marginTop:6},
});
