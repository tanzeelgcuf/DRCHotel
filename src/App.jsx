import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './pages/DashBoard/dashboard.jsx';
import Nfiche from './pages/Nouvelle_fiche/Nfiche.jsx';
import CreationPoste from './pages/CreationPoste';
import Admin from './pages/Admin';
import Logout from './pages/Logout';
import Hebergement from './pages/Hebergement/hebergement_en_cours.jsx';
import Etablissement from './pages/Etablissement/Etablissement.jsx';
import Login from './pages/Login/Login.jsx';
import ProtectedRoute from './composants/Auth/ProtectedRoute.jsx';
import MainLayout from './components/layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiMonitor from './services/apiMonitor';
import logger from './utils/logger';

const App = () => {
  // Start API health monitoring
  useEffect(() => {
    logger.info('Starting API health monitoring');
    const monitorIntervalId = apiMonitor.startPeriodicChecks(60000); // Check every minute
    
    // Cleanup monitoring on unmount
    return () => {
      logger.info('Stopping API health monitoring');
      apiMonitor.stopPeriodicChecks(monitorIntervalId);
    };
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <MainLayout>
          <Routes>
            {/* Login route libre */}
            <Route path="/login" element={<Login />} />

            {/* Routes protégées */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/enregistrement" element={<ProtectedRoute><Nfiche /></ProtectedRoute>} />
            <Route path="/hebergement-en-cours" element={<ProtectedRoute><Hebergement /></ProtectedRoute>} />
            <Route path="/Etablissement" element={<ProtectedRoute><Etablissement /></ProtectedRoute>} />
            <Route path="/creation-poste" element={<ProtectedRoute><CreationPoste /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/sedeconnecter" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
            
            {/* Add a catch-all route for 404 pages */}
            <Route path="*" element={<div>Page non trouvée</div>} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;
