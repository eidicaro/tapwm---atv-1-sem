import { View, Text, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Header() {

  return (
    <View style={styles.container}>
      
      {/* Logo + nome */}
      <View>
        <Image
          source={require('../assets/images/logo-dtech.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.pags}>
        {/* Botão voltar */}
      <Link href="/sugestao">
            <Text  style={styles.text}>Ir para Sugestão</Text>
      </Link>
      <Link href="/">
            <Text style={styles.text}>Home</Text>
      </Link>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    width: '100%',
    backgroundColor: '#02071C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
   
    // web
    boxShadow: '0px 8px 0px rgba(0,0,0,0.4)',

    // mobile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 200,
    height: 200,
    marginRight: 10
  },
  text:{
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
  },
  pags:{
    flexDirection: 'row',
    marginRight: '5%',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '20%',
  }
});