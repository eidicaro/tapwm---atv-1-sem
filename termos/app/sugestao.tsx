import { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { Pressable} from 'react-native';

import { db } from '../src/backend/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';

import Header from './header';

export default function SugestaoScreen() {
  const [termo, setTermo] = useState('');
  const [descricao, setDescricao] = useState('');

  const enviarSugestao = async () => {
    if (!termo) {
      Alert.alert("Preencha termo");
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
      console.error(error);
      Alert.alert("Erro ao enviar");
    }
  };

  return (
    <View style={styles.container}>
      <Header></Header>

      <Text style={styles.title}>Conhece algum termo e ele não está aqui? Sem Problemas!
      nos mande qual é o termo e seu significado que iremos adicioná-lo ao nosso dicionário
      </Text>

      <TextInput
        placeholder="Digite o Termo"
        placeholderTextColor="#fff"
        value={termo}
        onChangeText={setTermo}
        style={styles.input}
      />

      <TextInput
        placeholder="Descrição"
        placeholderTextColor="#fff"
        value={descricao}
        onChangeText={setDescricao}
        style={styles.input}
      />

      <Pressable
        onPress={enviarSugestao}
        style={({ pressed }) => [
          styles.button,
          { opacity: pressed ? 0.6 : 1 }
        ]}
      >
        <Text style={styles.buttonText}>Enviar Sugestão</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02071C"
  },
  title: {
    color: "#fff",
    fontSize: 20,
    textAlign: 'center',
    margin: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: 'rgba(159, 162, 186, 0.23)',
    borderRadius: 40,
    maxWidth: '60%',
    marginHorizontal: '20%',
    padding: 20,
    marginBottom: 40,
    color: "#fff"
  },
  button:{
    padding: 20,
    maxWidth:'70%',
    marginHorizontal: '35%',
    backgroundColor: '#044CF7',
    borderRadius: 40,
  },
  buttonText:{
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
