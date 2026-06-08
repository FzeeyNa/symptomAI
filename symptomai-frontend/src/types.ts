// ============================================================
// TYPES
// ============================================================

export interface AnalysisResult {
  prediction: string;
  confidence: string; // e.g. "85.50%"
}

export const SYMPTOMS_LIST = [
  "BAB_cair", "batuk", "batuk_kering", "batuk_malam_hari", 
  "dada_sesak", "demam", "demam_malam_hari", "demam_tinggi", 
  "diare", "hilang_penciuman", "hilang_perasa", "jantung_berdebar", 
  "kurang_nafsu_makan", "leher_tegang", "lelah", "lemas", "mual", 
  "muntah", "napas_berbunyi", "nyeri_sendi", "nyeri_ulu_hati", 
  "penglihatan_kabur", "perut_kembung", "pucat", "pusing", 
  "ruam_kulit", "sakit_kepala", "sakit_kepala_sebelah", "sakit_perut", 
  "sakit_tenggorokan", "sembelit", "sensitif_cahaya", "sensitif_suara", 
  "sesak_napas", "tangan_kaki_dingin"
];

// Helper to format symptom strings nicely
export function formatSymptomName(key: string): string {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

