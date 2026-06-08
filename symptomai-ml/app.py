import io
import re
from typing import Dict, List, Optional
import joblib
import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from pydantic import BaseModel

app = FastAPI(
    title="SymptomAI ML API",
    description="API untuk prediksi penyakit dan informasi/scan obat menggunakan Machine Learning",
)

try:
    data = joblib.load("model_symptomai.pkl")
    model = data["model"]
    features = data["features"]
except FileNotFoundError:
    model = None
    features = []
    print(
        "Warning: model_symptomai.pkl belum dibuat. Lakukan training terlebih dahulu."
    )
except Exception as e:
    model = None
    features = []
    print(f"Error loading model: {e}")

try:
    medicine_df = pd.read_csv("dataset_obat.csv")
    print(f"Database obat dimuat: {len(medicine_df)} obat.")
except FileNotFoundError:
    medicine_df = None
    print(
        "Warning: dataset_obat.csv tidak ditemukan. Jalankan generate_dataset_obat.py."
    )
except Exception as e:
    medicine_df = None
    print(f"Error loading medicine database: {e}")

class SymptomRequest(BaseModel):
    symptoms: Dict[str, bool]

def _preprocess_images(image_bytes: bytes) -> list:
    """
    Return list of preprocessed PIL Image objects for OCR attempts.
    Tries multiple strategies; more strategies are available when opencv
    is installed (better adaptive thresholding / denoising).
    """
    from PIL import Image, ImageFilter, ImageOps

    images = []
    base_img = Image.open(io.BytesIO(image_bytes))

    img1 = base_img.convert("L")
    img1 = ImageOps.autocontrast(img1)
    img1 = img1.filter(ImageFilter.SHARPEN)
    images.append(img1)

    img2 = base_img.convert("L")
    img2 = ImageOps.equalize(img2)
    images.append(img2)

    w, h = base_img.size
    if max(w, h) < 1200:
        scale = 1200 / max(w, h)
        img3 = base_img.resize((int(w * scale), int(h * scale)), Image.LANCZOS).convert(
            "L"
        )
        img3 = ImageOps.autocontrast(img3)
        images.append(img3)

    # Strategy 4 & 5: OpenCV adaptive + Otsu thresholding (optional)
    try:
        import cv2
        import numpy as np

        nparr = np.frombuffer(image_bytes, np.uint8)
        bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # Adaptive Gaussian threshold
        adaptive = cv2.adaptiveThreshold(
            denoised,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11,
            2,
        )
        images.append(Image.fromarray(adaptive))

        # Otsu's threshold
        _, otsu = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        images.append(Image.fromarray(otsu))
    except ImportError:
        pass  # opencv is optional

    return images


