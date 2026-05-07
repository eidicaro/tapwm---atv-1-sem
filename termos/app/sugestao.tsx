import { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, Pressable } from 'react-native';

import { db } from '../src/backend/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';

import Header from './header';
import Footer from './footer';
import { LinearGradient } from 'expo-linear-gradient';

export default function SugestaoScreen() {
  const [termo, setTermo] = useState('');
  const [descricao, setDescricao] = useState('');

  const enviarSugestao = async () => {
    if (!termo) {
      Alert.alert('Preencha o termo');
      return;
    }

    try {
      await addDoc(collection(db, 'sugestoes'), {
        termo,
        descricao,
        status: 'pendente',
        data: new Date(),
      });

      Alert.alert('Sugestão enviada!');
      setTermo('');
      setDescricao('');
    } catch (error) {
      Alert.alert('Erro ao enviar');
    }
  };

  return (
    <LinearGradient
      colors={['#04092B', '#0D1F4F', '#144070']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>

          {/* Cabeçalho da página */}
          <View style={styles.titleContainer}>
            <Text style={styles.preLabel}>Contribua</Text>
            <Text style={styles.title}>Ajude a crescer</Text>
            <Text style={styles.titleAccent}>nosso dicionário!</Text>
            <Text style={styles.subtitle}>
              Conhece um termo técnico que não está aqui? Nos conte!
            </Text>
          </View>

          {/* Campo: Termo */}
          <Text style={styles.label}>Termo</Text>
          <TextInput
            placeholder="Ex: Machine Learning"
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={termo}
            onChangeText={setTermo}
            style={styles.input}
          />

          {/* Campo: Descrição */}
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            placeholder="Descreva o significado do termo..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={descricao}
            onChangeText={setDescricao}
            style={[styles.input, styles.inputMultiline]}
            multiline
          />

          {/* Botão enviar */}
          <Pressable style={styles.button} onPress={enviarSugestao}>
            <Text style={styles.buttonIcon}>✈</Text>
            <Text style={styles.buttonText}>Enviar sugestão</Text>
          </Pressable>

        </View>

        <Footer />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },

  titleContainer: {
    width: '100%',
    maxWidth: 560,
    marginBottom: 28,
  },

  preLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    letterSpacing: 0.08,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  title: {
    fontSize: 34,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 42,
  },

  titleAccent: {
    fontSize: 34,
    fontWeight: '600',
    color: '#5B8AF0',
    lineHeight: 42,
    marginBottom: 12,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    lineHeight: 22,
  },

  label: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 6,
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 560,
    marginLeft: 2,
  },

  input: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    color: '#fff',
    fontSize: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  inputMultiline: {
    height: 120,
    textAlignVertical: 'top',
  },

  button: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5B8AF0',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
    gap: 8,
  },

  buttonIcon: {
    fontSize: 16,
    color: '#fff',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});