import csv
from db import SessionLocal, engine
from db_model import Base, DrugInteraction

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # Hapus data lama agar tidak duplikat
        db.query(DrugInteraction).delete()
        db.commit()

        with open("dataset_interaksi_obat.csv", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = [
                DrugInteraction(
                    obat_a=row["obat_a"],
                    obat_b=row["obat_b"],
                    severity=row["severity"],
                    efek=row["efek"],
                    saran=row["saran"],
                )
                for row in reader
            ]
        db.add_all(records)
        db.commit()
        print(f"Seed selesai: {len(records)} interaksi dimasukkan.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()