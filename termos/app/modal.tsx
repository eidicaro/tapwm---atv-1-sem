import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from './theme';

export default function ModalScreen() {
  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Dicionário</Text>

        <ScrollView>
          <Text style={styles.letter}>A</Text>

          <View style={styles.card}>
            <Text style={styles.term}>API</Text>
            <Text style={styles.desc}>
              Interface que permite comunicação entre sistemas
            </Text>
          </View>

        </ScrollView>
      </View>
    </View>
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
    width: '80%',
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
  },

  letter: {
    color: colors.primary,
    fontSize: 18,
    marginTop: 10,
  },

  card: {
    backgroundColor: colors.input,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  term: {
    color: colors.text,
    fontWeight: 'bold',
  },

  desc: {
    color: colors.textSecondary,
  },
});