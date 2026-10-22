import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from './SiteHeader';
import Footer from '../../app/footer';
import TermGrid from './TermGrid';
import { useAppTheme } from '../context/ThemeContext';
import { useDictionary } from '../context/DictionaryContext';
import { useAudio } from '../context/AudioContext';
import { useSuggestion } from '../hooks/useSuggestion';
import { relatedTerms, searchTerms, summarize } from '../lib/dictionary';

function useStyles() {
  const { colors } = useAppTheme();
  return StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background }, content: { flexGrow: 1 }, main: { width: '100%', maxWidth: 1050, alignSelf: 'center', padding: 24, gap: 20 }, heading: { color: colors.text, fontSize: 38, lineHeight: 44, fontWeight: '900', letterSpacing: -1.2 }, accent: { color: colors.primary }, text: { color: colors.textSecondary, fontSize: 16, lineHeight: 26 }, kicker: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.6 }, field: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, color: colors.text, backgroundColor: colors.surface, fontSize: 16 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }, button: { minHeight: 48, padding: 13, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: colors.primaryText, fontSize: 15, fontWeight: '800' }, card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 18, padding: 22, gap: 16 }, label: { color: colors.text, fontSize: 14, fontWeight: '700' }, error: { color: colors.danger, fontSize: 14, lineHeight: 22 }, result: { paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border, gap: 5 }, resultTitle: { color: colors.text, fontSize: 17, fontWeight: '800' } });
}
export function HomeScreen() {
  const s = useStyles();
  const { colors } = useAppTheme();
  const { terms, loading, error, reload } = useDictionary();
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(typeof q === 'string' ? q : '');
  const [focused, setFocused] = useState(false);
  const matches = searchTerms(terms, query);
  return <View style={s.page}><Header /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}><View style={[s.main, { paddingTop: 42 }]}><Text style={s.kicker}>CONHECIMENTO SEM BARREIRAS</Text><Text accessibilityRole="header" style={s.heading}>Tecnologia em{'\n'}<Text style={s.accent}>palavras simples.</Text></Text><Text style={s.text}>Encontre definições claras para os termos que movem o mundo digital. Sem jargões, sem complicação.</Text><View style={s.row}><TextInput accessibilityLabel="Pesquisar termos de tecnologia" value={query} onChangeText={value => { setQuery(value); setFocused(true); }} onFocus={() => setFocused(true)} placeholder="O que você quer entender?" placeholderTextColor={colors.textMuted} style={[s.field, { flex: 1 }]} returnKeyType="search" onSubmitEditing={() => { if (matches[0]) router.push({ pathname: '/termo', params: { id: matches[0].id } }); }} />{!!query && <Pressable accessibilityLabel="Limpar pesquisa" onPress={() => setQuery('')} style={s.button}><Ionicons name="close-outline" size={20} color={colors.primaryText} /></Pressable>}</View>
    {focused && !!query && <View style={s.card}>{loading ? <ActivityIndicator color={colors.primary} /> : error ? <Pressable accessibilityRole="button" onPress={reload}><Text style={s.error}>Erro ao carregar. Tentar novamente.</Text></Pressable> : matches.length ? matches.slice(0, 5).map(term => <Pressable key={term.id} accessibilityRole="link" onPress={() => { setFocused(false); router.push({ pathname: '/termo', params: { id: term.id } }); }} style={s.result}><Text style={s.resultTitle}>{term.termo}</Text><Text style={s.text}>{summarize(term.descricao, 100)}</Text></Pressable>) : <><Text style={s.text}>Ainda não encontramos esse termo.</Text><Pressable accessibilityRole="link" style={s.button} onPress={() => router.push({ pathname: '/sugestao', params: { termo: query } })}><Text style={s.buttonText}>Sugerir esse termo</Text></Pressable></>}</View>}
    <View style={s.row}>{terms.slice(0, 4).map(term => <Pressable key={term.id} accessibilityRole="link" onPress={() => router.push({ pathname: '/termo', params: { id: term.id } })} style={[s.field, { minHeight: 44 }]}><Text style={s.accent}>{term.termo}</Text></Pressable>)}</View></View><TermGrid query={query} /><Footer /></ScrollView></View>;
}
export function TermScreen() {
  const s = useStyles();
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { terms, loading, error, reload } = useDictionary();
  const { speaking, listen, error: audioError } = useAudio();
  const router = useRouter();
  const term = terms.find(item => item.id === id);
  return <View style={s.page}><Header /><ScrollView contentContainerStyle={s.content}><View style={s.main}><Pressable accessibilityRole="link" onPress={() => router.navigate('/')}><Text style={s.accent}>← Voltar ao dicionário</Text></Pressable>{loading ? <ActivityIndicator color={colors.primary} /> : error ? <Pressable onPress={reload}><Text style={s.error}>Não foi possível carregar. Tentar novamente.</Text></Pressable> : !term ? <Text style={s.heading}>Termo não encontrado.</Text> : <><Text style={s.kicker}>DICIONÁRIO TECH</Text><Text accessibilityRole="header" style={s.heading}>{term.termo}</Text><Text style={s.text}>{term.descricao}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${speaking === term.id ? 'Parar' : 'Ouvir'} explicação`} style={s.button} onPress={() => void listen(term)}><Text style={s.buttonText}>{speaking === term.id ? 'Parar leitura' : 'Ouvir explicação'}</Text></Pressable>{term.explicacao && <View style={s.card}><Text style={s.label}>Entenda o conceito</Text><Text style={s.text}>{term.explicacao}</Text></View>}{!!term.exemplos?.length && <View style={s.card}><Text style={s.label}>Exemplos práticos</Text>{term.exemplos.map((example, index) => <Text key={index} style={s.text}>{example}</Text>)}</View>}{relatedTerms(term, terms).map(other => <Pressable key={other.id} onPress={() => router.push({ pathname: '/termo', params: { id: other.id } })}><Text style={s.accent}>Veja também: {other.termo}</Text></Pressable>)}<Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/sugestao', params: { termo: term.termo, melhoria: '1' } })}><Text style={s.accent}>Sugerir uma melhoria</Text></Pressable></>}{!!audioError && <Text accessibilityRole="alert" style={s.error}>{audioError}</Text>}</View><Footer /></ScrollView></View>;
}
export function SuggestionScreen() {
  const s = useStyles();
  const { colors } = useAppTheme();
  const { termo } = useLocalSearchParams<{ termo?: string }>();
  const form = useSuggestion(typeof termo === 'string' ? termo : '');
  const termRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);
  useEffect(() => { if (form.errors.term) termRef.current?.focus(); else if (form.errors.description) descRef.current?.focus(); }, [form.errors]);
  const sending = form.state === 'sending';
  return <View style={s.page}><Header /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}><View style={s.main}><Text style={s.kicker}>CONSTRUA COM A GENTE</Text><Text accessibilityRole="header" style={s.heading}>Sentiu falta de uma <Text style={s.accent}>palavra?</Text></Text><Text style={s.text}>Sua curiosidade pode ajudar outra pessoa. Nossa equipe revisa cada sugestão antes de publicar.</Text><View style={s.card}>{form.state === 'success' ? <><Text accessibilityRole="header" style={s.heading}>Sugestão recebida!</Text><Text accessibilityLiveRegion="polite" style={s.text}>A sugestão de {form.term} foi enviada para revisão.</Text><Pressable onPress={form.reset} style={s.button}><Text style={s.buttonText}>Sugerir outra palavra</Text></Pressable></> : <><Text style={s.label}>Nome do termo</Text><TextInput ref={termRef} accessibilityLabel="Nome do termo" value={form.term} onChangeText={form.setTerm} maxLength={80} editable={!sending} placeholder="Ex.: Machine Learning" placeholderTextColor={colors.textMuted} style={s.field} />{form.errors.term && <Text accessibilityRole="alert" style={s.error}>{form.errors.term}</Text>}<Text style={s.label}>Explicação</Text><TextInput ref={descRef} accessibilityLabel="Explicação" value={form.description} onChangeText={form.setDescription} maxLength={500} editable={!sending} multiline textAlignVertical="top" placeholder="Explique com suas próprias palavras…" placeholderTextColor={colors.textMuted} style={[s.field, { minHeight: 150 }]} /><Text style={s.text}>{form.description.length}/500</Text>{form.errors.description && <Text accessibilityRole="alert" style={s.error}>{form.errors.description}</Text>}{form.state === 'error' && <Text accessibilityRole="alert" style={s.error}>Não foi possível confirmar o envio. Seu texto foi preservado. Tente novamente.</Text>}<Pressable accessibilityRole="button" accessibilityState={{ disabled: sending, busy: sending }} disabled={sending} onPress={() => void form.submit()} style={s.button}>{sending ? <ActivityIndicator color={colors.primaryText} /> : <Text style={s.buttonText}>Enviar para revisão</Text>}</Pressable><Text style={s.text}>Não pedimos seus dados pessoais.</Text></>}</View></View><Footer /></ScrollView></View>;
}