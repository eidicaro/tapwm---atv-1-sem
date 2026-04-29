import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { colors } from './theme';

export default function Footer() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      
      <View style={[styles.left, isMobile && styles.leftMobile]}>
        <Image
          source={require('../assets/images/logo_lar.png')}
          style={[styles.logo, isMobile && styles.logoMobile]}
          resizeMode="contain"
        />

        <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
          Ajudando a inovar vidas através da tecnologia
        </Text>
      </View>

      <View style={[styles.right, isMobile && styles.rightMobile]}>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  containerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },

  left: {
    maxWidth: '50%',
  },

  leftMobile: {
    maxWidth: '100%',
    alignItems: 'center',
  },

  logo: {
    width: 260,
    height: 90,
    marginBottom: 10,
  },

  logoMobile: {
    width: 180,
    height: 70,
  },

  subtitle: {
    color: '#05ACFF',
    fontSize: 18,
    fontWeight: '700',
  },

  subtitleMobile: {
    textAlign: 'center',
    fontSize: 16,
  },

  right: {
    alignItems: 'flex-end',
  },

  rightMobile: {
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
    width: 36,
    height: 36,
    marginLeft: 10,
  },
});