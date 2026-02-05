
# TrustEstate: Secure Real Estate Marketplace

TrustEstate is a blockchain-inspired real estate platform that eliminates property fraud through biometric verification, asset hash-linking, and a zero-trust handshake protocol.

## 🚀 Deployment to Vercel

Follow these steps to deploy TrustEstate to Vercel:

### 1. Prerequisites
- A **GitHub** account.
- A **Google AI Studio** API Key ([Get it here](https://aistudio.google.com/)).
- A **Neon.tech** Postgres instance ([Get it here](https://neon.tech/)).

### 2. Environment Variables
Add these variables in the Vercel Dashboard under **Settings > Environment Variables**:

| Variable | Description |
| :--- | :--- |
| `API_KEY` | Your Google Gemini API Key. |
| `DATABASE_URL` | Your Neon Postgres connection string (starts with `postgresql://`). |

### 3. Build & Output Settings
Vercel should detect the settings automatically, but ensure they are as follows:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 🛠️ Tech Stack
- **Frontend:** React 19, Tailwind CSS, Lucide Icons.
- **AI Engine:** Google Gemini (Flash 2.5/3.0) for KYC and Fraud Analysis.
- **Database:** Neon Serverless Postgres.
- **Security:** SHA-256 Hashing, Biometric Identity Mapping.

## 📄 Requirements
See `requirements.txt` for a detailed list of system and software dependencies.

---
*Built with Trust & Integrity • 2025*
