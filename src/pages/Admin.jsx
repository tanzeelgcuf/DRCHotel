import React, { useState } from "react";
import ApiDiagnostics from "../components/admin/ApiDiagnostics";
import { useAuth } from "../context/AuthContext";

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  
  // Tabs that will be available in the admin panel
  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'users', label: 'Utilisateurs' },
    { id: 'diagnostics', label: 'Diagnostics API' },
    { id: 'logs', label: 'Journaux' },
  ];

  return (
    <div id="content">
      <main>
        <header className="header">
          <span className="admin"><i className='bx bx-cog'></i> Panneau d'administration</span>
        </header>
        
        <div className="admin-container">
          <div className="admin-sidebar">
            <ul>
              {tabs.map(tab => (
                <li 
                  key={tab.id}
                  className={activeTab === tab.id ? 'active' : ''}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="admin-content">
            {activeTab === 'general' && (
              <div className="admin-tab">
                <h2>Paramètres généraux</h2>
                <p>Gérez les paramètres généraux de l'application.</p>
                <div className="admin-card">
                  <h3>Informations système</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span>Version</span>
                      <strong>{import.meta.env.VITE_APP_VERSION || '1.0.0'}</strong>
                    </div>
                    <div className="info-item">
                      <span>Environnement</span>
                      <strong>{import.meta.env.MODE}</strong>
                    </div>
                    <div className="info-item">
                      <span>API URL</span>
                      <strong>{import.meta.env.VITE_API_URL || 'http://34.30.198.6:8080'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'users' && (
              <div className="admin-tab">
                <h2>Gestion des utilisateurs</h2>
                <p>Module de gestion des utilisateurs à implémenter.</p>
              </div>
            )}
            
            {activeTab === 'diagnostics' && (
              <div className="admin-tab">
                <h2>Diagnostics API</h2>
                <p>Outils de diagnostic pour les problèmes d'API et CORS.</p>
                <ApiDiagnostics />
              </div>
            )}
            
            {activeTab === 'logs' && (
              <div className="admin-tab">
                <h2>Journaux système</h2>
                <p>Module de journaux système à implémenter.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: calc(100vh - 120px);
          margin: 20px;
        }
        
        .admin-sidebar {
          width: 220px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-right: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .admin-sidebar ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .admin-sidebar li {
          padding: 12px 20px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        }
        
        .admin-sidebar li:hover {
          background-color: #e9ecef;
        }
        
        .admin-sidebar li.active {
          background-color: #007bff;
          color: white;
          font-weight: bold;
        }
        
        .admin-content {
          flex: 1;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .admin-tab h2 {
          margin-top: 0;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .admin-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          margin-top: 20px;
        }
        
        .admin-card h3 {
          margin-top: 0;
          font-size: 18px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 12px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-item span {
          font-size: 14px;
          color: #6c757d;
        }
        
        .info-item strong {
          font-size: 16px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default Admin;