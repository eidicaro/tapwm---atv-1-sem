import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { colors } from './theme';

type Termo = {
  termo: string;
  descricao: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  termos: Termo[];
};

export default function ModalScreen({ visible, onClose, termos }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Dicionário</Text>

          <ScrollView>
            {termos.length > 0 ? (
              termos.map((item, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.term}>{item.termo}</Text>
                  <Text style={styles.desc}>{item.descricao}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>Nenhum termo encontrado.</Text>
            )}
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={onClose}>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },

  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: colors.input,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  term: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },

  desc: {
    color: colors.textSecondary,
    marginTop: 4,
  },

  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },

  closeButton: {
    marginTop: 15,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});