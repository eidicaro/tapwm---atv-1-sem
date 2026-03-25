import { View, Text, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Header() {

  return (
    <View style={styles.container}>
      
      {/* Logo + nome */}
      <View>
        <Image
          source={require('../assets/images/logo_lar.png')}
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
    backgroundColor: 'rgba(26,144,182, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
   
    // web
    boxShadow: '0px 4px 5px rgba(0,0,0,0.3)',

    // mobile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 200,
    height: 60,
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