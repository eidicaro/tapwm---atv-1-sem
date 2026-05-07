import { View, Text, StyleSheet, Dimensions, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';

const { width } = Dimensions.get('window');
const isSmall = width < 500;

export default function Header() {
  const isMobile = width < 768;
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <Image
                  source={require('../assets/images/logo_lar.png')}
                  style={[styles.logo, isMobile && styles.logoMobile]}
                  resizeMode="contain"
                />
        
      </View>

      {/* Nav */}
      <View style={styles.nav}>
        <Link href="/sugestao" asChild>
          <Pressable style={styles.linkBtn}>
            <Text style={styles.linkText}>Sugestão</Text>
          </Pressable>
        </Link>

        <Link href="/" asChild>
          <Pressable style={styles.linkBtn}>
            <Text style={styles.linkText}>Home</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: isSmall ? 64 : 72,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmall ? 14 : 32,
    backgroundColor: 'rgba(5, 10, 30, 0.97)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#5B8AF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },

  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  logoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#5B8AF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoIconText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  logoText: {
    color: '#fff',
    fontSize: isSmall ? 14 : 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  logoAccent: {
    color: '#5B8AF0',
  },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmall ? 6 : 10,
  },

  linkBtn: {
    paddingVertical: isSmall ? 6 : 8,
    paddingHorizontal: isSmall ? 10 : 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(91,138,240,0.25)',
  },

  linkText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: isSmall ? 12 : 13,
    fontWeight: '500',
  },

  
  logo: {
    width: 240,
    height: 80,
    opacity: 0.9,
  },

  logoMobile: {
    width: 160,
    height: 55,
  },
});