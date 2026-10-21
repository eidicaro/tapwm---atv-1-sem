import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDictionary } from '../context/DictionaryContext';
import { useAudio } from '../context/AudioContext';
import { useAppTheme } from '../context/ThemeContext';
import { filterCatalog, summarize } from '../lib/dictionary';

export default function TermGrid({ query = '' }: { active?: boolean; query?: string }) {
  const { terms, loading, error, reload } = useDictionary();
  const { speaking, listen, error: audioError } = useAudio();
  const { colors } = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [letter, setLetter] = useState('');
  const [descending, setDescending] = useState(false);
  const [visible, setVisible] = useState(12);
  const columns = width >= 1000 ? 4 : width >= 600 ? 2 : 1;
  const cardWidth = (Math.min(width, 1180) - 48 - (columns - 1) * 16) / columns;
  const filtered = filterCatalog(terms, query, letter, descending);
  const s = StyleSheet.create({
    section: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: 24, gap: 20 },
    heading: { color: colors.text, fontSize: 28, fontWeight: '800' },
    text: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
    row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    filter: { minWidth: 44, minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13 },
    selected: { backgroundColor: colors.primary, borderColor: colors.primary },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    card: { padding: 20, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 12 },
    term: { color: colors.text, fontSize: 20, fontWeight: '800' },
    actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
    button: { minHeight: 44, padding: 12, borderRadius: 12, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: colors.primary, fontWeight: '700' },
    center: { alignItems: 'center', gap: 14, paddingVertical: 24 },
  });
  return <View style={s.section}><Text accessibilityRole="header" style={s.heading}>Explore os termos</Text><Text style={s.text}>Conheça os conceitos e ouça cada explicação.</Text>
    <Pressable accessibilityRole="button" onPress={() => setDescending(value => !value)} style={[s.filter, { alignSelf: 'flex-start' }]}><Text style={s.text}>Ordenação: {descending ? 'Z a A' : 'A a Z'}</Text></Pressable>
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={s.row}>{['', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(initial => <Pressable key={initial} accessibilityRole="button" accessibilityLabel={initial ? `Termos com a letra ${initial}` : 'Todos os termos'} accessibilityState={{ selected: initial === letter }} onPress={() => { setLetter(initial); setVisible(12); }} style={[s.filter, initial === letter && s.selected]}><Text style={[s.text, initial === letter && { color: colors.primaryText }]}>{initial || `Todos (${terms.length})`}</Text></Pressable>)}</ScrollView>
    {loading ? <View style={s.center}><ActivityIndicator color={colors.primary} /><Text style={s.text}>Carregando termos…</Text></View> : error ? <View style={s.center}><Text accessibilityRole="alert" style={s.text}>Não foi possível carregar os termos.</Text><Pressable accessibilityRole="button" onPress={reload} style={s.button}><Text style={s.buttonText}>Tentar novamente</Text></Pressable></View> : <><View style={s.grid}>{filtered.slice(0, visible).map(term => <View key={term.id} style={[s.card, { width: cardWidth }]}><Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/termo', params: { id: term.id } })}><Text accessibilityRole="header" style={s.term}>{term.termo}</Text></Pressable><Text style={s.text}>{summarize(term.descricao)}</Text><View style={s.actions}><Pressable accessibilityRole="button" accessibilityLabel={`${speaking === term.id ? 'Parar' : 'Ouvir'} explicação de ${term.termo}`} onPress={() => void listen(term)} style={s.button}><Ionicons name={speaking === term.id ? 'stop-outline' : 'volume-medium-outline'} size={20} color={colors.primary} /></Pressable><Pressable accessibilityRole="link" accessibilityLabel={`Ler explicação completa de ${term.termo}`} onPress={() => router.push({ pathname: '/termo', params: { id: term.id } })} style={s.button}><Ionicons name="arrow-forward-outline" size={20} color={colors.primary} /></Pressable></View></View>)}</View>{!filtered.length && <View style={s.center}><Text style={s.text}>Nenhum termo encontrado com esse filtro.</Text><Pressable accessibilityRole="link" onPress={() => router.push('/sugestao')} style={s.button}><Text style={s.buttonText}>Sugerir um termo</Text></Pressable></View>}{visible < filtered.length && <Pressable accessibilityRole="button" onPress={() => setVisible(count => count + 12)} style={s.button}><Text style={s.buttonText}>Mostrar mais termos</Text></Pressable>}</>}
    {!!audioError && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{audioError}</Text>}
  </View>;
}