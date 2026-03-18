import { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';

import { db } from '../src/backend/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';

export default function SugestaoScreen() {
  const [termo, setTermo] = useState('');
  const [traducao, setTraducao] = useState('');
  const [descricao, setDescricao] = useState('');

  const enviarSugestao = async () => {
    if (!termo || !traducao) {
      Alert.alert("Preencha termo e tradução!");
      return;
    }

    try {
      await addDoc(collection(db, "sugestoes"), {
        termo,
        traducao,
        descricao,
        status: "pendente",
        data: new Date()
      });

      Alert.alert("Sugestão enviada!");

      setTermo('');
      setTraducao('');
      setDescricao('');
    } catch (error) {
      console.error(error);
      Alert.alert("Erro ao enviar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sugerir novo termo</Text>

      <TextInput
        placeholder="Termo em inglês"
        placeholderTextColor="#999"
        value={termo}
        onChangeText={setTermo}
        style={styles.input}
      />

      <TextInput
        placeholder="Tradução"
        placeholderTextColor="#999"
        value={traducao}
        onChangeText={setTraducao}
        style={styles.input}
      />

      <TextInput
        placeholder="Descrição"
        placeholderTextColor="#999"
        value={descricao}
        onChangeText={setDescricao}
        style={styles.input}
      />

      <Button title="Enviar Sugestão" onPress={enviarSugestao} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000"
  },
  title: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    padding: 12,
    marginBottom: 12,
    color: "#fff"
  }
});
