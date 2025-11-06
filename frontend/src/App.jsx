import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import DoctorDashboard from './pages/Doctor/Dashboard.jsx'
import PatientDashboard from './pages/Patient/Dashboard.jsx'
import PatientHistory from './pages/Patient/History.jsx'
import PatientMedicalHistory from './pages/Patient/MedicalHistory.jsx'
import PatientChatbot from './pages/Patient/Chatbot.jsx'
import PatientProfile from './pages/Patient/Profile.jsx'
import DoctorPatientRequests from './pages/Doctor/PatientRequests.jsx'
import DoctorPatients from './pages/Doctor/Patients.jsx'
import DoctorReviewAdvice from './pages/Doctor/ReviewAdvice.jsx'
import DoctorPatientDetails from './pages/Doctor/PatientDetails.jsx'
import DoctorLayout from './layouts/DoctorLayout.jsx'
import PatientLayout from './layouts/PatientLayout.jsx'
import DoctorRegister from './pages/Auth/DoctorRegister.jsx'
import PatientRegister from './pages/Auth/PatientRegister.jsx'


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signin" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
        <Route path="/register/doctor" element={<DoctorRegister />} />
        <Route path="/register/patient" element={<PatientRegister />} />

        {/* Patient routes */}
        <Route
          path="/patient"
          element={
            // <ProtectedRoute roles={["patient"]}>
              <PatientLayout />
            // </ProtectedRoute>

          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="history" element={<PatientHistory />} />
          <Route path="medical-history" element={<PatientMedicalHistory />} />
          <Route path="chatbot" element={<PatientChatbot />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>

        {/* Doctor routes */}
        <Route
          path="/doctor"
          element={
            // <ProtectedRoute roles={["doctor"]}>
              <DoctorLayout />
            // </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patient-requests" element={<DoctorPatientRequests />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="review-advice" element={<DoctorReviewAdvice />} />
          <Route path="patients/:id" element={<DoctorPatientDetails />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
