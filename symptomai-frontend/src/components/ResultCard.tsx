import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AnalysisResult, formatSymptomName } from '../types';

interface ResultCardProps {
  result: AnalysisResult;
  onFeedback?: (isHelpful: boolean) => void;
}

const URGENCY_CONFIG = {
  darurat: {
    label: '🚨 DARURAT',
    bg: '#FEF2F2',
    border: '#EF4444',
    badge: '#DC2626',
    text: '#7F1D1D',
  },
  waspada: {
    label: '⚠️ WASPADA',
    bg: '#FFFBEB',
    border: '#F59E0B',
    badge: '#D97706',
    text: '#78350F',
  },
  normal: {
    label: '✅ NORMAL',
    bg: '#F0FDF4',
    border: '#22C55E',
    badge: '#16A34A',
    text: '#14532D',
  },
};

export default function ResultCard({ result, onFeedback }: ResultCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const urgency = URGENCY_CONFIG[result.urgency_level] ?? URGENCY_CONFIG.normal;

  const handleFeedback = (isHelpful: boolean) => {
    setFeedbackGiven(isHelpful);
    onFeedback?.(isHelpful);
    Alert.alert(
      'Terima Kasih!',
      isHelpful
        ? 'Senang bisa membantu! Tetap jaga kesehatan ya 😊'
        : 'Maaf jika hasilnya kurang akurat. Masukan kamu sangat berarti!',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hasil Analisis AI</Text>
        {/* Urgency Badge */}
        <View style={[styles.urgencyBadge, { backgroundColor: urgency.badge }]}>
          <Text style={styles.urgencyBadgeText}>{urgency.label}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Main Prediction */}
        <Text style={styles.label}>Kemungkinan Penyakit:</Text>
        <Text style={styles.prediction}>{result.prediction}</Text>

        {/* Confidence */}
        <View style={styles.confidenceRow}>
          <Text style={styles.label}>Tingkat Keyakinan:</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{result.confidence}</Text>
          </View>
        </View>

        {/* Top 3 Predictions */}
        {result.top_predictions?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Top 3 Kemungkinan Penyakit</Text>
            {result.top_predictions.map((item, index) => (
              <View key={index} style={styles.topPredictionRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.topPredictionName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={[
                  styles.topPredictionBadge,
                  index === 0 && styles.topPredictionBadgeFirst
                ]}>
                  <Text style={[
                    styles.topPredictionConf,
                    index === 0 && styles.topPredictionConfFirst
                  ]}>
                    {item.confidence}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Red Flags */}
        {result.red_flags?.length > 0 && (
          <View style={[styles.section, styles.redFlagBox, {
            backgroundColor: urgency.bg,
            borderColor: urgency.border,
          }]}>
            <Text style={[styles.redFlagTitle, { color: urgency.text }]}>
              {result.urgency_level === 'darurat' ? '🚨 Peringatan Darurat!' : '⚠️ Perlu Perhatian!'}
            </Text>
            {result.red_flags.map((flag, index) => (
              <View key={index} style={styles.redFlagItem}>
                <Text style={[styles.redFlagBullet, { color: urgency.badge }]}>•</Text>
                <Text style={[styles.redFlagText, { color: urgency.text }]}>{flag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendation */}
        <View style={[styles.section, styles.recommendationBox]}>
          <Text style={styles.recommendationTitle}>💡 Rekomendasi</Text>
          <Text style={styles.recommendationText}>{result.recommendation}</Text>
        </View>

        {/* Key Symptoms Detected */}
        {result.key_symptoms_detected?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🩺 Gejala yang Dirasakan</Text>
            <View style={styles.symptomsWrap}>
              {result.key_symptoms_detected.map((sym, index) => (
                <View key={index} style={styles.symptomTag}>
                  <Text style={styles.symptomTagText}>{formatSymptomName(sym)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ⚠️ Ini adalah hasil prediksi Machine Learning, bukan diagnosis medis resmi. Harap konsultasikan ke dokter untuk pemeriksaan yang akurat.
          </Text>
        </View>

        {/* Feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Apakah hasil ini membantu?</Text>
          {feedbackGiven === null ? (
            <View style={styles.feedbackButtons}>
              <TouchableOpacity
                style={[styles.feedbackBtn, styles.feedbackBtnYes]}
                onPress={() => handleFeedback(true)}
              >
                <Text style={styles.feedbackBtnText}>👍  Ya</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.feedbackBtn, styles.feedbackBtnNo]}
                onPress={() => handleFeedback(false)}
              >
                <Text style={styles.feedbackBtnTextNo}>👎  Tidak</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.feedbackDone}>
              {feedbackGiven ? '👍 Terima kasih atas masukan positifnya!' : '👎 Terima kasih, kami akan terus belajar!'}
            </Text>
          )}
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
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  urgencyBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  prediction: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
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
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  // Top 3 Predictions
  topPredictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  topPredictionName: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  topPredictionBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  topPredictionBadgeFirst: {
    backgroundColor: '#4F46E5',
  },
  topPredictionConf: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  topPredictionConfFirst: {
    color: '#ffffff',
  },
  // Red Flag Box
  redFlagBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  redFlagTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  redFlagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  redFlagBullet: {
    fontSize: 16,
    fontWeight: '900',
    marginRight: 6,
    lineHeight: 20,
  },
  redFlagText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  // Recommendation
  recommendationBox: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  // Symptoms tags
  symptomsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomTag: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  symptomTagText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  // Disclaimer
  disclaimerBox: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
  // Feedback
  feedbackSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  feedbackBtnYes: {
    backgroundColor: '#10B981',
  },
  feedbackBtnNo: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  feedbackBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  feedbackBtnTextNo: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 14,
  },
  feedbackDone: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});
