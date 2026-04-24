import { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, Pressable, Image } from 'react-native';

import { db } from '../src/backend/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';

import Header from './header';
import Footer from './footer';
import { colors } from './theme';
import { LinearGradient } from 'expo-linear-gradient';


export default function SugestaoScreen() {
  const [termo, setTermo] = useState('');
  const [descricao, setDescricao] = useState('');

  const enviarSugestao = async () => {
    if (!termo) {
      Alert.alert("Preencha o termo");
      return;
    }

    try {
      await addDoc(collection(db, "sugestoes"), {
        termo,
        descricao,
        status: "pendente",
        data: new Date()
      });

      Alert.alert("Sugestão enviada!");
      setTermo('');
      setDescricao('');
    } catch (error) {
      Alert.alert("Erro ao enviar");
    }
  };

  return (
    <LinearGradient
    colors={['#0B0F1A', '#0F172A', '#121826']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ flex: 1 }}
  >
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>
          <View style={styles.titleContainer}>
                    <Text style={styles.title}>Ajude a Crescer</Text>
                    <Text style={styles.title2}>nosso dicionário!</Text>
          </View>

          <TextInput
            placeholder="Digite o termo"
            placeholderTextColor={colors.textSecondary}
            value={termo}
            onChangeText={setTermo}
            style={styles.input}
          />

          <TextInput
            placeholder="Digite a descrição"
            placeholderTextColor={colors.textSecondary}
            value={descricao}
            onChangeText={setDescricao}
            style={[styles.input, { height: 120 }]}
            multiline
          />

          <Pressable style={styles.button} onPress={enviarSugestao}>
            <Image source={require('../assets/images/enviar.png')} style={styles.icon}/>
            <Text style={styles.buttonText}>Enviar Sugestão</Text>
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
    alignItems: 'flex-start',
    marginLeft: '35%',
    marginRight: '35%',
    paddingHorizontal: 20,
  },

  input: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },

  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
    maxWidth: 700,
  },
  title2: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary,
    maxWidth: 700,
  },

  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 150,
    borderRadius: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
  },

  icon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },

});