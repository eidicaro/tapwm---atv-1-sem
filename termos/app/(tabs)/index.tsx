import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from 'react-native';

import Header from '../header';
import Footer from '../footer';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import ModalScreen from '../modal';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/backend/firebaseconfig';

export default function HomeScreen() {
  const [busca, setBusca] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);

  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1200;

  const buscarTermo = async () => {
    if (!busca || busca.trim() === '') return;

    try {
      const querySnapshot = await getDocs(collection(db, 'termos'));
      const termoBusca = busca.toLowerCase();
      const encontrados: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const termo = data?.termo;

        if (
          typeof termo === 'string' &&
          termo.toLowerCase().includes(termoBusca)
        ) {
          encontrados.push(data);
        }
      });

      setResultados(encontrados);
      setModalVisible(true);
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  };

  const abrirDicionarioCompleto = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'termos'));
      const todos: any[] = [];

      querySnapshot.forEach((doc) => todos.push(doc.data()));

      setResultados(todos);
      setModalVisible(true);
    } catch (error) {
      console.error('Erro ao carregar termos:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#04092B', '#0D1F4F', '#144070']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Header />

          <View
            style={[
              styles.content,
              isMobile && styles.contentMobile,
              isTablet && styles.contentTablet,
            ]}
          >
            <View
              style={[
                styles.titleContainer,
                isMobile && styles.titleContainerMobile,
              ]}
            >
              <Text
                style={[styles.title, isMobile && styles.titleMobile]}
              >
                Aprenda tecnologia{'\n'}
                <Text style={styles.highlight}>
                  sem complicação
                </Text>
              </Text>
            </View>

            <Text
              style={[
                styles.subtitle,
                isMobile && styles.subtitleMobile,
              ]}
            >
              Explore termos técnicos de forma simples,
              rápida e prática.
            </Text>

            <View style={styles.inputContainer}>
              <Image
                source={require('../../assets/images/lupa.png')}
                style={styles.inputIcon}
              />

              <TextInput
                placeholder="Digite o termo..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={busca}
                onChangeText={setBusca}
                onSubmitEditing={buscarTermo}
              />

              <Pressable
                onPress={buscarTermo}
                style={styles.searchArrow}
              >
                <Text style={styles.searchArrowText}>→</Text>
              </Pressable>
            </View>

            <Pressable
              style={({ hovered }) => [
                styles.button,
                hovered && !isMobile && styles.buttonHover,
              ]}
              onPress={abrirDicionarioCompleto}
            >
              <Image
                source={require('../../assets/images/livro.png')}
                style={styles.buttonIcon}
              />

              <Text style={styles.buttonText}>
                Ver dicionário completo
              </Text>
            </Pressable>
          </View>

          <Footer />
        </View>
      </ScrollView>

      <ModalScreen
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        termos={resultados}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    minHeight: '100vh',
  },

  scroll: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '100%',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '40%',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  contentTablet: {
    width: '65%',
  },

  contentMobile: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  titleContainer: {
    marginBottom: 12,
  },

  titleContainerMobile: {
    alignItems: 'center',
  },

  title: {
    fontSize: 52,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 62,
    textAlign: 'left',
  },

  titleMobile: {
    fontSize: 34,
    lineHeight: 42,
    textAlign: 'center',
  },

  highlight: {
    color: '#5B8AF0',
  },

  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    maxWidth: 520,
    lineHeight: 26,
    marginBottom: 36,
  },

  subtitleMobile: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
  },

  inputContainer: {
    width: '100%',
    maxWidth: 550,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  inputIcon: {
    width: 18,
    height: 18,
    opacity: 0.5,
    marginRight: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 14,
  },

  searchArrow: {
    paddingLeft: 10,
  },

  searchArrowText: {
    color: '#5B8AF0',
    fontSize: 22,
    fontWeight: '300',
  },

  button: {
    width: '100%',
    maxWidth: 550,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B8AF0',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 8,
  },

  buttonHover: {
    backgroundColor: 'rgba(91,138,240,0.85)',
    transform: [{ scale: 1.02 }],
    transitionDuration: '0.3s',
  },

  buttonIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});