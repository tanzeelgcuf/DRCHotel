import React, { useState } from "react";
import { assets } from "../../assets/assets";
import './Hebergement.css';

const Hebergement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = async () => {
        const token = localStorage.getItem("token");
        const establishmentId = localStorage.getItem("establishmentId");

        if (!establishmentId) {
            setError("Aucun établissement sélectionné.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`http://34.30.198.6:8081/api/establishments/${establishmentId}/clients/search`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ clientName: searchTerm })
            });

            if (!response.ok) {
                throw new Error("Échec de la recherche");
            }

            const data = await response.json();
            setClients(data.results || []);
        } catch (err) {
            setError(err.message);
        }

        setLoading(false);
    };


    const [showValidationPopup, setShowValidationPopup] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [montant, setMontant] = useState('');
    const [erreur, setErreur] = useState('');

    const closePopup = () => {
        setShowValidationPopup(false);
        };


    const handleValiderClick = (client) => {
    setSelectedClient(client);
    setShowValidationPopup(true);
    setMontant('');
    setErreur('');
    };

    const handleValiderHebergement = () => {
        if (!montant || isNaN(montant)) {
            setErreur("Le champ est obligatoire et doit être un nombre.");
            return;
        }

        // Tu peux ici appeler ton API pour valider l'hébergement
        console.log(`Montant payé pour ${selectedClient.first_name} : ${montant}`);
        
        setShowValidationPopup(false);
    };


    const [selecteddetailsClient, setSelecteddetailsClient] = useState(null);
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);

    const handleShowDetails = (client) => {
    setSelecteddetailsClient(client);
    setShowDetailsPopup(true);
    };

    const closeDetailsPopup = () => {
    setShowDetailsPopup(false);
    };



    return (
        <div id="content">
            <main>
                <div className="popup-large">
                    <div className="popup-scroll-content">
                        <div className="titre_modal">
                            <h2 className="popup-title">📄 Rechercher un client</h2>
                            <span className="popup-status"> Liste des clients</span>
                        </div>

                        <div className="search-box2">
                            <i className='bx bx-search-alt-2'></i>
                            <input
                                type="text"
                                placeholder="Rechercher un client . . ."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <button onClick={handleSearch}>Rechercher</button>
                        </div>

                        {loading && <p>Chargement...</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}

                        <table className="client-table">
                            <thead>
                                <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Type de document</th>
                                <th>Numéro</th>
                                <th>Nationalité</th>
                                <th>Date de naissance</th>
                                <th>Valider</th>
                                <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(client => (
                                <tr key={client.id}>
                                    <td>{client.last_name} {client.first_name}</td>
                                    <td>{client.email}</td>
                                    <td>{client.phone}</td>
                                    <td>{client.document_type}</td>
                                    <td>{client.document_number}</td>
                                    <td>{client.nationality}</td>
                                    <td>{client.date_of_birth}</td>
                                    <td>
                                    <button className="popup-status" onClick={() => handleValiderClick(client)}>Valider</button>
                                    </td>
                                    <td>
                                    <button className="popup-status" onClick={() => handleShowDetails(client)}>Détails</button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                                {showValidationPopup && (
                                    <div className="popup-overlay">
                                        <div className="popup-content">
                                            <button className="close-btn" onClick={closePopup}>×</button>

                                            <h3>Valider l’hébergement</h3>
                                            <input
                                                type="number"
                                                placeholder="Mettez le montant payé par ce client"
                                                value={montant}
                                                onChange={(e) => setMontant(e.target.value)}
                                            />
                                            {erreur && <p className="error-message">{erreur}</p>}
                                            <button className="btn-validate" onClick={handleValiderHebergement}>
                                                Valider l’hébergement du client
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showDetailsPopup && selecteddetailsClient && (
                                <div className="popup-overlay">
                                    
                                    <button className="close-btn" onClick={closeDetailsPopup}>×</button>
                                    <div className="popup-contente details-popup">
                                    <h2 className="popup-title">Détails du client</h2>
                                    
                                    <div className="details-grid">
                                        <div className="details-card">
                                        <h3>Informations générales</h3>
                                        <p><strong>Nom :</strong> {selecteddetailsClient.last_name}</p>
                                        <p><strong>Prénom :</strong> {selecteddetailsClient.first_name}</p>
                                        <p><strong>Sexe :</strong> {selecteddetailsClient.gender || "Non spécifié"}</p>
                                        <p><strong>Type d'identité :</strong> {selecteddetailsClient.document_type}</p>
                                        <p><strong>Type PASSPORT :</strong> Ordinaire</p>
                                        <p><strong>Date entrée au Maroc :</strong> {selecteddetailsClient.entry_date || "—"}</p>
                                        <p><strong>N° entrée au Maroc :</strong> {selecteddetailsClient.entry_number || "—"}</p>
                                        <p><strong>N° identité :</strong> {selecteddetailsClient.document_number}</p>
                                        <p><strong>Date de délivrance :</strong> {selecteddetailsClient.issue_date || "2024-06-04"}</p>
                                        <p><strong>Nationalité :</strong> {selecteddetailsClient.nationality}</p>
                                        <p><strong>Email :</strong> {selecteddetailsClient.email}</p>
                                        <p><strong>Téléphone :</strong> {selecteddetailsClient.phone}</p>
                                        </div>

                                        <div className="details-card">
                                        <h3>Informations personnelles</h3>
                                        <p><strong>Date de naissance :</strong> {selecteddetailsClient.date_of_birth}</p>
                                        <p><strong>Lieu de naissance :</strong> {selecteddetailsClient.place_of_birth || "—"}</p>
                                        <p><strong>Qualification :</strong> {selecteddetailsClient.qualification || "—"}</p>
                                        <p><strong>Lieu de provenance :</strong> {selecteddetailsClient.origin || "—"}</p>
                                        <p><strong>Destination :</strong> {selecteddetailsClient.destination || "—"}</p>
                                        <p><strong>Adresse actuelle :</strong> {selecteddetailsClient.address || "—"}</p>
                                        <p><strong>Ville :</strong> {selecteddetailsClient.city || "—"}</p>
                                        <p><strong>Pays :</strong> {selecteddetailsClient.country || "—"}</p>
                                        </div>

                                        <div className="details-card">
                                        <h3>Informations d'hébergement</h3>
                                        <p><strong>Motif de voyage :</strong> {selecteddetailsClient.travel_reason || "—"}</p>
                                        <p><strong>Organisation :</strong> Sans réservation</p>
                                        <p><strong>Lieu de séjour :</strong> {selecteddetailsClient.stay_place || "—"}</p>
                                        </div>
                                    </div>
                                    </div>

                                    </div>
                            
                                )}


                    </div>
                </div>
            </main>
        </div>
    );
};

export default Hebergement;
