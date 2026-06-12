import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { scanMedicine, searchMedicines } from "../api";
import { ScanResult, MedicineSearchResult } from "../types";
import MedicineResultCard from "../components/MedicineResultCard";

type Mode = "scan" | "search";

export default function MedicineScanScreen() {
  const [mode, setMode] = useState<Mode>("scan");

  // Scan state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<MedicineSearchResult | null>(
    null,
  );

  // Shared
  const [error, setError] = useState<string | null>(null);
  const [ocrExpanded, setOcrExpanded] = useState(false);

  // ── Image Pickers ────────────────────────────────────────────────────────────

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Akses kamera diperlukan untuk mengambil foto kemasan obat.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setScanResult(null);
      setError(null);
      setOcrExpanded(false);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Akses galeri diperlukan untuk memilih foto kemasan obat.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setScanResult(null);
      setError(null);
      setOcrExpanded(false);
    }
  };

  const handleScan = async () => {
    if (!imageUri) return;
    setScanning(true);
    setError(null);
    setScanResult(null);
    setOcrExpanded(false);
    try {
      const result = await scanMedicine(imageUri);
      setScanResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memindai gambar. Pastikan server aktif.",
      );
    } finally {
      setScanning(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError(null);
    setSearchResult(null);
    try {
      const result = await searchMedicines(searchQuery.trim());
      setSearchResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mencari obat. Pastikan server aktif.",
      );
    } finally {
      setSearching(false);
    }
  };

  const resetScan = () => {
    setImageUri(null);
    setScanResult(null);
    setError(null);
    setOcrExpanded(false);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Scan Obat</Text>
          <Text style={styles.headerSub}>
            Identifikasi obat dari foto atau nama
          </Text>
        </View>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeWrapper}>
        <View style={styles.modeBar}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "scan" && styles.modeBtnActive]}
            onPress={() => switchMode("scan")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeBtnText,
                mode === "scan" && styles.modeBtnTextActive,
              ]}
            >
              Scan Gambar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "search" && styles.modeBtnActive]}
            onPress={() => switchMode("search")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeBtnText,
                mode === "search" && styles.modeBtnTextActive,
              ]}
            >
              Cari Nama
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* ── SCAN MODE ───────────────────────────────────────────────────── */}
        {mode === "scan" && (
          <>
            {!imageUri ? (
              /* Pick image card */
              <View style={styles.pickCard}>
                <Text style={styles.pickTitle}>Foto Kemasan Obat</Text>
                <Text style={styles.pickDesc}>
                  Ambil foto atau pilih gambar dari galeri. Pastikan nama obat
                  terlihat jelas.
                </Text>

                <View style={styles.pickBtns}>
                  <TouchableOpacity
                    style={styles.pickBtnPrimary}
                    onPress={pickFromCamera}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickBtnPrimaryText}>Kamera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickBtnSecondary}
                    onPress={pickFromGallery}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickBtnSecondaryText}>🖼️ Galeri</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tipsBox}>
                  <Text style={styles.tipsTitle}>
                    💡 Tips untuk hasil terbaik:
                  </Text>
                  <Text style={styles.tipItem}>
                    • Foto bagian nama obat pada kemasan
                  </Text>
                  <Text style={styles.tipItem}>
                    • Pastikan cahaya cukup dan gambar tidak buram
                  </Text>
                  <Text style={styles.tipItem}>
                    • Barcode / QR pada kemasan juga dapat di-scan
                  </Text>
                </View>
              </View>
            ) : (
              /* Image selected */
              <>
                {/* Preview */}
                <View style={styles.previewCard}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.preview}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    onPress={resetScan}
                    style={styles.changePhotoBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.changePhotoBtnText}>Ganti Foto</Text>
                  </TouchableOpacity>
                </View>

                {/* Scan button (shown only before scanning) */}
                {!scanResult && (
                  <TouchableOpacity
                    style={[styles.scanBtn, scanning && styles.scanBtnDisabled]}
                    onPress={handleScan}
                    disabled={scanning}
                    activeOpacity={0.8}
                  >
                    {scanning ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.scanBtnText}>Mulai Scan</Text>
                    )}
                  </TouchableOpacity>
                )}

                {scanning && (
                  <View style={styles.scanningInfo}>
                    <Text style={styles.scanningText}>
                      Sedang mengekstrak teks dari gambar...
                    </Text>
                    <Text style={styles.scanningSubText}>
                      Proses ini memerlukan beberapa detik
                    </Text>
                  </View>
                )}

                {/* ── Scan Results ─────────────────────────────────────── */}
                {scanResult && (
                  <>
                    {/* Barcode results */}
                    {scanResult.barcodes.length > 0 && (
                      <View style={[styles.infoCard, styles.infoCardGreen]}>
                        <Text style={styles.infoCardTitle}>
                          Barcode Terdeteksi
                        </Text>
                        {scanResult.barcodes.map((bc, i) => (
                          <Text key={i} style={styles.infoCardText}>
                            {bc.type}: {bc.data}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* BPOM number */}
                    {scanResult.bpom_number ? (
                      <View style={[styles.infoCard, styles.infoCardBlue]}>
                        <Text style={styles.infoCardTitle}>
                          Nomor BPOM Terdeteksi
                        </Text>
                        <Text style={styles.bpomText}>
                          {scanResult.bpom_number}
                        </Text>
                      </View>
                    ) : null}

                    {/* OCR text preview */}
                    {scanResult.extracted_text ? (
                      <View style={styles.ocrCard}>
                        <TouchableOpacity
                          onPress={() => setOcrExpanded(!ocrExpanded)}
                          activeOpacity={0.7}
                          style={styles.ocrToggleRow}
                        >
                          <Text style={styles.ocrTitle}>📝 Teks OCR</Text>
                          <Text style={styles.ocrToggleText}>
                            {ocrExpanded ? "▲" : "▼"}
                          </Text>
                        </TouchableOpacity>
                        {ocrExpanded && (
                          <Text style={styles.ocrText}>
                            {scanResult.extracted_text}
                          </Text>
                        )}
                        {!ocrExpanded && (
                          <Text style={styles.ocrTextPreview} numberOfLines={2}>
                            {scanResult.extracted_text}
                          </Text>
                        )}
                      </View>
                    ) : null}

                    {/* No match message */}
                    {scanResult.matches.length === 0 && scanResult.pesan ? (
                      <View style={styles.noResultBox}>
                        <Text style={styles.noResultText}>
                          {scanResult.pesan}
                        </Text>
                      </View>
                    ) : null}

                    {/* Match list */}
                    {scanResult.matches.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>
                          💊 Hasil Match ({scanResult.matches.length} obat)
                        </Text>
                        {scanResult.matches.map((med) => (
                          <MedicineResultCard
                            key={med.id}
                            medicine={med}
                            showScore
                          />
                        ))}
                      </>
                    )}

                    {/* Reset button */}
                    <TouchableOpacity
                      style={styles.resetBtn}
                      onPress={resetScan}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.resetBtnText}>Scan Foto Lain</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ── SEARCH MODE ─────────────────────────────────────────────────── */}
        {mode === "search" && (
          <>
            <View style={styles.searchCard}>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Nama obat, zat aktif, atau kandungan..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[
                    styles.searchBtn,
                    (!searchQuery.trim() || searching) &&
                      styles.searchBtnDisabled,
                  ]}
                  onPress={handleSearch}
                  disabled={!searchQuery.trim() || searching}
                  activeOpacity={0.8}
                >
                  {searching ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.searchBtnText}>Cari</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Search results */}
            {searchResult && (
              <>
                {searchResult.total > 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>
                      Ditemukan {searchResult.total} obat untuk &quot;
                      {searchResult.query}&quot;
                    </Text>
                    {searchResult.data.map((med) => (
                      <MedicineResultCard key={med.id} medicine={med} />
                    ))}
                  </>
                ) : (
                  <View style={styles.noResultBox}>
                    <Text style={styles.noResultText}>
                      Tidak ada hasil untuk &quot;{searchResult.query}&quot;.
                      Coba kata kunci lain.
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Placeholder */}
            {!searchResult && !searching && (
              <View style={styles.pickCard}>
                <Text style={styles.pickTitle}>Cari Informasi Obat</Text>
                <Text style={styles.pickDesc}>
                  Ketikkan nama obat, nama generik, atau kandungan aktif untuk
                  melihat informasi lengkap termasuk dosis, efek samping, dan
                  peringatan.
                </Text>
                <View style={styles.tipsBox}>
                  <Text style={styles.tipsTitle}>Contoh pencarian:</Text>
                  <Text style={styles.tipItem}>
                    • "Paracetamol" atau "Acetaminophen"
                  </Text>
                  <Text style={styles.tipItem}>
                    • "Amoxicillin" atau "Antibiotik"
                  </Text>
                  <Text style={styles.tipItem}>• "demam" atau "nyeri"</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 13,
    color: "#BFDBFE",
    marginTop: 4,
    fontWeight: "500",
  },

  // ── Mode toggle ──────────────────────────────────────────────────────────────
  modeWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  modeBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: "#2563EB",
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  modeBtnTextActive: {
    color: "#ffffff",
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },

  // ── Error ────────────────────────────────────────────────────────────────────
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },

  // ── Pick image card ──────────────────────────────────────────────────────────
  pickCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pickTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  pickDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 20,
  },
  pickBtns: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  pickBtnPrimary: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  pickBtnPrimaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  pickBtnSecondary: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  pickBtnSecondaryText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
  tipsBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    padding: 14,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 22,
  },

  // ── Image preview ────────────────────────────────────────────────────────────
  previewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  changePhotoBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  changePhotoBtnText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },

  // ── Scan button ──────────────────────────────────────────────────────────────
  scanBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  scanBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Scanning progress ────────────────────────────────────────────────────────
  scanningInfo: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  scanningText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  scanningSubText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },

  // ── Info cards (barcode / BPOM) ──────────────────────────────────────────────
  infoCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  infoCardGreen: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  infoCardBlue: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  infoCardText: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "monospace" as any,
    lineHeight: 20,
  },
  bpomText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    fontFamily: "monospace" as any,
  },

  // ── OCR card ─────────────────────────────────────────────────────────────────
  ocrCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
  },
  ocrToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  ocrTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  ocrToggleText: {
    fontSize: 12,
    color: "#6B7280",
  },
  ocrTextPreview: {
    fontSize: 12,
    color: "#9CA3AF",
    paddingHorizontal: 12,
    paddingBottom: 12,
    lineHeight: 18,
  },
  ocrText: {
    fontSize: 12,
    color: "#4B5563",
    paddingHorizontal: 12,
    paddingBottom: 12,
    lineHeight: 18,
  },

  // ── No result ────────────────────────────────────────────────────────────────
  noResultBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 14,
    marginBottom: 12,
  },
  noResultText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 20,
  },

  // ── Section title ────────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    marginTop: 4,
  },

  // ── Reset button ─────────────────────────────────────────────────────────────
  resetBtn: {
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  resetBtnText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },

  // ── Search card ──────────────────────────────────────────────────────────────
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  searchBtnDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  searchBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});
