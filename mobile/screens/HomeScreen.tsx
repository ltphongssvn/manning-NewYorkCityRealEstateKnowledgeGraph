import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.container} testID="home-screen">
      <Text style={styles.title}>NYC Real Estate Knowledge Graph</Text>
      <Text style={styles.subtitle}>Explore property ownership networks across New York City.</Text>
      <Pressable style={[styles.btn, { backgroundColor: '#2563eb' }]} onPress={() => navigation.navigate('Properties')} testID="nav-properties">
        <Text style={styles.btnText}>Properties</Text>
      </Pressable>
      <Pressable style={[styles.btn, { backgroundColor: '#7c3aed' }]} onPress={() => navigation.navigate('Owners')} testID="nav-owners">
        <Text style={styles.btnText}>Owners</Text>
      </Pressable>
      <Pressable style={[styles.btn, { backgroundColor: '#16a34a' }]} onPress={() => navigation.navigate('Graph')} testID="nav-graph">
        <Text style={styles.btnText}>Graph Explorer</Text>
      </Pressable>
      <Pressable style={[styles.btn, { backgroundColor: '#ca8a04' }]} onPress={() => navigation.navigate('Recommend')} testID="nav-recommend">
        <Text style={styles.btnText}>Recommendations</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginBottom: 32 },
  btn: { width: '100%', padding: 14, borderRadius: 8, marginBottom: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
