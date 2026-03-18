import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <Link href="/sugestao">
      <ThemedText type="link">Ir para Sugestão</ThemedText>
    </Link>
  );
}

const styles = StyleSheet.create({});