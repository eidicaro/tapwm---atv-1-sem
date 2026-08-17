import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';

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
                        <Text style={styles.term}>
                          {item.termo}
                        </Text>

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,8,15,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '92%',
    maxWidth: 760,
    maxHeight: '82%',
    backgroundColor: '#101F32',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(170,202,230,0.16)',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },

  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeIconText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },

  counter: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
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
    color: '#32D6A0',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },

  letterLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  // ===== CARDS =====

  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  cardAccent: {
    width: 3,
    backgroundColor: '#32D6A0',
  },

  cardContent: {
    flex: 1,
    padding: 12,
  },

  term: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'capitalize',
  },

  desc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 18,
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
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },

  emptySub: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  closeButton: {
    backgroundColor: '#32D6A0',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  closeText: {
    color: '#06251B',
    fontWeight: '600',
    fontSize: 14,
  },
});
