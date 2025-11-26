
# **BP Guardian — AI-Assisted Blood Pressure Monitoring & Doctor Supervision**

### 🩺 Smart BP Tracking | 🤖 AI-Generated Lifestyle Advice | 👨‍⚕ Doctor Approval Workflow

BP Guardian is a **full-stack MERN web platform** designed for real-time blood pressure tracking, AI-based lifestyle advice generation, and supervised doctor validation.
Patients can register, monitor their BP, receive AI-generated suggestions, and send them to doctors for approval.
Doctors maintain control over patient safety with a medical review system.

---

## 🚀 Features

### 👤 Patient

* Register & Login using secure OTP email verification
* Receive instant **AI-generated lifestyle recommendations**
* Track medical history & BP trends (graph-based dashboard)
* Select 1–4 doctors for medical supervision
* View **Pending / Approved / Rejected** Advice in History
* Chatbot for **safe lifestyle guidance only** (no dosage suggestions)

### 👨‍⚕ Doctor

* Secure registration + OTP verification
* Accept/Reject incoming patient link requests
* View patient medical history, BP trends & AI-generated advice
* Approve / Reject / Modify suggestions with comments
* Act as final authority in medical decisions

### 🤖 AI Pipeline (Human-Safe Review)

AI generates:

* Lifestyle suggestions
* Medication options (doctor-view only)
* 3 pricing variants
  Final recommendation visible to patient **only after doctor approval**

---

## 🧩 System Flow Summary

| Module          | Functionality                       |
| --------------- | ----------------------------------- |
| Registration    | Patient & Doctor signup with OTP    |
| Dashboard       | BP entry + AI advice generation     |
| History         | Track approvals or rejections       |
| Medical Records | Trend graphs + medical notes        |
| Profile         | Edit details anytime                |
| Chatbot         | Lifestyle guidance (guardrail safe) |
| Doctor Panel    | Review advice + patient requests    |

📌 Entire system flow documented in PDF 

---

Here is your **cleaned, concise and essential Tech Stack section**, keeping only what is necessary for production + core feature development.

---

## 🏗 **Tech Stack**

### 🔹 Backend (Node.js + Express)

| Technology              | Purpose                                |
| ----------------------- | -------------------------------------- |
| **Node.js**             | Backend runtime environment            |
| **Express.js**          | REST API routing framework             |
| **MongoDB + Mongoose**  | NoSQL database + ORM modeling          |
| **JWT (jsonwebtoken)**  | User authentication system             |
| **bcryptjs**            | Password hashing & security            |
| **cors**                | Enables frontend-backend communication |
| **dotenv**              | Env variable configuration             |
| **nodemailer**          | Email-based OTP verification           |
| **Gemini API**          | AI suggestion & chatbot engine         |

---

### 🔹 Frontend (React + Vite)

| Technology           | Purpose                           |
| -------------------- | --------------------------------- |
| **React.js**         | Core UI framework                 |
| **Vite**             | Faster dev server + build bundler |
| **React Router DOM** | Multi-page navigation             |
| **Axios**            | HTTP requests to backend          |
| **Tailwind CSS**     | UI styling framework              |
| **Lucide React**     | Icon components                   |
| **Recharts**         | BP graph visualization            |


## ⚙ Setup & Run Locally

### 1️⃣ Clone project

```bash
git clone https://github.com/Piyush-Lokhande07/BP_Guardian.git
cd BP_Guardian
```

### 2️⃣ Install dependencies

Frontend:

```bash
cd client && npm install
```

Backend:

```bash
cd server && npm install
```

### 3️⃣ Create `.env` both Frontend + Backend

#### 🔹 Frontend `.env`

```
VITE_API_BASE_URL=http://localhost:5000/api
```

#### 🔹 Backend `.env`

```
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

### 4️⃣ Start system

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

