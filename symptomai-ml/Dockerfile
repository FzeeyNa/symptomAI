# Gunakan image Python resmi yang ringan
FROM python:3.12-slim

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
