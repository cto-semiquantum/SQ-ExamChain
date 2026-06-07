# 🔗 SQ ExamChain

<div align="center">

![SQ ExamChain Banner](https://img.shields.io/badge/SQ-ExamChain-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOSA1IDktNXYtNUwyIDEyek0yIDEybDkgNSA5LTV2LTVMMiAxMnoiLz48L3N2Zz4=)

**Blockchain-Based Secure Examination Distribution & Leak Traceability System**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*A production-grade secure exam paper distribution platform with AES-256 encryption, invisible PDF fingerprinting, time-locked releases, and an immutable blockchain audit trail.*

</div>



---

## 🎯 Problem Statement

Every year, examination papers leak before the exam causing widespread academic fraud. Traditional digital distribution systems have no way to:
- Prove **which center** received and leaked a paper
- Provide **tamper-proof evidence** of who accessed what and when
- **Lock papers** until the exact moment of examination

**SQ ExamChain solves all three.**

---

## ✨ Key Features

### 🔐 Security
- **AES-256 Encryption** — Papers are encrypted the moment they're uploaded. The original PDF never touches the disk unencrypted.
- **JWT Authentication** — Separate role-based access for Admins and Examination Centers.
- **bcrypt Password Hashing** — Passwords are never stored in plaintext.

### 👁️ Invisible Fingerprinting
Every downloaded PDF is dynamically embedded with a **hidden fingerprint** containing:
```json
{
  "center_id": 2,
  "timestamp": "2026-06-07T16:00:00.000Z",
  "download_id": 5
}
```
This fingerprint is injected into the PDF **metadata** and as **2pt white text** (invisible to naked eye). Any leaked paper can be instantly traced to its source.

### ⏳ Time-Locked Examination Papers
- Admins set an **unlock time** when uploading a paper
- Centers **cannot download** until the exact unlock moment
- Live **countdown timers** on center dashboard
- Automatic **UNLOCK_EVENT** logged to blockchain the first time a locked paper is accessed

### ⛓️ Immutable Blockchain Audit Trail
A SHA-256 **hash-chained** log records every event:

```
Block N:
  action: DOWNLOAD_EXAM
  user_id: 2
  timestamp: 2026-06-07T16:43:00
  previous_hash: a3f9d2...  ← points to Block N-1
  current_hash: 7bc12e...   ← SHA-256 of all above fields
```

Tamper any record → hash chain breaks → system flags it instantly.

### 🔍 Leak Investigation Module
- Admin uploads a suspected leaked PDF
- System extracts fingerprint from metadata
- Instantly identifies: **Source Center, Download Time, Blockchain Log ID**

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        React Frontend                          │
│   Login │ Admin Dashboard │ Center Portal │ Leak Investigation │
└────────────────────┬───────────────────────────────────────────┘
                     │ HTTP / Axios (JWT Bearer)
┌────────────────────▼───────────────────────────────────────────┐
│                      FastAPI Backend                           │
│  /auth  │  /admin  │  /center  │  /investigate                │
└──┬──────┬──────────┬───────────┬────────────────────────────┬──┘
   │      │          │           │                            │
   ▼      ▼          ▼           ▼                            ▼
 JWT   SQLite    AES-256      PyMuPDF                  SHA-256 Chain
 Auth    DB     Encrypt/    Fingerprint               Audit Logs
               Decrypt       Engine
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | UI framework |
| **Styling** | Vanilla CSS | Dark theme design system |
| **Backend** | FastAPI (Python 3.12) | REST API |
| **Database** | SQLite + SQLAlchemy | Data persistence |
| **Auth** | JWT (`python-jose`) + `bcrypt` | Authentication |
| **Encryption** | `cryptography` (Fernet/AES-256) | PDF encryption |
| **PDF** | PyMuPDF (`fitz`) | Fingerprint embed/extract |
| **Blockchain** | Custom SHA-256 hash chain | Audit log integrity |

---

## 📁 Project Structure

```
SQ-ExamChain/
├── backend/
│   ├── main.py                    # FastAPI app + CORS + router registration
│   ├── seed.py                    # Creates default admin + center users
│   ├── requirements.txt
│   └── app/
│       ├── core/
│       │   ├── auth.py            # JWT creation/verification, bcrypt hashing
│       │   └── database.py        # SQLAlchemy engine & session factory
│       ├── models/
│       │   ├── user.py            # User model (is_admin, center_name)
│       │   ├── exam.py            # ExamPaper + Assignment + unlock_time
│       │   └── audit.py           # AuditLog with hash chain fields
│       ├── schemas/               # Pydantic request/response schemas
│       ├── api/
│       │   ├── auth.py            # Login, Register, /me
│       │   ├── admin.py           # Upload, Assign, Stats, Logs
│       │   ├── center.py          # My-exams, Time-locked Download
│       │   └── investigate.py     # Fingerprint extraction + trace
│       └── services/
│           ├── crypto_service.py  # AES-256 encrypt/decrypt
│           ├── fingerprint_service.py  # PDF fingerprint embed/extract
│           └── blockchain_service.py   # Hash chain audit logger
│
├── frontend/
│   └── src/
│       ├── index.css              # Complete dark-theme design system
│       ├── App.jsx                # React Router with protected routes
│       ├── services/api.js        # Axios instance with JWT interceptor
│       ├── components/
│       │   └── AdminLayout.jsx    # Sidebar navigation shell
│       └── pages/
│           ├── Login.jsx
│           ├── AdminDashboard.jsx # Stats + blockchain status + countdown panel
│           ├── UploadExam.jsx     # Upload with time-lock toggle
│           ├── AssignExam.jsx
│           ├── AuditLogs.jsx      # Filterable hash-chain log table
│           ├── Investigate.jsx    # Leak trace module
│           └── CenterDashboard.jsx # Live countdown + locked/unlocked state
│
├── database/                      # SQLite DB lives here (auto-created)
└── papers/                        # Encrypted .enc files (auto-created)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repo
```bash
git clone https://github.com/cto-semiquantum/SQ-ExamChain.git
cd SQ-ExamChain
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Seed default users
python seed.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Run Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```
> API live at **http://localhost:8000**
> Swagger UI at **http://localhost:8000/docs**

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
> App live at **http://localhost:5173**

---

## 🔑 Default Credentials

| Role | Username | Password |
|---|---|---|
| 🔑 Admin | `admin` | `admin123` |
| 🏫 Center | `center1` | `center123` |

---

## 🔄 Complete User Flow

```
1. Admin uploads PDF
       ↓ AES-256 encrypted → stored as .enc file
2. Admin assigns to center (optional: set unlock_time)
       ↓ Assignment logged to blockchain
3. Center logs in → sees exam card
       ├── If LOCKED: countdown timer shown, download disabled
       └── If UNLOCKED: download button active
4. Center downloads
       ↓ Server: decrypt → inject fingerprint → send PDF
       ↓ DOWNLOAD_EXAM + UNLOCK_EVENT logged to blockchain
5. Paper leaks...
       ↓ Admin uploads suspected PDF to Investigate module
       ↓ Fingerprint extracted from metadata
       └── Center identified: name, ID, download time, blockchain log ID
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | None | Get JWT token |
| `GET` | `/auth/me` | JWT | Get current user |
| `POST` | `/admin/upload` | Admin | Encrypt + store PDF |
| `POST` | `/admin/assign` | Admin | Assign exam to center |
| `GET` | `/admin/exams` | Admin | List all exams |
| `GET` | `/admin/centers` | Admin | List all centers |
| `GET` | `/admin/dashboard-stats` | Admin | Stats + upcoming unlocks |
| `GET` | `/admin/audit-logs` | Admin | Full audit trail |
| `GET` | `/admin/verify-blockchain` | Admin | Verify hash chain integrity |
| `GET` | `/center/my-exams` | Center | Assigned exams with lock status |
| `GET` | `/center/download/{id}` | Center | Time-gated fingerprinted download |
| `POST` | `/investigate/check-leak` | Admin | Extract fingerprint from PDF |

### Time-Lock Response (when paper is locked)
```json
HTTP 403
{
  "detail": {
    "error": "PAPER_LOCKED",
    "message": "This paper is time-locked. Unlocks at 2026-06-08T05:00:00 UTC.",
    "unlock_time": "2026-06-08T05:00:00",
    "seconds_remaining": 3600,
    "time_remaining": "01:00:00"
  }
}
```

---

## 🔒 Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    THREAT MODEL                         │
├────────────────────┬────────────────────────────────────┤
│ Threat             │ Mitigation                         │
├────────────────────┼────────────────────────────────────┤
│ Paper theft        │ AES-256 encryption at rest         │
│ Early access       │ Time-lock gate at API level        │
│ Leak cover-up      │ Invisible fingerprint in every PDF │
│ Log tampering      │ SHA-256 hash chain (blockchain)    │
│ Identity spoofing  │ JWT + bcrypt authentication        │
│ Man-in-middle      │ CORS policy + token-based auth     │
└────────────────────┴────────────────────────────────────┘
```

---

## 🗺️ Roadmap

- [x] AES-256 PDF encryption
- [x] Invisible PDF fingerprinting
- [x] SHA-256 blockchain audit log
- [x] Time-locked examination papers
- [x] Countdown timers on center dashboard
- [x] Leak investigation module
- [ ] Real Ethereum smart contract integration
- [ ] Email/SMS notification on paper unlock
- [ ] Multi-center bulk assignment
- [ ] Role: Invigilator (read-only access during exam)
- [ ] PDF steganography (advanced fingerprinting)
- [ ] Admin analytics dashboard with charts

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**SemiQuantum** — Building secure academic infrastructure.

> *"In a world where exam papers leak, SQ ExamChain makes every leak traceable."*

---

<div align="center">

Made with ❤️ by the SemiQuantum team

⭐ Star this repo if it helped you!

</div>