# ─── OCR ─────────────────────────────────────────────────────────────────────
def _extract_text_ocr(image_bytes: bytes) -> str:
    """
    Extract text from image bytes using pytesseract.
    Tries multiple preprocessing strategies and returns the result with the
    most characters (heuristic for "most information").
    """
    try:
        import pytesseract
    except ImportError as exc:
        raise HTTPException(
            status_code=501,
            detail=(
                f"Library OCR tidak terinstal ({exc}). "
                "Install: pip install pytesseract Pillow"
            ),
        )

    try:
        images = _preprocess_images(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Gagal memproses gambar: {str(e)}")

    lang = "ind+eng" if "ind" in (pytesseract.get_languages(config="") or []) else "eng"

    best_text = ""
    for img in images:
        try:
            text = pytesseract.image_to_string(img, lang=lang).strip()
            if len(text) > len(best_text):
                best_text = text
        except Exception:
            continue

    return best_text


def _scan_barcode_from_image(image_bytes: bytes) -> list:
    """
    Decode barcodes and QR codes from the image using pyzbar.
    Returns an empty list if pyzbar is not installed (optional dependency).
    """
    try:
        from pyzbar import pyzbar
    except ImportError:
        return []

    try:
        import cv2
        import numpy as np

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except ImportError:
        import numpy as np
        from PIL import Image

        img = np.array(Image.open(io.BytesIO(image_bytes)))

    try:
        codes = pyzbar.decode(img)
        return [
            {
                "type": c.type,
                "data": c.data.decode("utf-8", errors="replace"),
                "rect": {
                    "left": c.rect.left,
                    "top": c.rect.top,
                    "width": c.rect.width,
                    "height": c.rect.height,
                },
            }
            for c in codes
        ]
    except Exception:
        return []


# ─── Text Candidate Extraction ────────────────────────────────────────────────
def _extract_candidates_from_text(text: str) -> List[str]:
    """
    Tokenise OCR text into 1-, 2-, and 3-gram candidates that may be medicine
    names.  Only tokens with >= 3 characters are kept; duplicates are removed.
    """
    # Retain alphanumeric chars, spaces, hyphens, and plus signs
    cleaned = re.sub(r"[^a-zA-Z0-9\s\-\+]", " ", text)
    words = [w for w in cleaned.split() if len(w) >= 3]

    if not words:
        return []

    candidates: List[str] = []
    seen: set = set()

    def _add(c: str) -> None:
        lc = c.lower()
        if lc not in seen:
            seen.add(lc)
            candidates.append(c)

    for w in words:
        _add(w)
    for i in range(len(words) - 1):
        _add(f"{words[i]} {words[i + 1]}")
    for i in range(len(words) - 2):
        _add(f"{words[i]} {words[i + 1]} {words[i + 2]}")

    return candidates


# ─── BPOM Number Detection ────────────────────────────────────────────────────
def _detect_bpom_number(text: str) -> Optional[str]:
    """
    Attempt to extract a BPOM registration number from OCR text.
    Common prefixes: DTL, GTL, DBL, GBL, DKL, GKL, SD, SI, TR, TI, FF.
    Returns the first match or None.
    """
    pattern = (
        r"\b(?:DTL|GTL|DBL|GBL|DKL|GKL|SD|SI|TR|TI|FF)"
        r"\s*\d[\d\s]{6,14}\b"
    )
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(0).strip() if match else None


# ─── Fuzzy Search ─────────────────────────────────────────────────────────────
def _fuzzy_search(query: str, top_n: int = 5) -> list:
    """Fuzzy-match a single query against medicine names and generic names."""
    if medicine_df is None:
        return []

    try:
        from thefuzz import process
    except ImportError:
        # Fallback: simple substring match
        q = query.lower()
        mask = medicine_df["nama_obat"].str.lower().str.contains(
            q, na=False
        ) | medicine_df["nama_generik"].str.lower().str.contains(q, na=False)
        rows = medicine_df[mask].head(top_n)
        return [
            {**row.to_dict(), "similarity_score": None} for _, row in rows.iterrows()
        ]

    name_to_id: Dict[str, int] = {}
    for _, row in medicine_df.iterrows():
        name_to_id[row["nama_obat"]] = int(row["id"])
        name_to_id[row["nama_generik"]] = int(row["id"])

    matches = process.extract(query, list(name_to_id.keys()), limit=top_n * 2)

    results = []
    seen_ids: set = set()
    for match_name, score in matches:
        row_id = name_to_id[match_name]
        if row_id not in seen_ids and len(results) < top_n:
            seen_ids.add(row_id)
            row = medicine_df[medicine_df["id"] == row_id].iloc[0]
            results.append({**row.to_dict(), "similarity_score": score})

    return results


def _fuzzy_search_multi(candidates: List[str], top_n: int = 5) -> list:
    """
    Fuzzy-match multiple candidate strings against the medicine database.
    Results are merged and ranked by the best similarity score found across
    all candidates.  Only matches with a score >= 60 are included.
    Each result includes a ``matched_by`` field showing which candidate
    triggered the match.
    """
    if not candidates or medicine_df is None:
        return []

    try:
        from thefuzz import process
    except ImportError:
        # Graceful degradation: substring search on all candidates
        seen_ids: set = set()
        results = []
        for cand in candidates:
            q = cand.lower()
            mask = medicine_df["nama_obat"].str.lower().str.contains(
                q, na=False
            ) | medicine_df["nama_generik"].str.lower().str.contains(q, na=False)
            for _, row in medicine_df[mask].iterrows():
                rid = int(row["id"])
                if rid not in seen_ids:
                    seen_ids.add(rid)
                    results.append(
                        {**row.to_dict(), "similarity_score": None, "matched_by": cand}
                    )
                    if len(results) >= top_n:
                        return results
        return results

    name_to_id: Dict[str, int] = {}
    for _, row in medicine_df.iterrows():
        name_to_id[row["nama_obat"]] = int(row["id"])
        name_to_id[row["nama_generik"]] = int(row["id"])

    name_list = list(name_to_id.keys())

    # Track best (score, matched_by) per medicine id
    best: Dict[int, tuple] = {}

    for candidate in candidates:
        try:
            hits = process.extractBests(candidate, name_list, score_cutoff=60, limit=5)
            for match_name, score in hits:
                row_id = name_to_id[match_name]
                if row_id not in best or score > best[row_id][0]:
                    best[row_id] = (score, candidate)
        except Exception:
            continue

    sorted_ids = sorted(best.items(), key=lambda x: x[1][0], reverse=True)[:top_n]

    results = []
    for row_id, (score, matched_by) in sorted_ids:
        row = medicine_df[medicine_df["id"] == row_id]
        if not row.empty:
            results.append(
                {
                    **row.iloc[0].to_dict(),
                    "similarity_score": score,
                    "matched_by": matched_by,
                }
            )

    return results


# ─── Root ────────────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {
        "message": "Selamat datang di SymptomAI ML API.",
        "endpoints": {
            "prediksi_penyakit": "/predict",
            "daftar_gejala": "/symptoms",
            "daftar_obat": "/medicines",
            "kategori_obat": "/medicines/categories",
            "cari_obat": "/medicines/search?q=paracetamol",
            "scan_obat": "/medicines/scan  [POST, multipart image]",
            "detail_obat": "/medicines/{id}",
        },
    }


