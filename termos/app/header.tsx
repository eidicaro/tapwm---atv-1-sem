import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { colors } from './theme';

const { width } = Dimensions.get('window');

const isSmall = width < 500;

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
    height: isSmall ? 75 : 95,
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: isSmall ? 15 : 40,

    backgroundColor: 'rgba(5, 10, 30, 0.92)',

    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',

    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 20,
  },

  logo: {
    width: isSmall ? 120 : 180,
    height: isSmall ? 45 : 60,
  },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmall ? 10 : 22,
  },

  link: {
    color: '#F5FAFF',
    fontSize: isSmall ? 13 : 16,
    fontWeight: '800',
    letterSpacing: 1.2,

    paddingVertical: isSmall ? 8 : 12,
    paddingHorizontal: isSmall ? 12 : 22,

    borderRadius: 14,

    backgroundColor: 'rgba(255,255,255,0.04)',

    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.18)',

    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 10,
  },
});