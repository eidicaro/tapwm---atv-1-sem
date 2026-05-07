import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert
} from 'react-native';

import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

async function entrar() {
  try {

    await login(email, senha);

    setTimeout(() => {
      router.replace('/admin');
    }, 0);

  } catch (error: any) {

    console.log(error);

    Alert.alert('Erro', 'Email ou senha inválidos');
  }
}

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#04092B'
      }}
    >
      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        style={{
          backgroundColor: '#fff',
          marginBottom: 10,
          padding: 15,
          borderRadius: 10
        }}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#999"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={{
          backgroundColor: '#fff',
          marginBottom: 10,
          padding: 15,
          borderRadius: 10
        }}
      />

      <Pressable
        onPress={entrar}
        style={{
          backgroundColor: '#144070',
          padding: 15,
          borderRadius: 10
        }}
      >
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          Entrar
        </Text>
      </Pressable>
    </View>
  );
}