import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const API_BASE = 'https://nyc-kg-app.thanhphongle.net';

export default function PropertiesScreen() {
  const navigation = useNavigation();
  const [bbl, setBbl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/properties/${bbl}`);
      if (!res.ok) { setError(`BBL ${bbl} not found`); return; }
      setResult(await res.json());
    } catch { setError('Network error'); } finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => navigation.goBack()} testID="back-btn">
        <Text style={styles.back}>← Home</Text>
      </Pressable>
      <Text style={styles.title}>Property Search</Text>
      <TextInput style={styles.input} placeholder="Enter BBL (e.g. 1008350041)" placeholderTextColor="#6b7280"
        value={bbl} onChangeText={setBbl} testID="bbl-input" />
      <Pressable style={styles.btn} onPress={handleSearch} testID="search-btn">
        <Text style={styles.btnText}>Search</Text>
      </Pressable>
      {loading && <ActivityIndicator color="#fff" />}
      {!!error && <Text style={styles.error} testID="error-msg">{error}</Text>}
      {result && (
        <View style={styles.card} testID="result">
          <Text style={styles.field}><Text style={styles.label}>BBL: </Text>{result.bbl}</Text>
          <Text style={styles.field}><Text style={styles.label}>Address: </Text>{result.address ?? 'N/A'}</Text>
          <Text style={styles.field}><Text style={styles.label}>Owners ({result.owners?.length ?? 0}):</Text></Text>
          {result.owners?.map((o: any, i: number) => (
            <Text key={i} style={styles.item}>• {o.name} <Text style={styles.dim}>({o.relationship})</Text></Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  content: { padding: 24 },
  back: { color: '#60a5fa', marginBottom: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#1f2937', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  btn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
  error: { color: '#f87171' },
  card: { backgroundColor: '#1f2937', borderRadius: 8, padding: 16, marginTop: 8 },
  field: { color: '#fff', marginBottom: 4 },
  label: { color: '#9ca3af' },
  item: { color: '#fff', marginLeft: 8, marginBottom: 2 },
  dim: { color: '#6b7280' },
});
