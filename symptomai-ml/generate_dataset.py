import pandas as pd
import random

# Definisi penyakit dan gejalanya (Bahasa Indonesia)
penyakit_gejala = {
    "Flu": ["demam", "batuk", "pilek", "sakit_tenggorokan", "sakit_kepala", "lelah"],
    "DBD": ["demam_tinggi", "nyeri_sendi", "ruam_kulit", "mual", "muntah", "sakit_kepala"],
    "Maag": ["mual", "muntah", "nyeri_ulu_hati", "perut_kembung", "kurang_nafsu_makan"],
    "COVID-19": ["demam", "batuk_kering", "hilang_penciuman", "hilang_perasa", "sesak_napas", "lelah"],
    "Tifus": ["demam_malam_hari", "lemas", "sakit_perut", "diare", "sembelit", "sakit_kepala"],
    "Migrain": ["sakit_kepala_sebelah", "sensitif_cahaya", "sensitif_suara", "mual", "muntah"],
    "Asma": ["sesak_napas", "napas_berbunyi", "dada_sesak", "batuk_malam_hari"],
    "Diare": ["BAB_cair", "sakit_perut", "mual", "muntah", "lemas"],
    "Hipertensi": ["sakit_kepala", "leher_tegang", "pusing", "jantung_berdebar", "penglihatan_kabur"],
    "Anemia": ["lemas", "pucat", "pusing", "sesak_napas", "tangan_kaki_dingin"]
}

# Mengumpulkan semua gejala unik
semua_gejala = set()
for gejala_list in penyakit_gejala.values():
    semua_gejala.update(gejala_list)

semua_gejala = list(semua_gejala)
semua_gejala.sort()

print(f"Total penyakit: {len(penyakit_gejala)}")
print(f"Total gejala: {len(semua_gejala)}")

# Membuat dataset tiruan yang realistis (1000 baris)
data = []
for _ in range(1000):
    # Pilih penyakit secara acak
    penyakit = random.choice(list(penyakit_gejala.keys()))
    
    # Ambil gejala asli dari penyakit tersebut
    gejala_asli = penyakit_gejala[penyakit]
    
    # Pasien mungkin tidak mengalami SEMUA gejala, jadi kita pilih secara acak (minimal 2 gejala)
    num_gejala_dialami = random.randint(2, len(gejala_asli))
    gejala_dialami = random.sample(gejala_asli, num_gejala_dialami)
    
    # Tambahkan sedikit "noise" (gejala acak yang tidak berhubungan, probabilitas 10%)
    if random.random() < 0.1:
        gejala_tambahan = random.choice(semua_gejala)
        if gejala_tambahan not in gejala_dialami:
            gejala_dialami.append(gejala_tambahan)
            
    # Buat baris data
    baris = {gejala: (1 if gejala in gejala_dialami else 0) for gejala in semua_gejala}
    baris["diagnosis"] = penyakit
    data.append(baris)

# Simpan ke CSV
df = pd.DataFrame(data)
df.to_csv("dataset_gejala.csv", index=False)
print("Dataset 'dataset_gejala.csv' berhasil dibuat dengan 1000 baris data pelatihan.")
