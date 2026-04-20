# 🌾 AgriAssist — National Farmer Advisory System (v2.2)

> **AI-powered, multilingual farming advisory platform for Indian farmers.**  
> Built with Next.js, Python Flask microservices, Machine Learning & LLM integration.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [ML Models](#ml-models)
- [Twilio SMS OTP](#twilio-sms-otp)
- [Setup & Run](#setup--run)
- [Multilingual Support](#multilingual-support)

---

## Overview
AgriAssist is a production-grade microservices platform dedicated to Indian agriculture. It provides farmers with real-time, data-driven advice on crop selection, fertilization, irrigation, and weather risks. 

**What's New in v2.2:**
- **Expanded Datasets:** Crop and Fertilizer models retrained on ~5,000+ row datasets.
- **More Crops:** Added Moong and additional crop varieties to Fertilizer recommendations.
- **More Fertilizers:** Ammonium Sulphate, 19:19:19 NPK, 20:20:0:13, MOP now supported.
- **Better ML:** Upgraded to 300-tree Random Forest with balanced class weights.
- **Rainfall Clarification:** Weather service (Open-Meteo) provides rainfall forecast natively — no separate Rainfall prediction service needed.

**Previous v2.1 improvements:**
- **National Coverage:** Advice context expanded to all of India.
- **English Default:** English is now the default UI language for national accessibility.
- **Real SMS OTP:** Integrated Twilio for secure 6-digit mobile verification.
- **Auto-DB Setup:** Backend automatically initializes the PostgreSQL database.

---

## Key Features
- 🌤️ **GPS-based Weather & Rain Forecast:** 7-day live forecasts including daily rainfall (precipitation_sum) from Open-Meteo API.
- 🌾 **Crop Advisory:** Random Forest model (300 trees) predicts top 5 crops with probabilities.
- 🧪 **Fertilizer Guide:** Personalized fertilizer recommendations from 8+ options via ML.
- 💧 **AI Irrigation:** Gemini-powered irrigation plans based on live weather.
- 🤖 **India-Wide AI Chat:** Rapid responses via Groq/LLaMA-3.3.
- 🚨 **Risk Alerts:** Instant alerts for Floods, Heatwaves, Frost, and Blight.

---

## Tech Stack
- **Frontend:** Next.js 15, Tailwind CSS, shadcn/ui.
- **Backend:** Python Flask (8 independent microservices).
- **ML/AI:** Scikit-learn (RandomForestClassifier), Groq (LLaMA 3.3), Google Gemini.
- **Communication:** Twilio SMS API.
- **Database:** PostgreSQL (with auto-provisioning).
- **Data:** Open-Meteo (weather + rainfall), OpenStreetMap/Nominatim.

---

## ML Models

### Crop Recommendation (Port 5001)
| Property | Detail |
|----------|--------|
| Algorithm | Random Forest (300 trees, balanced) |
| Dataset | `crop/smart_crop_data.csv` (~5001 rows, primary) |
| Features | N, P, K, pH, Rainfall, Temperature, District, Soil |
| Output | Top-5 crops with confidence % |
| Districts | Kolhapur, Pune, Sangli, Satara, Solapur |
| **Retrain** | `cd crop && python train_final_model.py` |

### Fertilizer Advisory (Port 5002)
| Property | Detail |
|----------|--------|
| Algorithm | Random Forest (300 trees, balanced) |
| Dataset | `fert/fertilizer_data.csv` (~5001 rows) |
| Features | N, P, K, pH, Rainfall, Temperature, District, Soil, Crop |
| Fertilizers | Urea, DAP, MOP, 10:26:26 NPK, 19:19:19 NPK, 20:20:0:13, Ammonium Sulphate |
| Crops | Cotton, Grapes, Jowar, Maize, Moong, Pomegranate, Rice, Soybean, Sugarcane, Tur, Wheat |
| **Retrain** | `cd fert && python train_model.py` |

### About Rainfall Prediction
The `Weather` service (Port 5003) fetches **7-day precipitation forecasts** directly from Open-Meteo API. This provides accurate, real-world rainfall data — making a separate ML-based rainfall prediction model unnecessary. The `/Rainfall` folder is an archived prototype and is **not used** by the system.

---

## Twilio SMS OTP
The system is ready for real SMS delivery.
1. Sign up at [Twilio](https://twilio.com).
2. Get your `Account SID`, `Auth Token`, and `Phone Number`.
3. Update `backend/server.py` with your credentials.
4. Set `TWILIO_ENABLED = True`.
*For detailed steps, see [TWILIO_SETUP.txt](./TWILIO_SETUP.txt).*

---

## Setup & Run

### Prerequisites
- Node.js 18+, Python 3.10+, PostgreSQL.

### Installation
```bash
pip install -r requirements.txt
cd App && npm install
```

### Retrain ML Models (after adding new data)
```bash
cd crop && python train_final_model.py
cd fert && python train_model.py
```

### Execution
Run each service in its own terminal (refer to [start_step.txt](./start_step.txt) for sequence):
1. `backend/server.py` (Port 5009)
2. `App/ (npm run dev)` (Port 9002)
3. Other model services (Ports 5001-5010)

---

## Multilingual Support
- **English (Default)**
- **Hindi**
- **Marathi**
*Switch languages via the dropdown in the navigation bar. All regional text is pure and professional.*

---

## Port Reference
| Port | Service |
|------|---------|
| 9002 | Frontend (Next.js) |
| 5001 | Crop Recommendation |
| 5002 | Fertilizer Advisory |
| 5003 | Weather + Rainfall Forecast |
| 5005 | AI Chat (Groq/LLaMA) |
| 5006 | Smart Irrigation (Gemini) |
| 5009 | Main API (Auth, DB, SMS) |
| 5010 | Live Alert System |

---
© 2026 AgriAssist — Farmer Advisory System. All rights reserved.
