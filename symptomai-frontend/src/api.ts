import { AnalysisResult, ScanResult, MedicineSearchResult, InteractionResult } from "./types";

const BASE_URL = "https://symptomai-api-v2.azurewebsites.net";

// ─── Predict ──────────────────────────────────────────────────────────────────
export async function predictDisease(
  symptoms: Record<string, boolean>,
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    return response.json() as Promise<AnalysisResult>;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Gagal menghubungi server ML. Pastikan koneksi internet aktif.");
  }
}

// ─── Scan Medicine ────────────────────────────────────────────────────────────
export async function scanMedicine(imageUri: string, topN = 5): Promise<ScanResult> {
  try {
    const formData = new FormData();
    formData.append("file", { uri: imageUri, type: "image/jpeg", name: "medicine_scan.jpg" } as any);
    const response = await fetch(`${BASE_URL}/medicines/scan?top_n=${topN}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errText}`);
    }
    return response.json() as Promise<ScanResult>;
  } catch (error) {
    console.error("Scan API Error:", error);
    throw new Error(error instanceof Error ? error.message : "Gagal memindai gambar.");
  }
}

// ─── Search Medicines ─────────────────────────────────────────────────────────
export async function searchMedicines(q: string): Promise<MedicineSearchResult> {
  try {
    const response = await fetch(`${BASE_URL}/medicines/search?q=${encodeURIComponent(q)}`);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    return response.json() as Promise<MedicineSearchResult>;
  } catch (error) {
    console.error("Search API Error:", error);
    throw new Error(error instanceof Error ? error.message : "Gagal mencari obat.");
  }
}

// ─── Drug Interaction Checker ─────────────────────────────────────────────────
export async function checkInteractions(medicineIds: number[]): Promise<InteractionResult> {
  try {
    const response = await fetch(`${BASE_URL}/medicines/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicine_ids: medicineIds }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errText}`);
    }
    return response.json() as Promise<InteractionResult>;
  } catch (error) {
    console.error("Interaction API Error:", error);
    throw new Error(error instanceof Error ? error.message : "Gagal mengecek interaksi obat.");
  }
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
export async function submitFeedbackPredict(payload: {
  prediction: string;
  confidence: string;
  urgency_level: string;
  is_helpful: boolean;
  note?: string;
}): Promise<void> {
  try {
    await fetch(`${BASE_URL}/feedback/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Feedback predict error:", error);
    // silent fail — jangan ganggu UX user
  }
}

export async function submitFeedbackScan(payload: {
  top_match?: string;
  is_helpful: boolean;
  note?: string;
}): Promise<void> {
  try {
    await fetch(`${BASE_URL}/feedback/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Feedback scan error:", error);
    // silent fail — jangan ganggu UX user
  }
}
