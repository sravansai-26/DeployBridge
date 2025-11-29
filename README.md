---

# 🚀 DeployBridge — Universal Deployment Platform

### Built by **Team TechnoTitans** | Developed using **Lovable AI Platform**

DeployBridge is a powerful, beginner-friendly deployment automation platform.
It allows users to **upload any frontend project (ZIP)** → detects framework → builds → deploys automatically to **Vercel, Netlify or Firebase**, and returns a **live URL instantly**.

Designed for hackathons, students, and developers who want **1-click deployment**.

---

# 📌 Table of Contents

* [🚀 DeployBridge — Universal Deployment Platform](#-deploybridge--universal-deployment-platform)
* [📌 Project Theme](#-project-theme)
* [✨ Key Features](#-key-features)
* [🛠 Technologies Used](#-technologies-used)
* [📂 Folder Structure](#-folder-structure)
* [📦 Requirements](#-requirements)
* [⚙️ Installation & Setup](#️-installation--setup)
* [🔥 Backend Setup (Node.js)](#-backend-setup-nodejs)
* [🌐 Frontend Setup (React + Vite)](#-frontend-setup-react--vite)
* [🔐 Firebase Configuration (Google Login)](#-firebase-configuration-google-login)
* [🚀 Running the Complete App](#-running-the-complete-app)
* [🌍 Deployment Options](#-deployment-options)
* [💙 Built with Lovable](#-built-with-lovable)

---

# 📌 Project Theme

**"Simplifying Deployment for Everyone"**

Most beginners struggle with:

* build errors
* wrong commands
* confusing deploy settings
* missing config files

DeployBridge solves all of this with **one upload → one click → online**.

---

# ✨ Key Features

### 🔥 **1. Automatic ZIP Extraction**

* Upload any frontend project's ZIP
* System auto-detects build folder (`dist/`, `build/`)

### ⚙️ **2. Auto Framework Detection**

Supports:

* React
* Vite
* Vue
* Vanilla HTML/CSS/JS
* Next.js (auto handled by Vercel)

### 🚀 **3. One-Click Deployment**

Deploy to:

* **Vercel**
* **Netlify**
* **Firebase Hosting**

Returns **live URL instantly**.

### 📝 **4. Deployment Logs in Real-Time**

Backend streams:

* build logs
* deployment progress
* success/failure status

### 🔒 **5. Google Authentication**

Integrated via Firebase:

* Google Sign-In
* Automatic login
* User has dashboard

### 📊 **6. Project Dashboard**

Displays:

* All deployments
* Status
* Build logs
* Live URLs

### 🎨 **7. Clean UI**

* shadcn/ui
* Tailwind CSS
* Smooth animations using Framer Motion

---

# 🛠 Technologies Used

### **Frontend**

* React + TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Framer Motion

### **Backend**

* Node.js
* Express
* Multer
* extract-zip
* fs-extra
* Vercel API
* Netlify API
* Firebase Admin

### **Authentication**

* Firebase Auth
* Google OAuth

### **Platform**

* **Lovable AI Development Platform**

---

# 📂 Folder Structure

```
DeployBridge/
│── backend/
│   ├── routes/
│   ├── controllers/
│   ├── server.js
│   └── .env
│
│── src/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── lib/
│   └── main.tsx
│
│── public/
│── index.html
│── package.json
│── vite.config.ts
└── README.md
```

---

# 📦 Requirements

✔ Node.js 18+
✔ npm or yarn
✔ Git
✔ Firebase Account
✔ Vercel Account
✔ Netlify Account

---

# ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```sh
git clone <YOUR_REPO_URL>
cd DeployBridge
```

---

# 🔥 Backend Setup (Node.js)

### 2️⃣ Install dependencies

```sh
cd backend
npm install
```

### 3️⃣ Create **backend/.env**

```
PORT=5000

# Vercel Credentials
VERCEL_TOKEN=your_token
VERCEL_PROJECT_ID=your_project_id
VERCEL_ORG_ID=

# Netlify (optional)
NETLIFY_TOKEN=
NETLIFY_SITE_ID=

# Firebase Hosting (optional)
FIREBASE_TOKEN=
```

### 4️⃣ Run Backend

```sh
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

# 🌐 Frontend Setup (React + Vite)

### 1️⃣ Install frontend dependencies

```sh
npm install
```

### 2️⃣ Add `.env` in project root

```
VITE_BACKEND_URL=http://localhost:5000

# Firebase Auth
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxxx
```

### 3️⃣ Run Frontend

```sh
npm run dev
```

---

# 🔐 Firebase Configuration (Google Login)

### Go to Firebase Console → Project Settings → Web App

Copy config and paste into your `.env`.

Then enable:
✔ Firebase Authentication
✔ Google Provider
✔ Authorized Domains

Done! 🎉

---

# 🚀 Running the Complete App

Backend:

```sh
cd backend
npm run dev
```

Frontend:

```sh
npm run dev
```

Open:

👉 [http://localhost:5173](http://localhost:5173)
Login → Upload ZIP → Deploy → Get Live URL

---

# 🌍 Deployment Options

### **1. Deploy using Lovable**

Directly open the project:

👉 [https://lovable.dev/projects/cde90424-d7be-4c0c-926e-12cefbf6c797](https://lovable.dev/projects/cde90424-d7be-4c0c-926e-12cefbf6c797)

Click:

```
Share → Publish
```

### **2. Deploy Manually**

Frontend → Vercel / Netlify
Backend → Render / Cyclic / Railway

---

# 💙 Built with Lovable

This project was created and developed using the **Lovable AI platform**, which enables:

* Instant project scaffolding
* AI-assisted coding
* One-click publishing
* Automatic commit management
* Team collaboration

Lovable Project Link:
👉 [https://lovable.dev/projects/cde90424-d7be-4c0c-926e-12cefbf6c797](https://lovable.dev/projects/cde90424-d7be-4c0c-926e-12cefbf6c797)

---

# 🏁 Final Notes

DeployBridge was proudly built by **Team TechnoTitans**
for fast and frictionless deployments.