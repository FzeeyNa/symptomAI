import { AnalysisResult } from './types';

const AZURE_API_URL = 'https://symptomai-api-fazry12345.azurewebsites.net/predict';

export async function predictDisease(symptoms: Record<string, boolean>): Promise<AnalysisResult> {
  try {
    const response = await fetch(AZURE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: Failed to reach ML API`);
    }

    const data: AnalysisResult = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Gagal menghubungi server ML. Pastikan koneksi internet aktif dan server Azure menyala.');
  }
}
