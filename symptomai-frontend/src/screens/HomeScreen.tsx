import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SYMPTOMS_LIST, formatSymptomName, AnalysisResult } from '../types';
import { predictDisease } from '../api';
import ResultCard from '../components/ResultCard';

export default function HomeScreen() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const toggleSymptom = (symptom: string) => {
    const newSelected = new Set(selectedSymptoms);
    if (newSelected.has(symptom)) {
      newSelected.delete(symptom);
    } else {
      newSelected.add(symptom);
    }
    setSelectedSymptoms(newSelected);
  };

  const handlePredict = async () => {
    if (selectedSymptoms.size === 0) {
      setError('Pilih minimal satu gejala terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const symptomRecord: Record<string, boolean> = {};
    SYMPTOMS_LIST.forEach(sym => {
      symptomRecord[sym] = selectedSymptoms.has(sym);
    });

    try {
      const data = await predictDisease(symptomRecord);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memprediksi');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSymptoms(new Set());
    setResult(null);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SymptomAI</Text>
          <Text style={styles.headerSub}>
            Asisten Triage Medis Cerdas
          </Text>
        </View>
        {(result || selectedSymptoms.size > 0) && (
          <TouchableOpacity onPress={resetForm} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!result ? (
          <>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Apa yang kamu rasakan?</Text>
              <Text style={styles.instructionsDesc}>
                Pilih satu atau lebih gejala di bawah ini, dan sistem AI kami akan memprediksi kemungkinan penyakitmu.
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Symptoms Grid */}
            <View style={styles.symptomsGrid}>
              {SYMPTOMS_LIST.map((sym) => {
                const isSelected = selectedSymptoms.has(sym);
                return (
                  <TouchableOpacity
                    key={sym}
                    activeOpacity={0.7}
                    onPress={() => toggleSymptom(sym)}
                    style={[
                      styles.symptomChip,
                      isSelected && styles.symptomChipSelected
                    ]}
                  >
                    <Text style={[
                      styles.symptomText,
                      isSelected && styles.symptomTextSelected
                    ]}>
                      {formatSymptomName(sym)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.resultContainer}>
            <ResultCard result={result} />
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={resetForm}
            >
              <Text style={styles.backBtnText}>Cek Gejala Lain</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer Action */}
      {!result && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.predictBtn,
              (selectedSymptoms.size === 0 || loading) && styles.predictBtnDisabled
            ]}
            onPress={handlePredict}
            disabled={selectedSymptoms.size === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.predictBtnText}>
                Analisis {selectedSymptoms.size > 0 ? `(${selectedSymptoms.size} Gejala)` : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6', // light gray
  },
  header: {
    backgroundColor: '#2563EB', // blue-600
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 48, // safe area padding fallback
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#BFDBFE', // blue-200
    marginTop: 4,
    fontWeight: '500',
  },
  resetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  instructionsContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionsDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symptomChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  symptomChipSelected: {
    backgroundColor: '#EEF2FF', // indigo-50
    borderColor: '#6366F1', // indigo-500
    borderWidth: 1.5,
  },
  symptomText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  symptomTextSelected: {
    color: '#4F46E5', // indigo-600
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  predictBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  predictBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  predictBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultContainer: {
    marginTop: 12,
  },
  backBtn: {
    marginTop: 24,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '600',
  }
});
