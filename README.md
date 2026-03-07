<div align="center">

# 🎓 EduSync
### The Unified, Real-Time Academic Hub

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![WebSockets](https://img.shields.io/badge/WebSockets-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

**Built with ⚡️ by Team Byte Force for DoubleSlash 4.0**

---

*Fragmented WhatsApp groups, lost PDFs, and unverified answers are a thing of the past. EduSync brings order to academic chaos through strict Role-Based Access Control, Real-Time WebSockets, and AI-powered study orchestration across both Web and Mobile.*

</div>

<br/>

## 🚀 The Vision

University students are drowning in chaotic, decentralized communication. We realized that universities don't need another basic Learning Management System; they need a **verified, real-time academic hub**. 

**EduSync** guarantees a single source of truth for the classroom. By implementing a strict 3-tier hierarchy (Student, Class Representative, and Professor), we ensure that study materials, forum answers, and class schedules are always verified, organized, and instantly accessible. Add in a suite of AI document tools and a live study room, and you have the ultimate cross-platform campus experience.

---

## ✨ Key Features

| Feature | Description | Role Access |
| :--- | :--- | :--- |
| 🛡️ **Strict RBAC** | Custom JWT dependency injection prevents unauthorized API access. | `All` |
| 📚 **Material Hub** | Secure PDF/Image uploads via Cloudinary. | `Upload: All` \| `Verify: Prof/CR` |
| 💡 **Doubt Forum** | Q&A discussion board with a "Professor's Choice" official answer verification. | `Ask/Answer: All` \| `Verify: Prof` |
| 📅 **Dynamic Timetable** | Async database-driven weekly schedule, automatically grouped by day. | `View: All` \| `Edit: Prof/CR` |
| ⏱️ **Live Study Room** | Bi-directional WebSockets track live participants and log actual focus time to the database upon disconnect. | `All` |
| 🤖 **AI Study Tools** | Instantly convert verified PDFs into JSON quizzes, smart summaries, infographics, and interactive RAG chats. | `All` |

---

## 🏗️ System Architecture & Technical Flexes

We engineered EduSync to be highly scalable, production-ready, and heavily I/O optimized.

### 1. Fully Asynchronous Engine (`asyncpg`)
Most university portals crash during exam week because synchronous workers block the server while waiting for the database. Our data layer uses `FastAPI` and `asyncpg`. When 500 students download PDFs or use the AI tools simultaneously, the server suspends operations during network wait times. **Massive scalability, zero threading overhead.**

### 2. In-Memory WebSocket Manager
Our Live Study Room bypasses standard HTTP polling. We built a custom WebSocket `ConnectionManager` that holds open TCP connections in RAM to broadcast live chat to both Web and Mobile clients seamlessly. 
* **The Killer Feature:** When a student closes their app or laptop, the socket drops. Our server catches the `WebSocketDisconnect` event, calculates the exact session duration in seconds, and asynchronously writes their study hours to the database.

### 3. Bulletproof Security
Instead of just basic login, we implemented **Role-Based Access Control (RBAC)** at the endpoint level. If a student maliciously attempts to `PATCH` an answer to mark it as official, the FastAPI gatekeeper intercepts the token, checks the `RoleEnum`, and blocks it with a `403 Forbidden`.

---

## 💻 Tech Stack

**Frontend (Web)**
* React.js (Vite)
* Tailwind CSS
* Lucide Icons
* React Router DOM
* React Markdown

**Frontend (Mobile)**
* Flutter
* Dart
* Cross-platform iOS & Android deployment

**Backend (API Engine)**
* FastAPI (Python)
* PostgreSQL
* SQLAlchemy (Async ORM) & Alembic (Migrations)
* Passlib & python-jose (JWT Authentication)
* Uvicorn (ASGI Server)

**AI & RAG Microservice**
* Retrieval-Augmented Generation (RAG) Pipeline
* Vector Database for Semantic Search
* LLM API Integration (Dynamic Summaries, JSON Quiz Generation, Chat)
* External deployment on Render

**External Services**
* Cloudinary (Multipart File Storage)
* Railway (Deployment)

---

## 🛠️ Local Development Setup

Get the backend engine running on your local machine in under 2 minutes.

### Prerequisites
* Python 3.14
* PostgreSQL & redis running locally

### 1. Clone & Initialize
```bash
git clone [https://github.com/your-repo/edusync-backend.git](https://github.com/your-repo/edusync-backend.git)
cd edusync-backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Clone & Initialize
Create a .env file in the root directory and add your credentials:
``` bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/edusync

# Security
SECRET_KEY=generate_a_strong_random_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Database Migrations
Push the database tables to your local PostgreSQL instance:
```bash
python -m alembic upgrade head
```

### 4. Ignite the Server
```bash
uvicorn app.main:app --reload
```

The API is now live at http://127.0.0.1:8000.
Visit http://127.0.0.1:8000/docs for the interactive Swagger UI!



## 🤝 Team Byte Force
This project was architected and developed for DoubleSlash 4.0.

* Sahid Al Afzal - Backend & Database Design

* Tushar Kanti Sinha - RAG & Vector Database

* Omar Abdullah - Frontend (Mobile)

* Toufik Mamud - Frontend Web

<div align="center">


<i>"Bringing order to academic chaos."</i>
</div>