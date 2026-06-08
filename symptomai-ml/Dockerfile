# Gunakan image Python resmi yang ringan
FROM python:3.12-slim

# Instal Tesseract OCR + bahasa Indonesia & Inggris
# Instal libzbar0 untuk scan barcode/QR (pyzbar)
# Instal libGL untuk opencv
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-ind \
    tesseract-ocr-eng \
    libzbar0 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Atur direktori kerja di dalam kontainer
WORKDIR /app

# Salin file requirements terlebih dahulu untuk memanfaatkan cache Docker
COPY requirements.txt .

# Instal library yang dibutuhkan
RUN pip install --no-cache-dir -r requirements.txt

# Salin semua file project ke dalam kontainer
COPY . .

# Secara default, Azure Web Apps menggunakan port 8000
EXPOSE 8000

# Perintah untuk menjalankan FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
