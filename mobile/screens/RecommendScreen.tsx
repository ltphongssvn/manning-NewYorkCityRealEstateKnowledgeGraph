import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const API_BASE = 'https://nyc-kg-app.thanhphongle.net';

export default function RecommendScreen() {
  const navigation = useNavigation();
  const [bbl, setBbl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRecommend() {
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/recommend/${bbl}`);
      if (!res.ok) { setError(`BBL ${bbl} not found in embeddings`); return; }
      setResult(await res.json());
    } catch { setError('Network error'); } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()} testID="back-btn">
          <Text style={styles.back}>← Home</Text>
        </Pressable>
        <Text style={styles.title}>Similar Property Recommendations</Text>
        <Text style={styles.subtitle}>AI-powered similarity using node2vec embeddings trained on 97,000 NYC properties. Lower distance = more similar ownership pattern.</Text>
        <TextInput style={styles.input} placeholder="Enter BBL (e.g. 1008350041)"
          placeholderTextColor="#6b7280" value={bbl} onChangeText={setBbl} testID="bbl-input" />
        <Pressable style={styles.btn} onPress={handleRecommend} testID="recommend-btn">
          <Text style={styles.btnText}>Recommend</Text>
        </Pressable>
        {loading && <ActivityIndicator color="#fff" />}
        {!!error && <Text style={styles.error} testID="error-msg">{error}</Text>}
        {result && (
          <View style={styles.card} testID="result">
            <Text style={styles.field}><Text style={styles.label}>Query BBL: </Text>{result.bbl}</Text>
            <Text style={styles.sectionTitle}>Top {result.recommendations?.length} similar properties by ownership network:</Text>
            {result.recommendations?.map((r: any, i: number) => (
              <View key={i} style={styles.row}>
                <Text style={styles.rank}>#{i + 1}</Text>
                <Text style={styles.bbl}>{r.bbl}</Text>
                <Text style={styles.label}>distance: </Text>
                <Text style={r.distance < 0.3 ? styles.near : styles.far}>{r.distance}</Text>
              </View>
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
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#9ca3af', fontSize: 12, marginBottom: 16 },
  input: { backgroundColor: '#1f2937', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  btn: { backgroundColor: '#ca8a04', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
  error: { color: '#f87171' },
  card: { backgroundColor: '#1f2937', borderRadius: 8, padding: 16, marginTop: 8 },
  field: { color: '#fff', marginBottom: 4 },
  label: { color: '#9ca3af' },
  sectionTitle: { color: '#9ca3af', marginTop: 8, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#374151', borderRadius: 6, padding: 10, marginBottom: 6, gap: 8 },
  rank: { color: '#9ca3af', width: 28 },
  bbl: { color: '#fbbf24', fontFamily: 'monospace', flex: 1 },
  near: { color: '#4ade80' },
  far: { color: '#fb923c' },
});