# ─── Disease Prediction ──────────────────────────────────────────────────────
@app.get("/symptoms")
def get_all_symptoms():
    """Mengembalikan daftar semua gejala yang dikenali oleh model."""
    if not features:
        raise HTTPException(status_code=500, detail="Model belum dilatih.")
    return {"symptoms": features}


@app.post("/predict")
def predict_disease(request: SymptomRequest):
    if not model:
        raise HTTPException(
            status_code=500,
            detail="Model belum dilatih. Harap jalankan train.py.",
        )

    input_data = [1 if request.symptoms.get(f, False) else 0 for f in features]

    prediction = model.predict([input_data])
    probabilities = model.predict_proba([input_data])[0]
    confidence = max(probabilities) * 100

    return {
        "prediction": prediction[0],
        "confidence": f"{confidence:.2f}%",
    }


# ─── Medicine Database ───────────────────────────────────────────────────────
@app.get("/medicines")
def get_medicines(
    skip: int = Query(0, ge=0, description="Mulai dari indeks ke-n"),
    limit: int = Query(20, ge=1, le=100, description="Jumlah data (maks 100)"),
):
    """Mengembalikan daftar semua obat secara paginasi."""
    if medicine_df is None:
        raise HTTPException(status_code=500, detail="Database obat tidak tersedia.")

    total = len(medicine_df)
    records = medicine_df.iloc[skip : skip + limit].to_dict(orient="records")
    return {"total": total, "skip": skip, "limit": limit, "data": records}


@app.get("/medicines/categories")
def get_medicine_categories():
    """Mengembalikan daftar kategori obat beserta jumlahnya."""
    if medicine_df is None:
        raise HTTPException(status_code=500, detail="Database obat tidak tersedia.")

    counts = medicine_df["kategori"].value_counts().to_dict()
    return {"categories": [{"kategori": k, "jumlah": v} for k, v in counts.items()]}


@app.get("/medicines/search")
def search_medicines(
    q: str = Query(..., min_length=1, description="Nama obat / zat aktif yang dicari"),
    kategori: Optional[str] = Query(None, description="Filter berdasarkan kategori"),
    golongan: Optional[str] = Query(
        None, description="Filter berdasarkan golongan (e.g. 'Obat Bebas')"
    ),
):
    """
    Cari obat berdasarkan nama, nama generik, atau kandungan aktif.
    Mendukung pencarian parsial (substring).
    """
    if medicine_df is None:
        raise HTTPException(status_code=500, detail="Database obat tidak tersedia.")

    mask = (
        medicine_df["nama_obat"].str.contains(q, case=False, na=False)
        | medicine_df["nama_generik"].str.contains(q, case=False, na=False)
        | medicine_df["kandungan_aktif"].str.contains(q, case=False, na=False)
    )
    result = medicine_df[mask].copy()

    if kategori:
        result = result[result["kategori"].str.lower() == kategori.lower()]

    if golongan:
        result = result[
            result["golongan"].str.lower().str.contains(golongan.lower(), na=False)
        ]

    return {"total": len(result), "query": q, "data": result.to_dict(orient="records")}


