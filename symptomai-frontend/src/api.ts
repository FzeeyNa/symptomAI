import { AnalysisResult, ScanResult, MedicineSearchResult } from "./types";

const BASE_URL = "https://symptomai-api-fazry12345.azurewebsites.net";

export async function predictDisease(
  symptoms: Record<string, boolean>,
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: Failed to reach ML API`);
    }

    return response.json() as Promise<AnalysisResult>;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      "Gagal menghubungi server ML. Pastikan koneksi internet aktif dan server Azure menyala.",
    );
  }
}

export async function scanMedicine(
  imageUri: string,
  topN = 5,
): Promise<ScanResult> {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "medicine_scan.jpg",
    } as any);

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
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memindai gambar. Pastikan koneksi internet aktif dan server aktif.",
    );
  }
}

export async function searchMedicines(
  q: string,
): Promise<MedicineSearchResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/medicines/search?q=${encodeURIComponent(q)}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    return response.json() as Promise<MedicineSearchResult>;
  } catch (error) {
    console.error("Search API Error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal mencari obat. Pastikan koneksi internet aktif.",
    );
  }
}
