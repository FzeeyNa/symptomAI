import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MedicineInfo, DrugInteraction, InteractionResult } from '../types';
import { searchMedicines, checkInteractions } from '../api';

// ─── Severity Config ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  high:   { label: 'TINGGI',  bg: '#FEF2F2', border: '#EF4444', badge: '#DC2626', text: '#7F1D1D' },
  medium: { label: 'SEDANG',  bg: '#FFFBEB', border: '#F59E0B', badge: '#D97706', text: '#78350F' },
  low:    { label: 'RENDAH',  bg: '#F0FDF4', border: '#22C55E', badge: '#16A34A', text: '#14532D' },
};

export default function MedicineInteractionScreen() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicineInfo[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<MedicineInfo[]>([]);
  const [interactionResult, setInteractionResult] = useState<InteractionResult | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoadingSearch(true);
    setError(null);
    try {
      const res = await searchMedicines(query.trim());
      setSearchResults(res.data.slice(0, 8));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mencari obat.');
    } finally {
      setLoadingSearch(false);
    }
  };

  // ─── Select / Deselect ───────────────────────────────────────────────────────
  const toggleSelect = (medicine: MedicineInfo) => {
    const alreadySelected = selectedMedicines.find(m => m.id === medicine.id);
    if (alreadySelected) {
      setSelectedMedicines(prev => prev.filter(m => m.id !== medicine.id));
    } else {
      if (selectedMedicines.length >= 5) {
        Alert.alert('Batas Maksimum', 'Kamu bisa memilih maksimal 5 obat sekaligus.');
        return;
      }
      setSelectedMedicines(prev => [...prev, medicine]);
    }
    setInteractionResult(null);
  };

  // ─── Check Interactions ──────────────────────────────────────────────────────
  const handleCheckInteractions = async () => {
    if (selectedMedicines.length < 2) {
      Alert.alert('Pilih Minimal 2 Obat', 'Pilih minimal 2 obat untuk mengecek interaksi.');
      return;
    }
    setLoadingCheck(true);
    setError(null);
    setInteractionResult(null);
    try {
      const ids = selectedMedicines.map(m => m.id);
      const result = await checkInteractions(ids);
      setInteractionResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengecek interaksi.');
    } finally {
      setLoadingCheck(false);
    }
  };

  const clearAll = () => {
    setSelectedMedicines([]);
    setInteractionResult(null);
    setSearchResults([]);
    setQuery('');
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cek Interaksi Obat</Text>
          <Text style={styles.headerSub}>Pilih 2–5 obat untuk dicek</Text>
        </View>
        {selectedMedicines.length > 0 && (
          <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama obat..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearch}
            disabled={loadingSearch}
          >
            {loadingSearch
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.searchBtnText}>Cari</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Selected Pills */}
        {selectedMedicines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Obat Dipilih ({selectedMedicines.length}/5)
            </Text>
            <View style={styles.pillsRow}>
              {selectedMedicines.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.pill}
                  onPress={() => toggleSelect(m)}
                >
                  <Text style={styles.pillText}>{m.nama_obat}</Text>
                  <Text style={styles.pillRemove}>✕</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CTA Cek Interaksi */}
            <TouchableOpacity
              style={[styles.checkBtn, (loadingCheck || selectedMedicines.length < 2) && styles.checkBtnDisabled]}
              onPress={handleCheckInteractions}
              disabled={loadingCheck || selectedMedicines.length < 2}
            >
              {loadingCheck
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.checkBtnText}>Cek Interaksi</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Interaction Result */}
        {interactionResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Hasil ({interactionResult.total_checked} pasangan dicek)
            </Text>

            {interactionResult.interactions.length === 0 ? (
              <View style={styles.safeBox}>
                <Text style={styles.safeIcon}>✓</Text>
                <Text style={styles.safeTitle}>Tidak Ada Interaksi Berbahaya</Text>
                <Text style={styles.safeDesc}>
                  Dari {interactionResult.total_checked} kombinasi yang dicek, tidak ditemukan interaksi yang perlu diwaspadai.
                </Text>
              </View>
            ) : (
              interactionResult.interactions.map((item, idx) => {
                const sev = SEVERITY_CONFIG[item.severity] ?? SEVERITY_CONFIG.low;
                return (
                  <View
                    key={idx}
                    style={[styles.interactionCard, { backgroundColor: sev.bg, borderColor: sev.border }]}
                  >
                    {/* Pair + badge */}
                    <View style={styles.interactionHeader}>
                      <Text style={styles.interactionPair} numberOfLines={1}>
                        {item.pair[0]}  ↔  {item.pair[1]}
                      </Text>
                      <View style={[styles.severityBadge, { backgroundColor: sev.badge }]}>
                        <Text style={styles.severityText}>{sev.label}</Text>
                      </View>
                    </View>

                    {/* Efek */}
                    <Text style={[styles.interactionLabel, { color: sev.text }]}>Efek:</Text>
                    <Text style={[styles.interactionText, { color: sev.text }]}>{item.efek}</Text>

                    {/* Saran */}
                    <Text style={[styles.interactionLabel, { color: sev.text, marginTop: 8 }]}>Saran:</Text>
                    <Text style={[styles.interactionText, { color: sev.text }]}>{item.saran}</Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hasil Pencarian</Text>
            {searchResults.map(med => {
              const isSelected = !!selectedMedicines.find(m => m.id === med.id);
              return (
                <TouchableOpacity
                  key={med.id}
                  style={[styles.resultItem, isSelected && styles.resultItemSelected]}
                  onPress={() => toggleSelect(med)}
                  activeOpacity={0.8}
                >
                  <View style={styles.resultBody}>
                    <Text style={[styles.resultName, isSelected && styles.resultNameSelected]}>
                      {med.nama_obat}
                    </Text>
                    <Text style={styles.resultMeta}>{med.kategori} · {med.golongan}</Text>
                    <Text style={styles.resultGenerik} numberOfLines={1}>{med.nama_generik}</Text>
                  </View>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {searchResults.length === 0 && selectedMedicines.length === 0 && !loadingSearch && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>+</Text>
            <Text style={styles.emptyTitle}>Cari Obat Terlebih Dahulu</Text>
            <Text style={styles.emptyDesc}>
              Ketik nama obat di kolom pencarian di atas, pilih 2 atau lebih obat, lalu tekan "Cek Interaksi".
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#7C3AED',
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
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: '#DDD6FE', marginTop: 4, fontWeight: '500' },
  clearBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  clearBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40, gap: 16 },

  // Search
  searchRow: { flexDirection: 'row', gap: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Error
  errorBox: {
    backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: '#EF4444',
  },
  errorText: { color: '#B91C1C', fontSize: 13 },

  // Section
  section: { gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },

  // Selected pills
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  pillText: { fontSize: 13, color: '#6D28D9', fontWeight: '600' },
  pillRemove: { fontSize: 12, color: '#7C3AED', fontWeight: '700' },

  // Check button
  checkBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkBtnDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  checkBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Safe result
  safeBox: {
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0',
  },
  safeIcon:  { fontSize: 40, marginBottom: 8 },
  safeTitle: { fontSize: 16, fontWeight: '700', color: '#15803D', marginBottom: 6 },
  safeDesc:  { fontSize: 13, color: '#166534', textAlign: 'center', lineHeight: 20 },

  // Interaction card
  interactionCard: {
    borderRadius: 12, padding: 14,
    borderWidth: 1.5, marginBottom: 2,
  },
  interactionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  interactionPair: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827', marginRight: 8 },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  severityText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  interactionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  interactionText: { fontSize: 13, lineHeight: 20 },

  // Search results
  resultItem: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  resultItemSelected: { borderColor: '#7C3AED', borderWidth: 1.5, backgroundColor: '#FAF5FF' },
  resultBody: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  resultNameSelected: { color: '#6D28D9' },
  resultMeta: { fontSize: 11, color: '#9CA3AF', marginBottom: 2, fontWeight: '500' },
  resultGenerik: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  checkCircle: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 12,
  },
  checkCircleSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  checkMark: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22 },
});
