from db import Base
from sqlalchemy import Column, Integer, String, Text


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    nama_obat = Column(String(255), index=True, nullable=False)
    nama_generik = Column(String(255), index=True, nullable=False)
    kategori = Column(String(120), index=True, nullable=False)
    golongan = Column(String(120), index=True, nullable=False)
    bentuk_sediaan = Column(String(255), nullable=False)
    kandungan_aktif = Column(Text, nullable=False)
    indikasi = Column(Text, nullable=False)
    kontraindikasi = Column(Text, nullable=False)
    dosis = Column(Text, nullable=False)
    efek_samping = Column(Text, nullable=False)
    peringatan = Column(Text, nullable=False)
