import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

print("Membaca dataset...")
try:
    df = pd.read_csv('dataset_gejala.csv')
except FileNotFoundError:
    print("Error: dataset_gejala.csv tidak ditemukan. Jalankan generate_dataset.py terlebih dahulu.")
    exit()

# Pisahkan Fitur (X) dan Target (y)
X = df.drop('diagnosis', axis=1)
y = df['diagnosis']

print("Membagi data training dan testing (80:20)...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Melatih model Random Forest...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print("Mengevaluasi model...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Akurasi Model: {accuracy * 100:.2f}%")
print("\nLaporan Klasifikasi:")
print(classification_report(y_test, y_pred))

print("Menyimpan model ke 'model_symptomai.pkl'...")
# Simpan juga daftar nama kolom (gejala) agar API tahu format inputnya
joblib.dump({"model": model, "features": list(X.columns)}, 'model_symptomai.pkl')
print("Selesai!")
