import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  Alert
} from 'react-native';

import { db } from '../src/backend/firebaseconfig';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './theme';
import Header from './header';
import Footer from './footer';

export default function AdminScreen() {
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [termos, setTermos] = useState<any[]>([]);

  const [modalSugestoes, setModalSugestoes] = useState(false);
  const [modalCriar, setModalCriar] = useState(false);
  const [modalTermos, setModalTermos] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  const [novoTermo, setNovoTermo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');

  const [termoEditando, setTermoEditando] = useState<any>(null);
  const [novaDescricaoEdit, setNovaDescricaoEdit] = useState('');

  useEffect(() => {
    carregarSugestoes();
    carregarTermos();
  }, []);

  // ================= LOAD =================
  const carregarSugestoes = async () => {
    try {
      const snapshot = await getDocs(collection(db, "sugestoes"));
      const lista: any[] = [];

      snapshot.forEach((docItem) => {
        const data = docItem.data();
        if (data.status === "pendente") {
          lista.push({ id: docItem.id, ...data });
        }
      });

      setSugestoes(lista);
    } catch (error) {
      Alert.alert("Erro ao carregar sugestões");
    }
  };

  const carregarTermos = async () => {
    try {
      const snapshot = await getDocs(collection(db, "termos"));
      const lista: any[] = [];

      snapshot.forEach((docItem) => {
        lista.push({ id: docItem.id, ...docItem.data() });
      });

      setTermos(lista);
    } catch (error) {
      Alert.alert("Erro ao carregar termos");
    }
  };

  // ================= APROVAR =================
  const aprovarSugestao = async (item: any) => {
    try {
      await addDoc(collection(db, "termos"), {
        termo: item.termo.toLowerCase(),
        descricao: item.descricao
      });

      await updateDoc(doc(db, "sugestoes", item.id), {
        status: "aprovado"
      });

      carregarSugestoes();
      carregarTermos();
    } catch {
      Alert.alert("Erro ao aprovar");
    }
  };

  // ================= REJEITAR =================
  const rejeitarSugestao = async (id: string) => {
    try {
      await updateDoc(doc(db, "sugestoes", id), {
        status: "rejeitado"
      });

      carregarSugestoes();
    } catch {
      Alert.alert("Erro ao rejeitar");
    }
  };

  // ================= CRIAR =================
  const criarTermo = async () => {
    if (!novoTermo) {
      Alert.alert("Digite um termo");
      return;
    }

    try {
      await addDoc(collection(db, "termos"), {
        termo: novoTermo.toLowerCase(),
        descricao: novaDescricao
      });

      setNovoTermo('');
      setNovaDescricao('');
      setModalCriar(false);

      carregarTermos();
    } catch {
      Alert.alert("Erro ao criar termo");
    }
  };

  // ================= ABRIR EDIÇÃO =================
  const abrirEditar = (item: any) => {
    setTermoEditando(item);
    setNovaDescricaoEdit(item.descricao);
    setModalEditar(true);
  };

  // ================= SALVAR EDIÇÃO =================
  const salvarEdicao = async () => {
    if (!novaDescricaoEdit) return;

    try {
      await updateDoc(doc(db, "termos", termoEditando.id), {
        descricao: novaDescricaoEdit
      });

      setModalEditar(false);
      setTermoEditando(null);

      carregarTermos();
    } catch {
      Alert.alert("Erro ao editar");
    }
  };

  // ================= DELETAR =================
  const deletarTermo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "termos", id));
      carregarTermos();
    } catch {
      Alert.alert("Erro ao deletar");
    }
  };

  return (
    <LinearGradient colors={['#04092B', '#0D1F4F', '#144070']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>
          <Pressable style={styles.button} onPress={() => setModalSugestoes(true)}>
            <Text style={styles.buttonText}>📥 Ver Sugestões</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => setModalCriar(true)}>
            <Text style={styles.buttonText}>➕ Criar Termo</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => setModalTermos(true)}>
            <Text style={styles.buttonText}>📚 Ver Termos</Text>
          </Pressable>
        </View>

        {/* MODAL SUGESTÕES */}
        <Modal visible={modalSugestoes} animationType="slide">
          <View style={styles.modal}>
            <Text style={styles.title}>Sugestões</Text>

            <FlatList
              data={sugestoes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.termo}</Text>
                  <Text style={styles.cardText}>{item.descricao}</Text>

                  <View style={styles.row}>
                    <Pressable style={styles.approve} onPress={() => aprovarSugestao(item)}>
                      <Text style={styles.btnText}>Aprovar</Text>
                    </Pressable>

                    <Pressable style={styles.reject} onPress={() => rejeitarSugestao(item.id)}>
                      <Text style={styles.btnText}>Rejeitar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />

            <Pressable onPress={() => setModalSugestoes(false)}>
              <Text style={styles.close}>Fechar</Text>
            </Pressable>
          </View>
        </Modal>

        {/* MODAL CRIAR */}
        <Modal visible={modalCriar} animationType="slide">
          <View style={styles.modal}>
            <Text style={styles.title}>Criar Termo</Text>

            <TextInput
              placeholder="Termo"
              value={novoTermo}
              onChangeText={setNovoTermo}
              style={styles.input}
            />

            <TextInput
              placeholder="Descrição"
              value={novaDescricao}
              onChangeText={setNovaDescricao}
              style={[styles.input, { height: 100 }]}
              multiline
            />

            <Pressable style={styles.create} onPress={criarTermo}>
              <Text style={styles.btnText}>Salvar</Text>
            </Pressable>

            <Pressable onPress={() => setModalCriar(false)}>
              <Text style={styles.close}>Fechar</Text>
            </Pressable>
          </View>
        </Modal>

        {/* MODAL TERMOS */}
        <Modal visible={modalTermos} animationType="slide">
          <View style={styles.modal}>
            <Text style={styles.title}>Termos</Text>

            <FlatList
              data={termos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.termo}</Text>
                  <Text style={styles.cardText}>{item.descricao}</Text>

                  <View style={styles.row}>
                    <Pressable style={styles.edit} onPress={() => abrirEditar(item)}>
                      <Text style={styles.btnText}>Editar</Text>
                    </Pressable>

                    <Pressable style={styles.delete} onPress={() => deletarTermo(item.id)}>
                      <Text style={styles.btnText}>Deletar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />

            <Pressable onPress={() => setModalTermos(false)}>
              <Text style={styles.close}>Fechar</Text>
            </Pressable>
          </View>
        </Modal>

        {/* MODAL EDITAR */}
        <Modal visible={modalEditar} animationType="slide">
          <View style={styles.modal}>
            <Text style={styles.title}>Editar Termo</Text>

            <Text style={{ color: '#aaa', marginBottom: 10 }}>
              {termoEditando?.termo}
            </Text>

            <TextInput
              value={novaDescricaoEdit}
              onChangeText={setNovaDescricaoEdit}
              style={[styles.input, { height: 100 }]}
              multiline
            />

            <Pressable style={styles.create} onPress={salvarEdicao}>
              <Text style={styles.btnText}>Salvar</Text>
            </Pressable>

            <Pressable onPress={() => setModalEditar(false)}>
              <Text style={styles.close}>Cancelar</Text>
            </Pressable>
          </View>
        </Modal>

      </View>
    </LinearGradient>
  );
}

// estilos continuam iguais (pode manter os seus)

// ================= 🎨 ESTILO =================
const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15
  },

  button: {
    backgroundColor: '#144070',
    padding: 15,
    borderRadius: 12,
    width: 250,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  modal: {
    flex: 1,
    padding: 20,
    backgroundColor: '#04092B'
  },

  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15
  },

  card: {
    backgroundColor: '#1E2A5A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },

  cardTitle: {
    color: '#fff',
    fontWeight: 'bold'
  },

  cardText: {
    color: '#ccc'
  },

  row: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10
  },

  input: {
    backgroundColor: '#1E2A5A',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  approve: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8
  },

  reject: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8
  },

  edit: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8
  },

  delete: {
    backgroundColor: '#c0392b',
    padding: 10,
    borderRadius: 8
  },

  create: {
    backgroundColor: '#144070',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  close: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20
  }
});