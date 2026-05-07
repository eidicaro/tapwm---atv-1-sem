import { useEffect, useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import {
  View, Text, Pressable, FlatList, StyleSheet,
  TextInput, Modal, Alert,
} from 'react-native';

import { db } from '../src/backend/firebaseconfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import Header from './header';
import Footer from './footer';

export default function AdminScreen() {
  const router = useRouter();

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
      const snapshot = await getDocs(collection(db, 'sugestoes'));
      const lista: any[] = [];
      snapshot.forEach((docItem) => {
        const data = docItem.data();
        if (data.status === 'pendente') lista.push({ id: docItem.id, ...data });
      });
      setSugestoes(lista);
    } catch {
      Alert.alert('Erro ao carregar sugestões');
    }
  };

  const carregarTermos = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'termos'));
      const lista: any[] = [];
      snapshot.forEach((docItem) => lista.push({ id: docItem.id, ...docItem.data() }));
      setTermos(lista);
    } catch {
      Alert.alert('Erro ao carregar termos');
    }
  };

  // ================= APROVAR =================
  const aprovarSugestao = async (item: any) => {
    try {
      await addDoc(collection(db, 'termos'), {
        termo: item.termo.toLowerCase(),
        descricao: item.descricao,
      });
      await updateDoc(doc(db, 'sugestoes', item.id), { status: 'aprovado' });
      carregarSugestoes();
      carregarTermos();
    } catch {
      Alert.alert('Erro ao aprovar');
    }
  };

  // ================= REJEITAR =================
  const rejeitarSugestao = async (id: string) => {
    try {
      await updateDoc(doc(db, 'sugestoes', id), { status: 'rejeitado' });
      carregarSugestoes();
    } catch {
      Alert.alert('Erro ao rejeitar');
    }
  };

  // ================= CRIAR =================
  const criarTermo = async () => {
    if (!novoTermo) { Alert.alert('Digite um termo'); return; }
    try {
      await addDoc(collection(db, 'termos'), {
        termo: novoTermo.toLowerCase(),
        descricao: novaDescricao,
      });
      setNovoTermo('');
      setNovaDescricao('');
      setModalCriar(false);
      carregarTermos();
    } catch {
      Alert.alert('Erro ao criar termo');
    }
  };

  // ================= EDITAR =================
  const abrirEditar = (item: any) => {
    setTermoEditando(item);
    setNovaDescricaoEdit(item.descricao);
    setModalEditar(true);
  };

  const salvarEdicao = async () => {
    if (!novaDescricaoEdit) return;
    try {
      await updateDoc(doc(db, 'termos', termoEditando.id), { descricao: novaDescricaoEdit });
      setModalEditar(false);
      setTermoEditando(null);
      carregarTermos();
    } catch {
      Alert.alert('Erro ao editar');
    }
  };

  // ================= DELETAR =================
  const deletarTermo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'termos', id));
      carregarTermos();
    } catch {
      Alert.alert('Erro ao deletar');
    }
  };

  // ========== ROTA PROTEGIDA =============
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setTimeout(() => { router.replace('/login'); }, 0);
    }
  }, [user, loading]);

  if (loading || !user) return null;

  return (
    <LinearGradient colors={['#04092B', '#0D1F4F', '#144070']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>

          {/* Saudação */}
          <Text style={styles.greeting}>Olá, admin 👋</Text>
          <Text style={styles.greetingSub}>Gerencie termos e sugestões da comunidade</Text>

          <Text style={styles.sectionLabel}>Ações</Text>

          {/* Cards de ação */}
          <Pressable style={styles.actionCard} onPress={() => setModalSugestoes(true)}>
            <View style={[styles.actionIcon, styles.iconAmber]}>
              <Text style={styles.actionEmoji}>📥</Text>
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Sugestões</Text>
              <Text style={styles.actionDesc}>Revisar pendentes</Text>
            </View>
            {sugestoes.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{sugestoes.length}</Text>
              </View>
            )}
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => setModalCriar(true)}>
            <View style={[styles.actionIcon, styles.iconBlue]}>
              <Text style={styles.actionEmoji}>➕</Text>
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Criar termo</Text>
              <Text style={styles.actionDesc}>Adicionar ao dicionário</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => setModalTermos(true)}>
            <View style={[styles.actionIcon, styles.iconGreen]}>
              <Text style={styles.actionEmoji}>📚</Text>
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Ver termos</Text>
              <Text style={styles.actionDesc}>Editar ou remover</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <View style={styles.divider} />

          {/* Logout */}
          <Pressable
            style={styles.logoutBtn}
            onPress={async () => { await logout(); router.replace('/'); }}
          >
            <Text style={styles.logoutText}>Sair da conta</Text>
          </Pressable>
        </View>

        {/* ── MODAL SUGESTÕES ── */}
        <Modal visible={modalSugestoes} animationType="slide">
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sugestões</Text>
              <Pressable style={styles.modalCloseBtn} onPress={() => setModalSugestoes(false)}>
                <Text style={styles.modalCloseTxt}>✕</Text>
              </Pressable>
            </View>

            <FlatList
              data={sugestoes}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={styles.emptyTxt}>Nenhuma sugestão pendente.</Text>}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.termo}</Text>
                  <Text style={styles.cardText}>{item.descricao}</Text>
                  <View style={styles.row}>
                    <Pressable style={styles.btnApprove} onPress={() => aprovarSugestao(item)}>
                      <Text style={styles.btnText}>✓ Aprovar</Text>
                    </Pressable>
                    <Pressable style={styles.btnReject} onPress={() => rejeitarSugestao(item.id)}>
                      <Text style={styles.btnText}>✕ Rejeitar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          </View>
        </Modal>

        {/* ── MODAL CRIAR ── */}
        <Modal visible={modalCriar} animationType="slide">
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Termo</Text>
              <Pressable style={styles.modalCloseBtn} onPress={() => setModalCriar(false)}>
                <Text style={styles.modalCloseTxt}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Termo</Text>
            <TextInput
              placeholder="Ex: kubernetes"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={novoTermo}
              onChangeText={setNovoTermo}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              placeholder="Descreva o termo..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={novaDescricao}
              onChangeText={setNovaDescricao}
              style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
              multiline
            />

            <Pressable style={styles.primaryBtn} onPress={criarTermo}>
              <Text style={styles.primaryBtnText}>Salvar termo</Text>
            </Pressable>
          </View>
        </Modal>

        {/* ── MODAL TERMOS ── */}
        <Modal visible={modalTermos} animationType="slide">
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Termos</Text>
              <Pressable style={styles.modalCloseBtn} onPress={() => setModalTermos(false)}>
                <Text style={styles.modalCloseTxt}>✕</Text>
              </Pressable>
            </View>

            <FlatList
              data={termos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.termo}</Text>
                  <Text style={styles.cardText}>{item.descricao}</Text>
                  <View style={styles.row}>
                    <Pressable style={styles.btnEdit} onPress={() => abrirEditar(item)}>
                      <Text style={styles.btnText}>✎ Editar</Text>
                    </Pressable>
                    <Pressable style={styles.btnDelete} onPress={() => deletarTermo(item.id)}>
                      <Text style={styles.btnText}>✕ Deletar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          </View>
        </Modal>

        {/* ── MODAL EDITAR ── */}
        <Modal visible={modalEditar} animationType="slide">
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Termo</Text>
              <Pressable style={styles.modalCloseBtn} onPress={() => setModalEditar(false)}>
                <Text style={styles.modalCloseTxt}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.editingTermLabel}>{termoEditando?.termo}</Text>

            <Text style={styles.inputLabel}>Nova descrição</Text>
            <TextInput
              value={novaDescricaoEdit}
              onChangeText={setNovaDescricaoEdit}
              style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
              multiline
            />

            <Pressable style={styles.primaryBtn} onPress={salvarEdicao}>
              <Text style={styles.primaryBtnText}>Salvar alterações</Text>
            </Pressable>
          </View>
        </Modal>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
  },

  greeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },

  greetingSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    marginBottom: 28,
    lineHeight: 20,
  },

  sectionLabel: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    letterSpacing: 0.07,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconAmber: { backgroundColor: 'rgba(239,159,39,0.15)' },
  iconBlue: { backgroundColor: 'rgba(91,138,240,0.15)' },
  iconGreen: { backgroundColor: 'rgba(29,158,117,0.15)' },

  actionEmoji: { fontSize: 20 },

  actionInfo: { flex: 1 },

  actionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  actionDesc: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginTop: 2,
  },

  badge: {
    backgroundColor: 'rgba(226,75,74,0.18)',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },

  badgeText: {
    color: '#E24B4A',
    fontSize: 11,
    fontWeight: '600',
  },

  chevron: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 22,
    fontWeight: '300',
  },

  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 16,
  },

  logoutBtn: {
    backgroundColor: 'rgba(226,75,74,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(226,75,74,0.25)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  logoutText: {
    color: '#E24B4A',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Modais ──
  modal: {
    flex: 1,
    padding: 22,
    backgroundColor: '#04092B',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },

  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCloseTxt: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  cardTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'capitalize',
  },

  cardText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    lineHeight: 18,
  },

  row: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  inputLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 2,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    padding: 13,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 14,
  },

  editingTermLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  primaryBtn: {
    backgroundColor: '#5B8AF0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  btnApprove: {
    backgroundColor: 'rgba(29,158,117,0.2)',
    borderWidth: 0.5,
    borderColor: 'rgba(29,158,117,0.4)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9,
  },

  btnReject: {
    backgroundColor: 'rgba(226,75,74,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(226,75,74,0.35)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9,
  },

  btnEdit: {
    backgroundColor: 'rgba(91,138,240,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(91,138,240,0.35)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9,
  },

  btnDelete: {
    backgroundColor: 'rgba(192,57,43,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(192,57,43,0.35)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9,
  },

  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },

  emptyTxt: {
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 13,
  },
});