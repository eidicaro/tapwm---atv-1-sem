import { StyleSheet } from 'react-native';
import Header from '../header';
import Footer from '../footer';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header></Header>

      <Text style={{fontSize: 80, fontWeight: "700", color: "#000", textAlign: 'center', marginBottom: "5%"}}>cabeça lindao</Text>
      <Text style={styles.text}>Somos uma pequena iniciativa que deseja ajudar iniciantes na área de tecnologia a compreender melhor os termos; o que eles significam e como se pronuncia corretamente.
      Aqui você poderá encontrar as principais termologias usadas no mundo tecnológico</Text>

      <Footer></Footer>
      
    </View>
  );
}

const styles = StyleSheet.create({
  text:{
    color: '#000',
    fontSize: 16,
    maxWidth: '40%',
    textAlign: 'justify',
    marginHorizontal: '10%',
  }
});