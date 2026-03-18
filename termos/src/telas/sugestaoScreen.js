import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';

import { db } from '../services/firebaseConfig';
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
        termo: termo,
        traducao: traducao,
        descricao: descricao,
        status: "pendente",
        data: new Date()
      });

      Alert.alert("Sugestão enviada com sucesso!");

      // limpa campos
      setTermo('');
      setTraducao('');
      setDescricao('');

    } catch (error) {
      console.error(error);
      Alert.alert("Erro ao enviar");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Termo em inglês"
        value={termo}
        onChangeText={setTermo}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Tradução"
        value={traducao}
        onChangeText={setTraducao}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Button title="Enviar Sugestão" onPress={enviarSugestao} />
    </View>
  );
}