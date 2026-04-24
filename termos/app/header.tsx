import { View, Text, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors } from './theme';

export default function Header() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo_lar.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.nav}>
        <Link href="/sugestao">
          <Text style={styles.link}>Sugestão</Text>
        </Link>

        <Link href="/">
          <Text style={styles.link}>Home</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
    backgroundColor: '#080C15',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  logo: {
    width: 150,
    height: 50,
  },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: '10%',
  },
  
  link: {
    color: colors.text,
    fontSize: 15,
    marginLeft: 25,
    fontWeight: '800',
  },
});