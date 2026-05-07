import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={['#04092B', '#0D1F4F', '#144070']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>

        {/* Ícone de cadeado */}
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🔒</Text>
        </View>

        <Text style={styles.title}>Área restrita</Text>
        <Text style={styles.subtitle}>Acesso exclusivo para administradores</Text>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>✉</Text>
          <TextInput
            placeholder="seu@email.com"
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Senha */}
        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>🔑</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.25)"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            style={styles.input}
          />
        </View>

        {/* Botão entrar */}
        <Pressable onPress={entrar} style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(91,138,240,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(91,138,240,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  iconText: {
    fontSize: 24,
  },

  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 6,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    marginBottom: 32,
    lineHeight: 20,
  },

  label: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 2,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 10,
  },

  inputIcon: {
    fontSize: 16,
    opacity: 0.5,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 14,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B8AF0',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  buttonArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '300',
  },
});