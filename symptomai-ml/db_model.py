from sqlalchemy import (
    Column, Integer, BigInteger, String, Text, DateTime, Boolean, ForeignKey, JSON, func, UniqueConstraint
)
from db import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)  # samakan dengan CSV id
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


class MedicineInteraction(Base):
    __tablename__ = "medicine_interactions"

    id = Column(BigInteger, primary_key=True)
    medicine_a_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    medicine_b_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    severity = Column(String(20), nullable=False)  # low/medium/high
    efek = Column(Text, nullable=False)
    saran = Column(Text, nullable=False)

    __table_args__ = (
        UniqueConstraint("medicine_a_id", "medicine_b_id", name="uq_medicine_pair"),
    )


class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(BigInteger, primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    symptoms = Column(JSON, nullable=False)
    prediction = Column(String(255), nullable=False)
    confidence = Column(String(20), nullable=False)
    top_predictions = Column(JSON, nullable=True)
    red_flags = Column(JSON, nullable=True)
    urgency_level = Column(String(20), nullable=True)


class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(BigInteger, primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    extracted_text = Column(Text, nullable=True)
    bpom_number = Column(String(100), nullable=True)
    barcodes = Column(JSON, nullable=True)
    matches = Column(JSON, nullable=True)


class PredictFeedback(Base):
    __tablename__ = "feedback_predict"

    id = Column(BigInteger, primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    prediction_log_id = Column(BigInteger, ForeignKey("prediction_logs.id"), nullable=True)
    is_helpful = Column(Boolean, nullable=False)
    note = Column(Text, nullable=True)


class ScanFeedback(Base):
    __tablename__ = "feedback_scan"

    id = Column(BigInteger, primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    scan_log_id = Column(BigInteger, ForeignKey("scan_logs.id"), nullable=True)
    is_helpful = Column(Boolean, nullable=False)
    note = Column(Text, nullable=True)
