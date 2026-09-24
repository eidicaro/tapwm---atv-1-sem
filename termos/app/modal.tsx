import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAppTheme } from '../src/context/ThemeContext';
import { AppColors } from './theme';

type Termo = {
  termo: string;
  descricao: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  termos: Termo[];
};

export default function ModalScreen({
  visible,
  onClose,
  termos,
}: Props) {
  const { colors } = useAppTheme();
  const styles = makeStyles(colors);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const ouvir = async (termo: string) => {
    await Speech.stop();
    setSpeaking(termo);
    Speech.speak(termo, {
      language: 'pt-BR',
      rate: 0.82,
      pitch: 1,
      onDone: () => setSpeaking(null),
      onStopped: () => setSpeaking(null),
      onError: () => setSpeaking(null),
    });
  };

  // Ordena alfabeticamente
  const termosOrdenados = [...termos].sort((a, b) =>
    a.termo.localeCompare(b.termo, 'pt-BR')
  );

  // Agrupa por letra
  const termosAgrupados = termosOrdenados.reduce((acc, item) => {
    const letra = item.termo.charAt(0).toUpperCase();

    if (!acc[letra]) {
      acc[letra] = [];
    }

    acc[letra].push(item);

    return acc;
  }, {} as Record<string, Termo[]>);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.title}>Dicionário</Text>

            <Pressable
              style={styles.closeIconBtn}
              onPress={onClose}
            >
              <Text style={styles.closeIconText}>✕</Text>
            </Pressable>
          </View>

          {/* Contador */}
          {termos.length > 0 && (
            <Text style={styles.counter}>
              {termos.length} termo
              {termos.length !== 1 ? 's' : ''} encontrado
              {termos.length !== 1 ? 's' : ''}
            </Text>
          )}

          {/* Lista */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            {termos.length > 0 ? (
              Object.keys(termosAgrupados).map((letra) => (
                <View key={letra}>

                  {/* Título da letra */}
                  <View style={styles.letterContainer}>
                    <Text style={styles.letterTitle}>
                      {letra}
                    </Text>

                    <View style={styles.letterLine} />
                  </View>

                  {/* Termos */}
                  {termosAgrupados[letra].map((item, index) => (
                    <View key={index} style={styles.card}>
                      <View style={styles.cardAccent} />

                      <View style={styles.cardContent}>
                        <View style={styles.termRow}><Text style={styles.term}>{item.termo}</Text>
                          <Pressable accessibilityRole="button" accessibilityLabel={`Ouvir pronúncia de ${item.termo}`} onPress={() => ouvir(item.termo)} style={({pressed})=>[styles.audioButton, speaking === item.termo && styles.audioButtonActive, pressed && styles.pressed]}>
                            <Ionicons name={speaking === item.termo ? 'volume-high' : 'volume-medium-outline'} size={19} color={speaking === item.termo ? colors.primaryText : colors.primary}/>
                            <Text style={[styles.audioText, speaking === item.termo && styles.audioTextActive]}>{speaking === item.termo ? 'Ouvindo' : 'Ouvir'}</Text>
                          </Pressable>
                        </View>

                        <Text style={styles.desc}>
                          {item.descricao}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>

                <Text style={styles.empty}>
                  Nenhum termo encontrado.
                </Text>

                <Text style={styles.emptySub}>
                  Tente buscar por outro termo ou explore o
                  dicionário completo.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Botão fechar */}
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeText}>Fechar</Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '92%',
    maxWidth: 760,
    maxHeight: '82%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },

  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeIconText: {
    color: colors.textSecondary,
    fontSize: 16,
  },

  counter: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 14,
  },

  scroll: {
    marginBottom: 14,
  },

  // ===== LETRAS =====

  letterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
  },

  letterTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },

  letterLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  // ===== CARDS =====

  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.border,
  },

  cardAccent: {
    width: 3,
    backgroundColor: colors.primary,
  },

  cardContent: {
    flex: 1,
    padding: 12,
  },

  term: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'capitalize',
  },

  termRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  audioButton: { minHeight: 40, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 },
  audioButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  audioText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  audioTextActive: { color: colors.primaryText },
  pressed: { opacity: .7 },

  desc: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },

  emptySub: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },

  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  closeText: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 14,
  },
});
