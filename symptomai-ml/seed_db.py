import pandas as pd
from db import SessionLocal, engine
from db_model import Base, Medicine


def main() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(Medicine).count()
        if existing > 0:
            print(f"Skip seed: tabel medicines sudah berisi {existing} data")
            return

        df = pd.read_csv("dataset_obat.csv")
        rows = []
        for _, r in df.iterrows():
            rows.append(
                Medicine(
                    id=int(r["id"]),
                    nama_obat=str(r["nama_obat"]),
                    nama_generik=str(r["nama_generik"]),
                    kategori=str(r["kategori"]),
                    golongan=str(r["golongan"]),
                    bentuk_sediaan=str(r["bentuk_sediaan"]),
                    kandungan_aktif=str(r["kandungan_aktif"]),
                    indikasi=str(r["indikasi"]),
                    kontraindikasi=str(r["kontraindikasi"]),
                    dosis=str(r["dosis"]),
                    efek_samping=str(r["efek_samping"]),
                    peringatan=str(r["peringatan"]),
                )
            )

        db.bulk_save_objects(rows)
        db.commit()
        print(f"Seed selesai: {len(rows)} medicines dimasukkan")
    finally:
        db.close()


if __name__ == "__main__":
    main()
