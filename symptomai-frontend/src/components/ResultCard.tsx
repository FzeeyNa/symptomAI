import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnalysisResult } from '../types';

interface ResultCardProps {
  result: AnalysisResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hasil Analisis AI</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.label}>Kemungkinan Penyakit:</Text>
        <Text style={styles.prediction}>{result.prediction}</Text>

        <View style={styles.confidenceRow}>
          <Text style={styles.label}>Tingkat Keyakinan (Confidence):</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{result.confidence}</Text>
          </View>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ⚠️ Ini adalah hasil prediksi model Machine Learning sederhana berdasarkan input gejala, bukan diagnosis medis resmi. Harap konsultasikan ke dokter untuk pemeriksaan yang akurat.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    backgroundColor: '#EEF2FF', // indigo-50
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5', // indigo-600
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 13,
    color: '#6B7280', // gray-500
    marginBottom: 4,
    fontWeight: '500',
  },
  prediction: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827', // gray-900
    marginBottom: 16,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  confidenceBadge: {
    backgroundColor: '#10B981', // emerald-500
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  disclaimerBox: {
    backgroundColor: '#FEF2F2', // red-50
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444', // red-500
  },
  disclaimerText: {
    fontSize: 12,
    color: '#991B1B', // red-800
    lineHeight: 18,
  }
});