@app.post("/medicines/scan")
async def scan_medicine(
    file: UploadFile = File(
        ..., description="Gambar kemasan/label obat (JPG, PNG, dll.)"
    ),
    top_n: int = Query(
        5, ge=1, le=10, description="Jumlah hasil terbaik yang dikembalikan"
    ),
    use_barcode: bool = Query(
        True,
        description="Aktifkan pemindaian barcode/QR pada gambar (memerlukan pyzbar)",
    ),
):
    """
    Scan gambar kemasan obat dan cocokkan dengan database obat.

    **Alur kerja:**
    1. **Barcode / QR scan** — jika ditemukan, data barcode dijadikan kandidat
       pencarian tambahan (memerlukan `pyzbar` + `libzbar0`).
    2. **OCR** — teks diekstrak dari gambar menggunakan Tesseract dengan
       beberapa strategi preprocessing (grayscale, histogram equalization,
       upscaling, dan — jika `opencv` tersedia — adaptive/Otsu thresholding).
    3. **Tokenisasi n-gram** — teks OCR dipecah menjadi kandidat 1-, 2-, dan
       3-gram kata untuk mengurangi kesalahan matching akibat teks kemasan yang
       panjang.
    4. **Fuzzy matching** — setiap kandidat di-match terhadap database obat;
       hasil digabung dan diurutkan berdasarkan skor tertinggi (threshold 60).
    5. **Deteksi nomor BPOM** — nomor registrasi BPOM diekstrak jika ada.

    **Response tambahan dibandingkan versi sebelumnya:**
    - `barcodes` — daftar barcode/QR yang ditemukan
    - `bpom_number` — nomor BPOM jika terdeteksi
    - `candidates_extracted` — token kandidat nama obat dari OCR (maks 20)
    - `matched_by` — kandidat token mana yang memicu setiap match

    **Persyaratan server:** Tesseract OCR harus terinstal.
    **Opsional:** `pyzbar` + `libzbar0` untuk barcode; `opencv-python-headless`
    untuk preprocessing lebih akurat.
    """
    if medicine_df is None:
        raise HTTPException(status_code=500, detail="Database obat tidak tersedia.")

    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=422,
            detail=f"File harus berupa gambar. Diterima: {content_type}",
        )

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=422, detail="File gambar kosong.")

    response: dict = {
        "barcodes": [],
        "extracted_text": "",
        "bpom_number": None,
        "candidates_extracted": [],
        "matches": [],
        "pesan": None,
    }

    # ── Step 1: Barcode / QR scan ──────────────────────────────────────────
    if use_barcode:
        response["barcodes"] = _scan_barcode_from_image(contents)

    # ── Step 2: OCR ────────────────────────────────────────────────────────
    raw_text = _extract_text_ocr(contents)
    response["extracted_text"] = raw_text

    if not raw_text and not response["barcodes"]:
        response["pesan"] = (
            "Tidak ada teks atau barcode yang berhasil diekstrak dari gambar. "
            "Pastikan gambar cukup jelas dan nama obat terbaca."
        )
        return response

    # ── Step 3: Detect BPOM number ─────────────────────────────────────────
    if raw_text:
        response["bpom_number"] = _detect_bpom_number(raw_text)

    # ── Step 4: Build candidates & fuzzy-match ─────────────────────────────
    candidates: List[str] = []

    # Barcode data takes priority as search candidates
    for code in response["barcodes"]:
        bd = code.get("data", "")
        if bd:
            candidates.insert(0, bd)

    # N-gram candidates from OCR text
    if raw_text:
        candidates += _extract_candidates_from_text(raw_text)

    response["candidates_extracted"] = candidates[:20]

    if candidates:
        response["matches"] = _fuzzy_search_multi(candidates, top_n=top_n)

    if not response["matches"]:
        response["pesan"] = (
            "Tidak ada obat yang cocok ditemukan. "
            "Coba foto lebih dekat pada nama obat atau gunakan gambar yang lebih jelas."
        )

    return response


@app.get("/medicines/{medicine_id}")
def get_medicine_by_id(medicine_id: int):
    """Mengembalikan detail lengkap sebuah obat berdasarkan ID."""
    if medicine_df is None:
        raise HTTPException(status_code=500, detail="Database obat tidak tersedia.")

    row = medicine_df[medicine_df["id"] == medicine_id]
    if row.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Obat dengan ID {medicine_id} tidak ditemukan.",
        )

    return row.iloc[0].to_dict()
