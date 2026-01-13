# BP Guardian 🩺  
**AI-driven Healthcare Monitoring System**

BP Guardian is a full-stack healthcare web application designed to enable secure patient–doctor interaction with blood pressure tracking and AI-assisted health insights. The platform focuses on data security, role-based access, and intelligent analysis to support better clinical decision-making.

---

## 🚀 Features

- **User Authentication & Authorization**
  - Secure registration and login using JWT
  - Role-based access control for patients and doctors

- **Blood Pressure Tracking**
  - Patients can record and monitor BP readings over time
  - Doctors can view patient history for analysis and consultation

- **AI-assisted Health Insights**
  - AI integration to analyze BP data and provide risk-related insights
  - Helps identify abnormal patterns and potential health concerns

- **Doctor–Patient Interaction**
  - Structured access to patient data for doctors
  - Secure and privacy-focused data handling

---

## 🛠 Tech Stack

### Frontend
- React
- Axios

### Backend
- Node.js
- Express.js
- JWT (Authentication & Authorization)
- Gemini API (AI-assisted analysis)

### Database
- MongoDB

---

## 🧩 System Architecture (High Level)

1. User authenticates via JWT-based login
2. Patient submits BP readings through the frontend
3. Backend APIs validate, store, and process data
4. AI module analyzes BP trends and generates insights
5. Doctors access patient data securely based on role permissions

---

### 🔐 Security Considerations

* JWT-based stateless authentication
* Role-based authorization for protected routes
* Secure handling of patient health data

---

### 🌐 Live Demo

🔗 **Live Application:**
[https://bp-guardian-frontend.onrender.com/](https://bp-guardian-frontend.onrender.com/)

```


