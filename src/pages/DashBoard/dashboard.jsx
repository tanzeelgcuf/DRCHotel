import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from 'react-router-dom';
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

    const navigate = useNavigate();
    const allerVersHebergement = () => {
        navigate('/hebergement-en-cours');
      };

    useEffect(() => {
        const fetchClients = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await fetch("http://34.30.198.6:8081/api/clients", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) { 
                    throw new Error("Échec du chargement des clients");
                }

                const data = await response.json();
                setClients(data.clients); // accès à la liste via data.data
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const [establishment, setEstablishment] = useState({ name: "", type: "" });

useEffect(() => {
    const fetchEstablishment = async () => {
        const token = localStorage.getItem("token");
        const id = localStorage.getItem("establishmentId");

        try {
            const response = await fetch(`http://34.30.198.6:8081/api/establishments/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Échec du chargement de l'établissement");
            }

            const data = await response.json();
            setEstablishment({ name: data.name, type: data.type });
        } catch (err) {
            console.error(err.message);
        }
    };

    fetchEstablishment();
}, []);


    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(client => {
        const fullName = `${client.lastName} ${client.firstName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    // Gestion du changement de l'input de recherche
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const data = [
        { mois: 'Avril 2025', value: 2 },
        { mois: 'Mars 2025', value: 0 },
        { mois: 'Février 2025', value: 0 },
        { mois: 'Janvier 2025', value: 0 },
        { mois: 'Décembre 2024', value: 0 },
        { mois: 'Novembre 2024', value: 0 },
    ];

    const [showPopup, setShowPopup] = useState(false);

    const handleImageClick = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const [showFullImage, setShowFullImage] = useState(false);

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
            <main>

                <div className="dashboard-container">
                    {/* Notifications */}
                    <div className="notifications-box">
                        <h2 className="notifications-title"><i class='bx bx-bell'></i> NOTIFICATIONS</h2>
                        <div className="notifications-content">
                            
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="main-info-box">
                        <h2>{establishment.type} - {establishment.name} </h2>
                        <p className="intro-text">
                            Bienvenue dans votre espace utilisateur ! Nous sommes ravis de vous accompagner dans la gestion de votre activité.
                        </p><br />
                        <div className="balance-qr-section">
                            <div className="qr-section">
                                <p>VOTRE CODE QR</p>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=EXEMPLE" alt="QR Code" className="qr-code" />
                            </div>
                        </div>
                        <button className="etat_active">ETAT ACTIVE</button>
                        <hr />
                        <div className="action-buttons">
                            <button className="btn btn-print"><i class='bx bx-printer'></i></button>
                            <button className="btn btn-link"><i class='bx bx-link'></i></button>
                            <button className="btn btn-share"><i class='bx bx-share'></i></button>
                        </div>
                        <button className="btn-outline"><i class='bx bx-cloud-download'></i> GÉNÉRER UN AUTRE CODE</button>

                        <div className="status-boxes">
                            <div className="status-box cancelled" onClick={allerVersHebergement}>
                                <p>Hebergement en cours</p>
                                <span>{clients.length}</span>
                            </div>

                            <div className="status-box validated">
                                <p>Hebergement valider</p>
                                <span>0</span>
                            </div>
                            <div className="status-box not-validated">
                                <p>Hebergement annuler</p>
                                <span>0</span>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
