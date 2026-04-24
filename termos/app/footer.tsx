import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from './theme';

export default function Footer() {
  return (
    <View style={styles.container}>
      
      <View style={styles.left}>
        <Image
          source={require('../assets/images/logo_lar.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.subtitle}>
          Ajudando a inovar vidas através da tecnologia
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.contact}>Conecte-se conosco</Text>

        <View style={styles.socials}>
          <Image source={require('../assets/images/linkedin.png')} style={styles.icon} />
          <Image source={require('../assets/images/instagram.png')} style={styles.icon} />
          <Image source={require('../assets/images/facebook.png')} style={styles.icon} />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#080C15',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  left: {
    maxWidth: '50%',
  },

  logo: {
    width: 320,
    height: 100,
    marginBottom: 10,
  },

  subtitle: {
    color: '#05ACFF',
    fontSize: 18,
    fontWeight: '700'
  },

  right: {
    alignItems: 'center',
  },

  contact: {
    color: colors.text,
    marginBottom: 10,
    fontSize: 18,
  },

  socials: {
    flexDirection: 'row',
  },

  icon: {
    width: 42,
    height: 42,
    marginLeft: 12,
  },
});