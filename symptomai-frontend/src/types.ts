// ============================================================
// TYPES
// ============================================================

export interface AnalysisResult {
  prediction: string;
  confidence: string; // e.g. "85.50%"
}

export interface MedicineInfo {
  id: number;
  nama_obat: string;
  nama_generik: string;
  kategori: string;
  golongan: string;
  bentuk_sediaan: string;
  kandungan_aktif: string;
  indikasi: string;
  kontraindikasi: string;
  dosis: string;
  efek_samping: string;
  peringatan: string;
  similarity_score?: number | null;
  matched_by?: string;
}

export interface BarcodeResult {
  type: string;
  data: string;
  rect: { left: number; top: number; width: number; height: number };
}

export interface ScanResult {
  barcodes: BarcodeResult[];
  extracted_text: string;
  bpom_number: string | null;
  candidates_extracted: string[];
  matches: MedicineInfo[];
  pesan: string | null;
}

export interface MedicineSearchResult {
  total: number;
  query: string;
  data: MedicineInfo[];
}

export const SYMPTOMS_LIST = [
  "BAB_cair",
  "batuk",
  "batuk_kering",
  "batuk_malam_hari",
  "dada_sesak",
  "demam",
  "demam_malam_hari",
  "demam_tinggi",
  "diare",
  "hilang_penciuman",
  "hilang_perasa",
  "jantung_berdebar",
  "kurang_nafsu_makan",
  "leher_tegang",
  "lelah",
  "lemas",
  "mual",
  "muntah",
  "napas_berbunyi",
  "nyeri_sendi",
  "nyeri_ulu_hati",
  "penglihatan_kabur",
  "perut_kembung",
  "pucat",
  "pusing",
  "ruam_kulit",
  "sakit_kepala",
  "sakit_kepala_sebelah",
  "sakit_perut",
  "sakit_tenggorokan",
  "sembelit",
  "sensitif_cahaya",
  "sensitif_suara",
  "sesak_napas",
  "tangan_kaki_dingin",
];

// Helper to format symptom strings nicely
export function formatSymptomName(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
