import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from 'react-router-dom';
import ApiConnectionTest from '../../components/ApiConnectionTest';
import Calendar from 'react-calendar';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

import './Dash.css'

const Dashboard = () => {
    const [date, setDate] = useState(new Date());
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [establishment, setEstablishment] = useState({ name: "", type: "" });
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    
    // Use environment variable for API URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://34.30.198.6:8081";

    const allerVersHebergement = () => {
        navigate('/hebergement-en-cours');
    };

    useEffect(() => {
        const fetchClients = async () => {
            const token = localStorage.getItem("token");

            try {
                setLoading(true);
                console.log('🔄 Fetching clients from:', `${API_BASE_URL}/api/clients`);
                
                const response = await fetch(`${API_BASE_URL}/api/clients`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) { 
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('✅ Clients data received:', data);
                
                // Handle both possible response formats
                const clientsArray = data.data || data.clients || data || [];
                setClients(clientsArray);
                
            } catch (err) {
                console.error('❌ Client fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [API_BASE_URL]);

    useEffect(() => {
        const fetchEstablishment = async () => {
            const token = localStorage.getItem("token");
            const id = localStorage.getItem("establishmentId") || "1"; // Default to 1 if not set

            try {
                console.log('🔄 Fetching establishment from:', `${API_BASE_URL}/api/establishments/${id}`);
                
                const response = await fetch(`${API_BASE_URL}/api/establishments/${id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('✅ Establishment data received:', data);
                setEstablishment({ 
                    name: data.name || "Hotel DRC", 
                    type: data.type || "Hotel" 
                });
                
            } catch (err) {
                console.error('❌ Establishment fetch error:', err);
                // Set default values on error
                setEstablishment({ 
                    name: "Hotel DRC", 
                    type: "Hotel" 
                });
            }
        };

        fetchEstablishment();
    }, [API_BASE_URL]);

    const filteredClients = clients.filter(client => {
        if (!client || !client.lastName || !client.firstName) return false;
        const fullName = `${client.lastName} ${client.firstName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    // Gestion du changement de l'input de recherche
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const data = [
        { mois: 'Avril 2025', value: clients.length || 2 },
        { mois: 'Mars 2025', value: 0 },
        { mois: 'Février 2025', value: 0 },
        { mois: 'Janvier 2025', value: 0 },
        { mois: 'Décembre 2024', value: 0 },
        { mois: 'Novembre 2024', value: 0 },
    ];

    const [showPopup, setShowPopup] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);

    const handleImageClick = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const handleImagClick = () => {
        setShowFullImage(true);
    };

    const handleClose = () => {
        setShowFullImage(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div id="content">
            {/* API Connection Test Widget */}
            <ApiConnectionTest />
            
            <main>
                <div className="dashboard-container">
                    {/* Error Display */}
                    {error && (
                        <div style={{
                            background: '#fee',
                            border: '1px solid #fcc',
                            padding: '10px',
                            borderRadius: '5px',
                            margin: '10px 0',
                            color: '#c33'
                        }}>
                            ⚠️ Erreur de connexion: {error}
                            <button 
                                onClick={() => window.location.reload()} 
                                style={{
                                    marginLeft: '10px',
                                    padding: '5px 10px',
                                    background: '#c33',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }}
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {/* Notifications */}
                    <div className="notifications-box">
                        <h2 className="notifications-title">
                            <i className='bx bx-bell'></i> NOTIFICATIONS
                            {loading && <span style={{fontSize: '12px', color: '#666'}}> (Chargement...)</span>}
                        </h2>
                        <div className="notifications-content">
                            {error ? (
                                <p style={{color: '#c33'}}>Erreur de chargement des notifications</p>
                            ) : (
                                <p>Aucune nouvelle notification</p>
                            )}
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="main-info-box">
                        <h2>{establishment.type} - {establishment.name}</h2>
                        <p className="intro-text">
                            Bienvenue dans votre espace utilisateur ! Nous sommes ravis de vous accompagner dans la gestion de votre activité.
                        </p><br />
                        
                        <div className="balance-qr-section">
                            <div className="qr-section">
                                <p>VOTRE CODE QR</p>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(establishment.name || 'HOTEL-DRC')}`} 
                                    alt="QR Code" 
                                    className="qr-code" 
                                />
                            </div>
                        </div>
                        
                        <button className="etat_active">
                            {error ? 'CONNEXION ERREUR' : 'ETAT ACTIVE'}
                        </button>
                        
                        <hr />
                        
                        <div className="action-buttons">
                            <button className="btn btn-print"><i className='bx bx-printer'></i></button>
                            <button className="btn btn-link"><i className='bx bx-link'></i></button>
                            <button className="btn btn-share"><i className='bx bx-share'></i></button>
                        </div>
                        
                        <button className="btn-outline">
                            <i className='bx bx-cloud-download'></i> GÉNÉRER UN AUTRE CODE
                        </button>

                        <div className="status-boxes">
                            <div className="status-box cancelled" onClick={allerVersHebergement}>
                                <p>Hebergement en cours</p>
                                <span>
                                    {loading ? '...' : (clients.length || 0)}
                                </span>
                            </div>

                            <div className="status-box validated">
                                <p>Hebergement validé</p>
                                <span>
                                    {loading ? '...' : filteredClients.filter(c => c.verificationStatus === 'verified').length}
                                </span>
                            </div>
                            
                            <div className="status-box not-validated">
                                <p>Hebergement annulé</p>
                                <span>0</span>
                            </div>
                        </div>

                        {/* API Connection Status */}
                        <div style={{
                            marginTop: '20px',
                            padding: '10px',
                            background: '#f8f9fa',
                            borderRadius: '5px',
                            fontSize: '12px',
                            color: '#666',
                            borderLeft: `4px solid ${error ? '#dc3545' : '#28a745'}`
                        }}>
                            <p><strong>API Status:</strong></p>
                            <p>🔗 URL: {API_BASE_URL}</p>
                            <p>📊 Clients chargés: {clients.length}</p>
                            <p>⏰ Dernière mise à jour: {new Date().toLocaleTimeString()}</p>
                            {error && <p style={{color: '#dc3545'}}>❌ Erreur: {error}</p>}
                        </div>

                        {/* Recent Clients Preview */}
                        {clients.length > 0 && (
                            <div style={{
                                marginTop: '15px',
                                padding: '10px',
                                background: '#e8f5e8',
                                borderRadius: '5px'
                            }}>
                                <h4 style={{margin: '0 0 10px 0', fontSize: '14px'}}>Derniers clients:</h4>
                                {clients.slice(0, 3).map((client, index) => (
                                    <div key={index} style={{
                                        fontSize: '12px',
                                        padding: '2px 0',
                                        borderBottom: '1px solid #ddd'
                                    }}>
                                        {client.firstName} {client.lastName} - {client.nationality || 'N/A'}
                                    </div>
                                ))}
                                {clients.length > 3 && (
                                    <div style={{fontSize: '12px', fontStyle: 'italic', marginTop: '5px'}}>
                                        ... et {clients.length - 3} autres
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;