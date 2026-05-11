import { View, Text, Image, StyleSheet, useWindowDimensions, Pressable } from 'react-native';

export default function Footer() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>

      {/* Esquerda: marca */}
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

      {/* Divider vertical (apenas desktop) */}
      {!isMobile && <View style={styles.dividerVertical} />}

      {/* Divider horizontal (apenas mobile) */}
      {isMobile && <View style={styles.dividerHorizontal} />}

      {/* Direita: social */}
      <View style={[styles.right, isMobile && styles.rightMobile]}>
        <Text style={styles.contactLabel}>Conecte-se conosco</Text>

        <View style={styles.socials}>
          <Pressable style={ ({hovered}) => [styles.socialBtn, hovered && styles.buttonHover]}>
            <Image
              source={require('../assets/images/linkedin.png')}
              style={styles.icon}
            />
          </Pressable>
          <Pressable style={ ({hovered}) => [styles.socialBtn, hovered && styles.buttonHover]}>
            <Image
              source={require('../assets/images/instagram.png')}
              style={styles.icon}
            />
          </Pressable>
          <Pressable style={ ({hovered}) => [styles.socialBtn, hovered && styles.buttonHover]}>
            <Image
              source={require('../assets/images/facebook.png')}
              style={styles.icon}
            />
          </Pressable>
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
    paddingVertical: 28,
    paddingHorizontal: 40,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },

  containerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  left: {
    maxWidth: '50%',
  },

  leftMobile: {
    maxWidth: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },

  logo: {
    width: 240,
    height: 80,
    marginBottom: 8,
    opacity: 0.9,
  },

  logoMobile: {
    width: 160,
    height: 55,
  },

  subtitle: {
    color: '#5B8AF0',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.85,
  },

  subtitleMobile: {
    textAlign: 'center',
    fontSize: 12,
  },

  dividerVertical: {
    width: 0.5,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  dividerHorizontal: {
    width: '100%',
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },

  right: {
    alignItems: 'flex-end',
    gap: 10,
  },

  rightMobile: {
    alignItems: 'center',
  },

  contactLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  socials: {
    flexDirection: 'row',
    gap: 8,
  },

  socialBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 18,
    height: 18,
    opacity: 0.7,
  },

  buttonHover: {
    backgroundColor: 'rgba(91,138,240,0.15)',
    borderColor: 'rgba(91,138,240,0.5)',
    transitionDuration: '0.2s',
  }
});