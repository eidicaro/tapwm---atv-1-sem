import { View, Text, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Footer() {

  return (
    <View style={styles.container}>
      
      {/* Logo + nome */}
      <View style={styles.esquerda}>
        <Image
          source={require('../assets/images/logo-dtech1.png')}
          style={styles.logo}
        />
        <Text  style={{color: '#fff', textAlign: 'center', fontSize: 18}}>Ajudando a Inovar Vidas</Text>
      </View>

      <View style={styles.direita}>
        <View style={styles.pags}>
          <Image
              source={require('../assets/images/linkedin.png')}
              style={styles.social}
            />
            <Image
              source={require('../assets/images/instagram.png')}
              style={styles.social}
            />
            <Image
              source={require('../assets/images/facebook.png')}
              style={styles.social}
            />
        </View>
        <Text style={{color: '#fff', textAlign: 'center', fontSize: 14}}>Entre em Contato Conosco!</Text>
      </View>
          
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    backgroundColor: '#000',
    flexDirection: 'row',
    marginTop: "auto",
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 300,
    height: 100,
  },
  text:{
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
  },
  pags:{
    flexDirection: 'row',
    width: '20%',
  },
  social: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
  },
  direita:{
    marginRight: '5%',
  },
  esquerda:{
    marginLeft: '5%',
  },
});