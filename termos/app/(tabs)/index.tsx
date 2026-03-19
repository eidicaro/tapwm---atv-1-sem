import { StyleSheet } from 'react-native';
import Header from '../header';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#02071C' }}>
      <Header></Header>

      <Text style={{fontSize: 80, fontWeight: "900", color: "#fff", textAlign: 'center'}}>Cabeça lindão</Text>
      <Text style={styles.text}>Somos uma pequena iniciativa que deseja ajudar iniciantes na área de tecnologia a compreender melhor os termos; o que eles significam e como se pronuncia corretamente.
      Aqui você poderá encontrar as principais termologias usadas no mundo tecnológico</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text:{
    color: '#fff',
    fontSize: 16,
    maxWidth: '40%',
    textAlign: 'justify',
    marginHorizontal: '10%',
  }
});