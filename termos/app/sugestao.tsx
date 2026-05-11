import { useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import { db } from '../src/backend/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';

import Header from './header';
import Footer from './footer';
import { LinearGradient } from 'expo-linear-gradient';

export default function SugestaoScreen() {
  const [termo, setTermo] = useState('');
  const [descricao, setDescricao] = useState('');

  const { width } = useWindowDimensions();

  const mobile = width < 768;

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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

            {/* HERO */}
            <View
              style={[
                styles.heroCard,
                mobile && styles.heroCardMobile,
              ]}
            >
              <View style={styles.heroOrb} />

              <Text style={styles.preLabel}>
                Contribua
              </Text>

              <Text
                style={[
                  styles.heroTitle,
                  mobile && styles.heroTitleMobile,
                ]}
              >
                Ajude a{'\n'}crescer{' '}
                <Text style={styles.heroTitleAccent}>
                  nosso{'\n'}dicionário!
                </Text>
              </Text>

              <Text style={styles.heroSubtitle}>
                Conhece um termo que não está aqui?
                Nos conta!
              </Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>

              <Text style={styles.label}>TERMO</Text>

              <TextInput
                placeholder="Ex: Machine Learning"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={termo}
                onChangeText={setTermo}
                style={[
                  styles.input,
                  termo.length > 0 && styles.inputFocused,
                ]}
              />

              <Text style={styles.label}>DESCRIÇÃO</Text>

              <TextInput
                placeholder="Descreva o significado do termo..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                style={[
                  styles.input,
                  styles.inputMultiline,
                  descricao.length > 0 &&
                    styles.inputFocused,
                ]}
              />

              <Pressable
                style={({ pressed, hovered }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  hovered && styles.buttonHover,
                ]}
                onPress={enviarSugestao}
              >
                <Text style={styles.buttonText}>
                  ✈ Enviar sugestão
                </Text>
              </Pressable>

            </View>
          </View>
        </ScrollView>

        <Footer />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 18,
    width: '100%',
  },

  /* HERO */

  heroCard: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#0A0F2E',
    borderRadius: 24,
    padding: 28,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(91,138,240,0.15)',
  },

  heroCardMobile: {
    padding: 20,
    borderRadius: 20,
  },

  heroOrb: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(91,138,240,0.12)',
    top: -40,
    right: -40,
  },

  preLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 1,
  },

  heroTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 42,
    marginBottom: 12,
  },

  heroTitleMobile: {
    fontSize: 26,
    lineHeight: 32,
  },

  heroTitleAccent: {
    color: '#5B8AF0',
    fontStyle: 'italic',
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    lineHeight: 22,
  },

  /* FORM */

  form: {
    width: '100%',
    maxWidth: 560,
  },

  label: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
    letterSpacing: 1,
  },

  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  inputFocused: {
    borderColor: 'rgba(91,138,240,0.5)',
    backgroundColor: 'rgba(91,138,240,0.07)',
  },

  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  button: {
    width: '100%',
    backgroundColor: '#5B8AF0',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  buttonHover: {
    backgroundColor: 'rgba(91, 138, 240, 0.85)',
    transform: [{ scale: 1.02 }],
    transitionDuration: '0.4s',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});