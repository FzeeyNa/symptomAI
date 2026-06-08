import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MedicineInfo } from "../types";

interface Props {
  medicine: MedicineInfo;
  showScore?: boolean;
}

type ColorSet = { bg: string; text: string; border: string };

const GOLONGAN_COLORS: Record<string, ColorSet> = {
  "obat bebas": { bg: "#D1FAE5", text: "#065F46", border: "#10B981" },
  "obat bebas terbatas": { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
  "obat keras": { bg: "#FEE2E2", text: "#991B1B", border: "#EF4444" },
  narkotika: { bg: "#F3E8FF", text: "#5B21B6", border: "#8B5CF6" },
  psikotropika: { bg: "#EDE9FE", text: "#5B21B6", border: "#7C3AED" },
};

function getGolonganColors(golongan: string): ColorSet {
  return (
    GOLONGAN_COLORS[golongan.toLowerCase()] ?? {
      bg: "#F3F4F6",
      text: "#374151",
      border: "#9CA3AF",
    }
  );
}

export default function MedicineResultCard({ medicine, showScore }: Props) {
  const [expanded, setExpanded] = useState(false);
  const colors = getGolonganColors(medicine.golongan);

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.medicineName}>{medicine.nama_obat}</Text>
          <Text style={styles.genericName}>{medicine.nama_generik}</Text>
        </View>
        <View style={styles.headerRight}>
          <View
            style={[
              styles.golonganBadge,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.golonganText, { color: colors.text }]}>
              {medicine.golongan}
            </Text>
          </View>
          {showScore && medicine.similarity_score != null && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{medicine.similarity_score}%</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Meta chips ── */}
      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>💊 {medicine.kategori}</Text>
        </View>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>📋 {medicine.bentuk_sediaan}</Text>
        </View>
      </View>

      {/* ── Indikasi ── */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Indikasi</Text>
        <Text style={styles.infoValue}>{medicine.indikasi}</Text>
      </View>

      {/* ── Dosis ── */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Dosis</Text>
        <Text style={styles.infoValue} numberOfLines={expanded ? undefined : 2}>
          {medicine.dosis}
        </Text>
      </View>

      {/* ── Expand toggle ── */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.expandBtn}
        activeOpacity={0.7}
      >
        <Text style={styles.expandBtnText}>
          {expanded ? "Sembunyikan ▲" : "Lihat Detail Lengkap ▼"}
        </Text>
      </TouchableOpacity>

      {/* ── Expanded section ── */}
      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kandungan Aktif</Text>
            <Text style={styles.infoValue}>{medicine.kandungan_aktif}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kontraindikasi</Text>
            <Text style={[styles.infoValue, styles.dangerText]}>
              {medicine.kontraindikasi}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Efek Samping</Text>
            <Text style={[styles.infoValue, styles.dangerText]}>
              {medicine.efek_samping}
            </Text>
          </View>

          <View style={styles.peringatanBox}>
            <Text style={styles.peringatanLabel}>⚠️ Peringatan</Text>
            <Text style={styles.peringatanText}>{medicine.peringatan}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  genericName: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  golonganBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  golonganText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  scoreBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scoreText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  metaChip: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  metaChipText: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "600",
  },
  infoRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  infoLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
  },
  dangerText: {
    color: "#991B1B",
  },
  expandBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  expandBtnText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: "#EFF6FF",
    backgroundColor: "#FAFAFA",
  },
  peringatanBox: {
    margin: 14,
    marginTop: 8,
    backgroundColor: "#FEF9C3",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#EAB308",
    padding: 12,
  },
  peringatanLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#713F12",
    marginBottom: 6,
  },
  peringatanText: {
    fontSize: 12,
    color: "#713F12",
    lineHeight: 18,
  },
});
