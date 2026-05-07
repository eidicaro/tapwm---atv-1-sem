import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
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

  const buscarTermo = async () => {
    if (!busca || busca.trim() === '') return;

    try {
      const querySnapshot = await getDocs(collection(db, 'termos'));
      const termoBusca = busca.toLowerCase();
      const encontrados: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const termo = data?.termo;
        if (typeof termo === 'string' && termo.toLowerCase().includes(termoBusca)) {
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
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>

          {/* Título */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              Aprenda tecnologia{'\n'}
              <Text style={styles.highlight}>sem complicação</Text>
            </Text>
          </View>

          <Text style={styles.subtitle}>
            Explore termos técnicos de forma simples, rápida e prática.
          </Text>

          {/* Campo de busca */}
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
            <Pressable onPress={buscarTermo} style={styles.searchArrow}>
              <Text style={styles.searchArrowText}>→</Text>
            </Pressable>
          </View>

          {/* Botão dicionário completo */}
          <Pressable style={styles.button} onPress={abrirDicionarioCompleto}>
            <Image
              source={require('../../assets/images/livro.png')}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Ver dicionário completo</Text>
          </Pressable>
        </View>

        <Footer />
      </View>

      <ModalScreen
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        termos={resultados}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(91,138,240,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(91,138,240,0.3)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 20,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5B8AF0',
  },

  badgeText: {
    color: '#8aaff5',
    fontSize: 12,
  },

  titleContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 44,
    maxWidth: 600,
  },

  highlight: {
    color: '#5B8AF0',
  },

  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    maxWidth: 460,
    marginBottom: 36,
    lineHeight: 22,
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
    marginBottom: 12,
  },

  inputIcon: {
    width: 18,
    height: 18,
    opacity: 0.5,
    marginRight: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 14,
  },

  searchArrow: {
    paddingLeft: 10,
  },

  searchArrowText: {
    color: '#5B8AF0',
    fontSize: 20,
    fontWeight: '300',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B8AF0',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    maxWidth: 550,
    gap: 8,
    marginBottom: 24,
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

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    maxWidth: 550,
  },

  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },

  statNumber: {
    color: '#5B8AF0',
    fontSize: 20,
    fontWeight: '600',
  },

  statLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 3,
  },
});