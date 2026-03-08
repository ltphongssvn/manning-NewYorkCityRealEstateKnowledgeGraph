import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const API_BASE = 'https://nyc-kg-app.thanhphongle.net';

export default function GraphScreen() {
  const navigation = useNavigation();
  const [bbl, setBbl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleTraverse() {
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/graph/traverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bbl, hops: 2 }),
      });
      if (!res.ok) { setError(`BBL ${bbl} not found`); return; }
      setResult(await res.json());
    } catch { setError('Network error'); } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()} testID="back-btn">
          <Text style={styles.back}>← Home</Text>
        </Pressable>
        <Text style={styles.title}>Graph Explorer</Text>
        <TextInput style={styles.input} placeholder="Enter BBL (e.g. 1008350041)"
          placeholderTextColor="#6b7280" value={bbl} onChangeText={setBbl} testID="bbl-input" />
        <Pressable style={styles.btn} onPress={handleTraverse} testID="traverse-btn">
          <Text style={styles.btnText}>Traverse</Text>
        </Pressable>
        {loading && <ActivityIndicator color="#fff" />}
        {!!error && <Text style={styles.error} testID="error-msg">{error}</Text>}
        {result && (
          <View style={styles.card} testID="result">
            <Text style={styles.field}><Text style={styles.label}>BBL: </Text>{result.bbl}</Text>
            <Text style={styles.sectionTitle}>Nodes ({result.nodes?.length ?? 0}) — properties and owners:</Text>
            {result.nodes?.map((n: any, i: number) => (
              <Text key={i} style={styles.item}>
                <Text style={styles.tag}>[{n.labels?.join(', ')}] </Text>
                <Text style={styles.white}>{n.properties?.name ?? n.properties?.bbl ?? n.id}</Text>
                {n.properties?.address ? <Text style={styles.dim}> — {n.properties.address}</Text> : null}
              </Text>
            ))}
            <Text style={styles.sectionTitle}>Edges ({result.edges?.length ?? 0}) — ownership links:</Text>
            {result.edges?.map((e: any, i: number) => (
              <Text key={i} style={styles.item}>
                Node {e.start} <Text style={styles.tag}>—{e.type}→</Text> Node {e.end}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#030712' },
  content: { padding: 24 },
  back: { color: '#60a5fa', marginBottom: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#1f2937', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  btn: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
  error: { color: '#f87171' },
  card: { backgroundColor: '#1f2937', borderRadius: 8, padding: 16, marginTop: 8 },
  field: { color: '#fff', marginBottom: 4 },
  label: { color: '#9ca3af' },
  sectionTitle: { color: '#9ca3af', marginTop: 12, marginBottom: 4 },
  item: { color: '#fff', marginLeft: 8, marginBottom: 2 },
  tag: { color: '#4ade80' },
  white: { color: '#fff' },
  dim: { color: '#9ca3af' },
});
