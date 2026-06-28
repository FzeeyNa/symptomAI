# SymptomAI

**An open-source AI-powered health companion for symptom analysis, medicine identification, and drug interaction checking.**

[![CI](https://github.com/FzeeyNa/symptomAI/actions/workflows/ci.yml/badge.svg)](https://github.com/FzeeyNa/symptomAI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB.svg?logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020.svg?logo=expo&logoColor=white)](https://expo.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Docker Deployment](#docker-deployment)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

SymptomAI is a mobile health application that combines a Machine Learning backend with a React Native frontend to help users:

- Analyze physical symptoms and receive preliminary disease predictions with urgency levels.
- Scan and identify medicines via image recognition (OCR) or text search.
- Check potential drug interactions between multiple medications.
- Track health check history locally on their device.

> **Disclaimer:** SymptomAI is an educational and assistive tool. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.

---

## Features

### Symptom Checker
Describe your symptoms through an interactive checklist. The ML model analyzes the input and returns disease predictions ranked by confidence, along with an urgency level (Low, Medium, High) and recommended next steps.

### Medicine Scanner
Identify medicines by scanning packaging with your camera (OCR-powered) or by searching the built-in database. View comprehensive drug information including composition, dosage, indications, contraindications, and side effects.

### Drug Interaction Checker
Select two or more medicines and check for known interactions. Results are color-coded by severity (Low, Medium, High) with detailed descriptions and clinical recommendations.

### History Tracking
All symptom checks and medicine scans are automatically saved to local storage, allowing you to review past results without an internet connection.

### Feedback System
Rate the accuracy of predictions and scans. Feedback is collected and stored to continuously improve model performance in future iterations.

---

## Architecture

```text
+-------------------+          HTTPS          +-------------------+
|                   |  <------------------->  |                   |
|   React Native    |                         |   FastAPI Server  |
|   Mobile App      |                         |   (Python)        |
|                   |                         |                   |
|  - Expo SDK 54    |                         |  - ML Model (pkl) |
|  - TypeScript     |                         |  - OCR Pipeline   |
|  - AsyncStorage   |                         |  - PostgreSQL     |
|                   |                         |  - Docker         |
+-------------------+                         +-------------------+
                                                       |
                                                       v
                                              +-------------------+
                                              |  Azure Web App    |
                                              |  (Container)      |
                                              +-------------------+
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React Native 0.81 | Cross-platform mobile framework |
| Expo SDK 54 | Development toolchain and build system |
| TypeScript | Type-safe JavaScript |
| AsyncStorage | Local data persistence |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.8+ | Core programming language |
| FastAPI | High-performance REST API framework |
| Scikit-Learn | Machine Learning model training and inference |
| Pandas | Data processing and manipulation |
| SQLAlchemy 2.0 | Database ORM for PostgreSQL |
| Tesseract OCR | Optical Character Recognition for medicine scanning |
| OpenCV | Image preprocessing for improved OCR accuracy |
| Docker | Containerization for deployment |

### Infrastructure
| Technology | Purpose |
|---|---|
| Azure Web App | Cloud hosting (container-based) |
| Docker Hub | Container registry |
| GitHub Actions | CI/CD pipeline |

---

## Project Structure

```text
symptomai-boilerplate/
|
+-- symptomai-frontend/            # Mobile application (React Native + Expo)
|   +-- App.tsx                     # Root component with tab navigation
|   +-- package.json               # Node.js dependencies
|   +-- index.ts                    # Application entry point
|   +-- android/                    # Native Android build configuration
|   +-- src/
|       +-- api.ts                  # Backend API client (Axios)
|       +-- types.ts                # TypeScript type definitions
|       +-- screens/
|       |   +-- HomeScreen.tsx              # Symptom checker interface
|       |   +-- MedicineScanScreen.tsx       # Medicine scanner (camera + search)
|       |   +-- MedicineInteractionScreen.tsx # Drug interaction checker
|       |   +-- HistoryScreen.tsx            # Saved results history
|       +-- components/
|           +-- ResultCard.tsx              # Disease prediction result display
|           +-- MedicineResultCard.tsx      # Medicine info card
|
+-- symptomai-ml/                   # Backend API and ML pipeline
|   +-- app.py                      # FastAPI application (all endpoints)
|   +-- db.py                       # Database connection configuration
|   +-- db_model.py                 # SQLAlchemy ORM models
|   +-- train.py                    # ML model training script
|   +-- model_symptomai.pkl         # Trained ML model (serialized)
|   +-- generate_dataset.py         # Symptom dataset generator
|   +-- generate_dataset_obat.py    # Medicine dataset generator
|   +-- seed_db.py                  # Database seeding script
|   +-- seed_interactions.py        # Drug interaction data seeder
|   +-- dataset_gejala.csv          # Symptom-disease training data
|   +-- dataset_obat.csv            # Medicine information database
|   +-- dataset_interaksi_obat.csv  # Drug interaction rules
|   +-- requirements.txt           # Python dependencies
|   +-- Dockerfile                  # Container build configuration
|   +-- test_api.py                 # API endpoint tests
|
+-- .github/
|   +-- workflows/
|   |   +-- ci.yml                  # Continuous Integration pipeline
|   +-- ISSUE_TEMPLATE/
|   |   +-- bug_report.md           # Bug report template
|   |   +-- feature_request.md      # Feature request template
|   +-- pull_request_template.md    # PR checklist template
|
+-- README.md                       # Project documentation (this file)
+-- CONTRIBUTING.md                 # Contribution guidelines
+-- LICENSE                         # MIT License
```

---

## Getting Started

### Prerequisites

Ensure the following tools are installed on your system:

- **Node.js** v16 or later -- [Download](https://nodejs.org/)
- **Python** 3.8 or later -- [Download](https://www.python.org/)
- **Android Studio** (for Android Emulator and SDK) -- [Download](https://developer.android.com/studio)
- **Docker** (optional, for containerized backend deployment) -- [Download](https://www.docker.com/)
- **Tesseract OCR** (required for medicine scanning) -- [Installation Guide](https://github.com/tesseract-ocr/tesseract)

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FzeeyNa/symptomAI.git
   cd symptomAI
   ```

2. **Navigate to the backend directory:**
   ```bash
   cd symptomai-ml
   ```

3. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv

   # Windows
   .venv\Scripts\activate

   # macOS / Linux
   source .venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**

   Create a `.env.local` file in the `symptomai-ml` directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/symptomai
   ```

6. **Seed the database (first run only):**
   ```bash
   python seed_db.py
   python seed_interactions.py
   ```

7. **Train the ML model (if model_symptomai.pkl is missing):**
   ```bash
   python train.py
   ```

8. **Start the API server:**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

   The API will be available at `http://localhost:8000`. Interactive API documentation is accessible at `http://localhost:8000/docs`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd symptomai-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the API endpoint:**

   Open `src/api.ts` and update the `BASE_URL` to point to your backend:
   ```typescript
   // For local development
   const BASE_URL = "http://localhost:8000";

   // For production (Azure)
   const BASE_URL = "https://your-app-name.azurewebsites.net";
   ```

4. **Start the development server:**
   ```bash
   npx expo start
   ```

5. **Run on a device or emulator:**
   - Press `a` to open in Android Emulator.
   - Scan the QR code with Expo Go on a physical device.

### Docker Deployment

Build and deploy the backend as a Docker container:

```bash
cd symptomai-ml

# Build the image
docker build -t your-dockerhub-username/symptomai:v1 .

# Run locally
docker run -p 8000:8000 your-dockerhub-username/symptomai:v1

# Push to Docker Hub
docker push your-dockerhub-username/symptomai:v1
```

For Azure Web App deployment:

```bash
az webapp config container set \
  --name your-app-name \
  --resource-group your-resource-group \
  --container-image-name your-dockerhub-username/symptomai:v1

az webapp restart \
  --name your-app-name \
  --resource-group your-resource-group
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check and API metadata |
| `GET` | `/symptoms` | List all available symptoms |
| `POST` | `/predict` | Predict diseases from symptoms |
| `GET` | `/medicines` | List all medicines (paginated) |
| `GET` | `/medicines/categories` | List medicine categories |
| `GET` | `/medicines/search` | Search medicines by name or category |
| `GET` | `/medicines/{id}` | Get medicine details by ID |
| `POST` | `/medicines/scan` | Scan medicine image (OCR) |
| `POST` | `/medicines/interactions` | Check drug interactions |
| `POST` | `/feedback/predict` | Submit prediction feedback |
| `POST` | `/feedback/scan` | Submit scan feedback |

Full interactive documentation is available at `/docs` (Swagger UI) when the server is running.

---

## Roadmap

### v1.0 -- Current Release
- [x] Symptom-based disease prediction with ML
- [x] Medicine database with search functionality
- [x] OCR-based medicine scanning
- [x] Drug interaction checker with severity levels
- [x] Local history tracking
- [x] User feedback collection
- [x] Docker containerization
- [x] Azure deployment
- [x] GitHub Actions CI pipeline

### v1.1 -- Planned
- [ ] Multi-language support (English + Bahasa Indonesia)
- [ ] Push notification reminders for medication schedules
- [ ] Barcode/QR code scanning for medicines
- [ ] Expanded drug interaction database
- [ ] User authentication and cloud sync

### v2.0 -- Future
- [ ] LLM integration for natural language symptom input
- [ ] Personalized health recommendations based on history
- [ ] Telemedicine integration
- [ ] Wearable device data integration
- [ ] Offline-first architecture with background sync

---

## Contributing

We welcome contributions from the community. Please read our [Contributing Guide](CONTRIBUTING.md) for details on our development workflow, coding standards, and how to submit pull requests.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Built with care for better health accessibility.**
