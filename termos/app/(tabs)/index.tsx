import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import Header from '../header';
import Footer from '../footer';
import { colors } from '../theme';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


export default function HomeScreen() {
  return (

  <LinearGradient
    colors={['#0B0F1A', '#0F172A', '#121826']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ flex: 1 }}
  >
    
  <View style={styles.container}>
        <Header />

        <View style={styles.content}>
        <View style={styles.titleContainer}>
          <View style={styles.bar} />

          <Text style={styles.title}>
            Aprenda tecnologia{' '}
            <Text style={styles.highlight}>sem complicação</Text>
          </Text>
        </View>

          <Text style={styles.subtitle}>
            Explore termos técnicos de forma simples, rápida e prática.
          </Text>

        <View style={styles.inputContainer}>
          
          <Image
            source={require('../../assets/images/lupa.png')}
            style={styles.icon}
          />

          <TextInput
            placeholder="Digite o termo..."
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />

        </View>

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Ver dicionário completo</Text>
            <Image
            source={require('../../assets/images/livro.png')}
            style={styles.icon}
          />
          </Pressable>
        </View>

        <Footer />
      </View>
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
    paddingHorizontal: 20,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  bar: {
    width: 4,
    height: 50,
    backgroundColor: '#fff',
    marginRight: 12,
    borderRadius: 2,
  },
  
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    maxWidth: 700,
  },
  
  highlight: {
    color: colors.primary,
  },

  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 500,
    marginBottom: 40,
  },

  inputContainer: {
    width: '100%',
    maxWidth: 550,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 22,
    marginBottom: '3%',
  },
  
  input: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
  },

  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 100,
    borderRadius: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
  },

  icon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
});