import { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { Pressable} from 'react-native';

import { db } from '../src/backend/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';

import Header from './header';
import Footer from './footer';

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
        placeholderTextColor="#000"
        value={termo}
        onChangeText={setTermo}
        style={styles.input}
      />

      <TextInput
        placeholder="Descrição"
        placeholderTextColor="#000"
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

      <Footer></Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  title: {
    color: "#000",
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
    color: "#fff",

        // web
        boxShadow: '0px 3px 3px rgba(0,0,0,0.7)',

        // mobile
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 6,
        elevation: 8
  },
  button:{
    padding: 20,
    maxWidth:'70%',
    marginHorizontal: '35%',
    marginBottom: '1%',
    backgroundColor: '#1a80b6',
    borderRadius: 40,

       // web
       boxShadow: '0px 8px 10px rgba(0,0,0,0.5)',

       // mobile
       shadowColor: '#000',
       shadowOffset: { width: 8, height: 8 },
       shadowOpacity: 0.5,
       shadowRadius: 6,
       elevation: 8
  },
  buttonText:{
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
