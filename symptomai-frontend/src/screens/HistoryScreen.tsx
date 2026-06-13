import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { PredictionHistory, formatSymptomName } from '../types';

interface HistoryScreenProps {
  history: PredictionHistory[];
  onSelectHistory: (item: PredictionHistory) => void;
  onClearHistory: () => void;
}

const URGENCY_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  darurat: { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' },
  waspada: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
  normal:  { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' },
};

export default function HistoryScreen({
  history,
  onSelectHistory,
  onClearHistory,
}: HistoryScreenProps) {
  if (history.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Riwayat Analisis</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>—</Text>
          <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
          <Text style={styles.emptyDesc}>
            Hasil analisis gejala kamu akan tersimpan di sini secara otomatis.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Analisis</Text>
        <TouchableOpacity onPress={onClearHistory} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Hapus Semua</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {history.map((item) => {
          const urgency = URGENCY_COLOR[item.urgency_level] ?? URGENCY_COLOR.normal;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => onSelectHistory(item)}
            >
              {/* Dot urgency indicator */}
              <View style={[styles.urgencyDot, { backgroundColor: urgency.dot }]} />

              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.predictionText} numberOfLines={1}>
                    {item.prediction}
                  </Text>
                  <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
                    <Text style={[styles.urgencyLabel, { color: urgency.text }]}>
                      {item.urgency_level.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>{item.date}</Text>

                <View style={styles.cardMeta}>
                  <Text style={styles.confidenceText}>{item.confidence}</Text>
                  <Text style={styles.symptomsCount}>
                    {item.symptoms.length} gejala
                  </Text>
                </View>

                {/* Preview gejala */}
                <Text style={styles.symptomsPreview} numberOfLines={1}>
                  {item.symptoms.slice(0, 3).map(formatSymptomName).join(', ')}
                  {item.symptoms.length > 3 ? ` +${item.symptoms.length - 3} lainnya` : ''}
                </Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 48,
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  clearBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  clearBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  urgencyDot: {
    width: 5,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  urgencyLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  symptomsCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  symptomsPreview: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
    paddingRight: 14,
    fontWeight: '300',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});
