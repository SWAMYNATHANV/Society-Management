import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ResidentDashboard from './pages/ResidentDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect the base URL directly to the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Define the main routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/resident" element={<ResidentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;