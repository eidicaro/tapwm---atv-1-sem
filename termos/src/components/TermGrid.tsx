import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import * as Speech from 'expo-speech';
import { db } from '../backend/firebaseconfig';
import { useAppTheme } from '../context/ThemeContext';
import { AppColors } from '../../app/theme';

type Term = { id: string; termo: string; descricao: string };

export default function TermGrid({ active }: { active: boolean }) {
  const { colors } = useAppTheme();
  const styles = makeStyles(colors);
  const { width } = useWindowDimensions();
  const columns = width >= 1000 ? 4 : width >= 600 ? 2 : 1;
  const cardWidth = (Math.min(width, 1180) - 48 - (columns - 1) * 16) / columns;
  const [terms, setTerms] = useState<Term[]>([]);
  const [visibleRows, setVisibleRows] = useState(3);
  const visibleTerms = terms.slice(0, visibleRows * columns);
  const hasMore = visibleTerms.length < terms.length;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [audioError, setAudioError] = useState(false);
  const playback = useRef(0);
  const currentTerm = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    getDocs(collection(db, 'termos'))
      .then(snapshot => {
        const items: Term[] = [];
        snapshot.forEach(document => {
          const data = document.data();
          if (typeof data.termo === 'string' && typeof data.descricao === 'string') {
            items.push({ id: document.id, termo: data.termo, descricao: data.descricao });
          }
        });
        if (mounted) setTerms(items.sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR')));
      })
      .catch(() => { if (mounted) setError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [retry]);

  useEffect(() => {
    if (!active) {
      playback.current += 1;
      currentTerm.current = null;
      setSpeaking(null);
      void Speech.stop();
    }
    return () => {
      playback.current += 1;
      currentTerm.current = null;
      void Speech.stop();
    };
  }, [active]);

  const listen = async (term: Term) => {
    const stopOnly = currentTerm.current === term.id;
    const request = ++playback.current;
    currentTerm.current = stopOnly ? null : term.id;
    setSpeaking(currentTerm.current);
    setAudioError(false);
    const finish = () => {
      if (request !== playback.current) return;
      currentTerm.current = null;
      setSpeaking(null);
    };
    try {
      await Speech.stop();
      if (request !== playback.current || stopOnly) return;
      Speech.speak(`${term.termo}. ${term.descricao}`, {
        language: 'pt-BR', rate: 0.82, pitch: 1,
        onDone: finish, onStopped: finish,
        onError: () => { if (request === playback.current) { finish(); setAudioError(true); } },
      });
    } catch {
      if (request === playback.current) { finish(); setAudioError(true); }
    }
  };

  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Explore os termos</Text>
    <Text style={styles.subtitle}>Conheça os conceitos e ouça cada explicação.</Text>
    {loading ? <View style={styles.message}><ActivityIndicator color={colors.primary}/><Text style={styles.messageText}>Carregando termos...</Text></View>
      : error ? <View style={styles.message}><Text style={styles.messageText}>Não foi possível carregar os termos.</Text><Pressable accessibilityRole="button" onPress={() => setRetry(value => value + 1)} style={styles.audioButton}><Text style={styles.audioText}>Tentar novamente</Text></Pressable></View>
      : terms.length === 0 ? <Text style={styles.messageText}>Nenhum termo cadastrado ainda.</Text>
      : <View style={styles.grid}>{visibleTerms.map(term => <View key={term.id} style={[styles.card, { width: cardWidth }]}>
        <Text accessibilityRole="header" style={styles.term}>{term.termo}</Text>
        <Text style={styles.description}>{term.descricao}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`${speaking === term.id ? 'Parar' : 'Ouvir'} explicação de ${term.termo}`} onPress={() => listen(term)} style={({ hovered, pressed }) => [styles.audioButton, hovered && styles.audioHover, pressed && styles.pressed]}>
          <Ionicons name={speaking === term.id ? 'stop-circle-outline' : 'volume-medium-outline'} size={20} color={colors.primary}/>
          <Text style={styles.audioText}>{speaking === term.id ? 'Parar áudio' : 'Ouvir explicação'}</Text>
        </Pressable>
      </View>)}</View>}
    {!loading && !error && hasMore && <Pressable
      accessibilityRole="button"
      accessibilityLabel="Mostrar mais três linhas de termos"
      onPress={() => setVisibleRows(rows => rows + 3)}
      style={({ hovered, pressed }) => [styles.showMore, hovered && styles.audioHover, pressed && styles.pressed]}
    >
      <Text style={styles.audioText}>Mostrar mais</Text>
      <Ionicons name="chevron-down-outline" size={20} color={colors.primary}/>
    </Pressable>}
    {audioError && <Text accessibilityRole="alert" style={styles.error}>Não foi possível reproduzir o áudio. Tente novamente.</Text>}
  </View>;
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  section: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 64 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 16, lineHeight: 24, marginTop: 8, marginBottom: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  showMore: { minHeight: 48, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 28, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.successSoft },
  card: { padding: 20, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  term: { color: colors.text, fontSize: 20, lineHeight: 27, fontWeight: '800', marginBottom: 12 },
  description: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginBottom: 20, flexGrow: 1 },
  audioButton: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.successSoft },
  audioHover: { backgroundColor: colors.backgroundSoft },
  audioText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  message: { paddingVertical: 24, alignItems: 'center', gap: 12 },
  messageText: { color: colors.textMuted, fontSize: 15, lineHeight: 23 },
  error: { color: colors.danger, fontSize: 14, marginTop: 16 },
});