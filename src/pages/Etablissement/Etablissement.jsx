import React, { useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Etablissement.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { assets } from "../../assets/assets";

const Etablissement = () => {
     const fileInputRef = useRef(null);
    const [step, setStep] = useState("informations");

    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        message: "",
        adresse: "",
        ville: "",
        gsm: "",
        fixe: "",
        type: "hotel",
        siteweb: "",
        useNomChambre: false,
        nombreChambres: "",
        aPartirDe: "",
        autoriteDelivrance: "",
        dateDelivrance: "",
        numeroAutorisation: "",
        profil: "",
        natureDocument: "",
        numeroDocument: "",
        nationalite: "",
        prenom: "",
        autoriteDelivranceAlcoolPhysique: "",
        dateDelivranceAlcoolPhysique: "",
        numeroAutorisationAlcoolPhysique: "",
        natureDocumentAlcoolPhysique: "",
        numeroDocumentAlcoolPhysique: "",
        nationaliteAlcoolPhysique: "",
        nomAlcoolPhysique: "",
        prenomAlcoolPhysique: "",
        autoriteDelivranceAlcoolMorale: "",
        dateDelivranceAlcoolMorale: "",
        numeroAutorisationAlcoolMorale: "",
        raisonSocialeAlcoolMorale: "",
        registreCommerceAlcoolMorale: "",
        denominationAlcoolMorale: "",
        profilProprietaire: "",
        denominationProprietaire: "",
        raisonSocialeProprietaire: "",
        registreCommerceProprietaire: "",
        telProprietaire: "",
        faxProprietaire: "",
        gsmProprietaire: "",
        emailProprietaire: "",
        profilGestionnaire: "",
        natureDocumentGestionnaire: "",
        cinGestionnaire: "",
        nomGestionnaire: "",
        prenomGestionnaire: "",
        nationaliteGestionnaire: "",
        sexe: "",
        dateContratGestion: "",
        telGestionnaire: "",
        faxGestionnaire: "",
        gsmGestionnaire: "",
        emailGestionnaire: "",
        natureDocumentDirecteur: "",
        cinDirecteur: "",
        nomDirecteur: "",
        prenomDirecteur: "",
        nationaliteDirecteur: "",
        niveauScolaireDirecteur: "",
        dateRecrutementDirecteur: "",
        telDirecteur: "",
        faxDirecteur: "",
        gsmDirecteur: "",
        emailDirecteur: "",


        natureDistinction: "",
        typeDistinction: "",
        dateObtentionDistinction: "",
        dateouvertir: "",
        services: [],
        etatNature: "",
        etatDateOuverture: "",
        etatActuelNature: "",
        etatActuelDateOuverture: "",
        });


    const [logo, setLogo] = useState(null);
    const [establishmentId, setEstablishmentId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleUploadClick = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setLogo(file);
    };

    const handleCancel = () => {
        setLogo(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://34.30.198.6:8081/api/establishments/register-drc-hotel", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || "Erreur lors de l'envoi des données.");
                return;
            }

            const data = await response.json();
            const id = data.establishment?.id;

            if (id) {
                setEstablishmentId(id);
                localStorage.setItem("establishmentId", id);
                toast.success("Établissement enregistré !");
            } else {
                toast.error("ID de l'établissement non récupéré.");
            }

        } catch (error) {
            console.error("Erreur attrapée :", error);
            toast.error("Erreur réseau ou interne.");
        }
    };

    const handleLogoSubmit = async () => {
        const token = localStorage.getItem("token");
        const logoFormData = new FormData();
        logoFormData.append("logo", logo);

        try {
            const logoResponse = await fetch(`http://34.30.198.6:8081/api/establishments/${establishmentId}/logo`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: logoFormData,
            });

            if (!logoResponse.ok) {
                const logoError = await logoResponse.json();
                toast.error(logoError.message || "Échec de l’envoi du logo.");
                return;
            }

            toast.success("Logo envoyé avec succès !");
            setLogo(null);
        } catch (error) {
            console.error("Erreur attrapée :", error);
            toast.error("Erreur lors de l'envoi du logo.");
        }
    };

   



    const renderSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

    const handleStepSubmit = (e, nextStep) => {
        e.preventDefault();
        setStep(nextStep);
        setTimeout(() => renderSection(nextStep), 100);
    };

    const handleLogout = () => {
        navigate("/login");
        localStorage.removeItem("token");
        
      };

    return (
        <div id="content">
            <main>
                <ToastContainer />
                <header className="header">
                    <button onClick={() => setStep("informations")}>Informations générales</button>
                    <button onClick={() => setStep("capacites")}>Capacités</button>
                    <button onClick={() => setStep("autorisations")}>Autorisations</button>
                    <button onClick={() => setStep("operateurs")}>Opérateurs</button>
                    <button onClick={() => setStep("labels")}>Labels et Certifications</button>
                    <button onClick={() => setStep("services")}>Services</button>
                    <button onClick={() => setStep("etats")}>Etats</button>
                </header>

                <div className="container">
                    <div className="content">
                        <div className="form-container">
                            <div className="card">
                                <p className="form-subtitle">Modifier vos informations</p><br />

                                <div className="header-section">
                                <div className="logo-placeholder">
                                    {logo ? (
                                    <img src={URL.createObjectURL(logo)} alt="Logo sélectionné" />
                                    ) : null}
                                </div>

                                {!logo || !establishmentId ? (
                                    <>
                                    <button className="upload-btn" type="button" onClick={handleUploadClick}>
                                        Importer votre logo
                                    </button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                    </>
                                ) : (
                                    <button className="send-btn" type="button" onClick={handleLogoSubmit}>
                                    Envoyer le logo
                                    </button>
                                )}

                                {logo && (
                                    <button className="cancel-btn" type="button" onClick={handleCancel}>
                                    Annuler
                                    </button>
                                )}
                                </div><br />

                                <p className="file-info">Fichier JPG, GIF ou PNG autorisés. Taille maximale de 800K</p><br />
                                <hr />

                                <form className="form-box" onSubmit={handleSubmit}>
                                    {step === "informations" && (
                                        <section id="informations">
                                    
                                            <p>Informations générales</p>
                                            <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nom d’établissement</label>
                                            <input type="text" name="nom" value={formData.nom} placeholder="hotel beatrice" onChange={handleInputChange} />
                                        </div>

                                        <div className="form-groupee">
                                            <label>Email</label>
                                            <input type="email" name="email" value={formData.email} placeholder="mjl@wayscompany.com" onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <label>Petit message en fin d’inscription des clients</label>
                                    <div className="form-groupeee">
                                        <div className="group-text">
                                            <label>Message</label>
                                        </div>
                                        <div className="group-input">
                                            <textarea name="message" value={formData.message} placeholder="Saisissez une description affichée aux clients" onChange={handleInputChange}></textarea>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Adresse</label>
                                            <input type="text" name="adresse" value={formData.adresse} placeholder="306 Ave De La Gombe, Kinshasa, République dém" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Ville</label>
                                            <select name="ville" value={formData.ville} onChange={handleInputChange}>
                                                <option>-- Choisir --</option>
                                                <option value='Casa'>Casablanca</option>
                                                <option value='KIN'>KINSHASA</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>N° GSM</label>
                                            <input type="text" name="gsm" value={formData.gsm} placeholder="MA (+212) +243993873999" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>N° Fixe</label>
                                            <input type="text" name="fixe" value={formData.fixe} placeholder="MA (+212) 05/8 00 00 00 00" onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Type d’établissement</label>
                                            <select name="type" value={formData.type} onChange={handleInputChange}>
                                                <option>-- Choisir --</option>
                                                <option value="hotel">Hôtel</option>
                                                <option value="RBNB">RBNB</option>
                                            </select>
                                        </div>
                                        <div className="form-groupee">
                                            <label>Site Web</label>
                                            <input type="text" name="siteweb" value={formData.siteweb} placeholder="www" onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <div className="check">
                                        <div className="check_icon">
                                            <input type="checkbox" name="useNomChambre" value={formData.useNomChambre} onChange={handleInputChange} />
                                        </div>
                                        <div className="check_text">
                                            <p>Utiliser les noms des chambres ou les adresses des appartements.</p>
                                        </div>
                                    </div>
                                            <button className="save-btn" onClick={(e) => handleStepSubmit(e, "capacites")}>Enregistrer</button>
                                        </section>
                                    )}

                                    {step === "capacites" && (
                                        <section id="capacites">
                                        
                                        <p>Capacités</p>
                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nombre des chambres</label>
                                                <input type="number" name="nombreChambres" value={formData.nombreChambres} placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>À partir N° Chambres</label>
                                                <input type="number" name="aPartirDe" value={formData.aPartirDe} placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nombre des studios</label>
                                                <input type="number" name="capacite_nombreStudios" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nombre de lit</label>
                                                <input type="number" name="capacite_nombreLits" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nombre de suite</label>
                                                <input type="number" name="capacite_nombreSuites" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nombre de villa</label>
                                                <input type="number" name="capacite_nombreVillas" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nombre d'emplacement</label>
                                                <input type="number" name="capacite_nombreEmplacements" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nombre de début d'effet </label>
                                                <input type="date" name="capacite_debutEffet" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                                <hr />

                                                <p>Capacités operationnelles</p>

                                                <div className="form-row">
                                                    <div className="form-groupee">
                                                        <label>Nombre des chambres</label>
                                                        <input type="number" name="operationnel_nombreChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-groupee">
                                                        <label>À partir N° Chambres</label>
                                                        <input type="number" name="operationnel_aPartirChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-groupee">
                                                        <label>Nombre des studios</label>
                                                        <input type="number" name="operationnel_nombreStudios" placeholder="Saisi ici" onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-groupee">
                                                        <label>Nombre de lit</label>
                                                        <input type="number" name="operationnel_nombreLits" placeholder="Saisi ici" onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-groupee">
                                                        <label>Nombre de suite</label>
                                                        <input type="number" name="operationnel_nombreSuites" placeholder="Saisi ici" onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-groupee">
                                                        <label>Nombre de villa</label>
                                                        <input type="number" name="operationnel_nombreVillas" placeholder="Saisi ici" onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-groupee">
                                                        <label>Nombre d'emplacement</label>
                                                        <input type="number" name="operationnel_nombreEmplacements" placeholder="Saisi ici" onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-groupee">
                                                        <label>Nombre de fin d'effet </label>
                                                        <input type="date" name="operationnel_finEffet" placeholder="Saisi ici" onChange={handleInputChange} />
                                                    </div>
                                                </div>

                                                <button className="save-btn" onClick={(e) => handleStepSubmit(e, "autorisations")}>Enregistrer</button>
                                        </section>
                                    )}

                                    {step === "autorisations" && (
                                        <section id="autorisations">
                                            <p>Autorisations</p>
                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>Autorité de délivrance</label>
                                                    <select name="autoriteDelivrance" value={formData.autoriteDelivrance} onChange={handleInputChange}>
                                                        <option>Province/Préfecture</option>
                                                        <option value="Province">Province</option>
                                                    </select>
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Date de délivrance</label>
                                                    <input type="date" value={formData.dateDelivrance} name="dateDelivrance" onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>N° d'autorisation</label>
                                                    <input type="number" value={formData.numeroAutorisation} name="numeroAutorisation" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Profil</label>
                                                    <select name="profil" value={formData.profil} onChange={handleInputChange}>
                                                        <option>Personne physique</option>
                                                        <option value="Physique">Physique</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>Nature document</label>
                                                    <select name="natureDocument" value={formData.natureDocument} onChange={handleInputChange}>
                                                        <option>CIN</option>
                                                        <option value="CIN">CIN</option>
                                                    </select>
                                                </div>
                                                <div className="form-groupee">
                                                    <label>N° du document</label>
                                                    <input type="number" value={formData.numeroDocument} name="numeroDocument" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>Nationalité</label>
                                                    <select value={formData.nationalite} name="nationalite" onChange={handleInputChange}>
                                                        <option value="Maroc">MAROC</option>
                                                        <option value="Congo">Congo</option>
                                                    </select>
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Prenom</label>
                                                    <input type="text" value={formData.prenom} name="prenom" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <hr />
                                            <p>Autorisation de débit d'alcool - Personne physique</p>

                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>Autorité de délivrance</label>
                                                    <select value={formData.autoriteDelivranceAlcoolPhysique} name="autoriteDelivranceAlcoolPhysique" onChange={handleInputChange}>
                                                        <option>La wilaya</option>
                                                        <option value="Well">Well</option>
                                                    </select>
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Date de délivrance</label>
                                                    <input type="date" value={formData.dateDelivranceAlcoolPhysique} name="dateDelivranceAlcoolPhysique" onChange={handleInputChange} />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>N° d'autorisation</label>
                                                    <input type="text" value={formData.numeroAutorisationAlcoolPhysique} name="numeroAutorisationAlcoolPhysique" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Nature document</label>
                                                    <select value={formData.natureDocumentAlcoolPhysique} name="natureDocumentAlcoolPhysique" onChange={handleInputChange}>
                                                        <option>CIN</option>
                                                        <option value="CIN">CIN</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>N° du document</label>
                                                    <input type="number" value={formData.numeroDocumentAlcoolPhysique} name="numeroDocumentAlcoolPhysique" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Nationalité</label>
                                                    <select value={formData.nationaliteAlcoolPhysique} name="nationaliteAlcoolPhysique" onChange={handleInputChange}>
                                                        <option>-- INDETERMINE --</option>
                                                        <option value="INDETERMINE">INDETERMINE</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>Nom</label>
                                                    <input type="text" value={formData.nomAlcoolPhysique} name="nomAlcoolPhysique" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Prénom</label>
                                                    <input type="text" value={formData.prenomAlcoolPhysique} name="prenomAlcoolPhysique" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <hr />
                                            <p>Autorisation de débit d'alcool - Personne morale</p>

                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>Autorité de délivrance</label>
                                                    <select value={formData.autoriteDelivranceAlcoolMorale} name="autoriteDelivranceAlcoolMorale" onChange={handleInputChange}>
                                                        <option>La wilaya</option>
                                                        <option value="wilaya">wilaya</option>
                                                    </select>
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Date de délivrance</label>
                                                    <input type="date" value={formData.dateDelivranceAlcoolMorale} name="dateDelivranceAlcoolMorale" onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>N° d'autorisation</label>
                                                    <input type="number" value={formData.numeroAutorisationAlcoolMorale} name="numeroAutorisationAlcoolMorale" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Raison sociale</label>
                                                    <input type="text" value={formData.raisonSocialeAlcoolMorale} name="raisonSocialeAlcoolMorale" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-groupee">
                                                    <label>N° Registre de commerce</label>
                                                    <input type="number" value={formData.registreCommerceAlcoolMorale} name="registreCommerceAlcoolMorale" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                                <div className="form-groupee">
                                                    <label>Dénomination</label>
                                                    <input type="text" value={formData.denominationAlcoolMorale} name="denominationAlcoolMorale" placeholder="Saisi ici" onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <button className="save-btn" onClick={(e) => handleStepSubmit(e, "operateurs")}>Enregistrer</button>
                                        </section>
                                    )}

                                    {step === "operateurs" && (
                                    <section id="operateurs">
                                        <p>Opérateurs</p>
                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Profil</label>
                                            <select value={formData.profilProprietaire} name="profilProprietaire" onChange={handleInputChange}>
                                            <option>Consortium</option>
                                            <option value="Consortium">Consortium</option>
                                            </select>
                                        </div>
                                        <div className="form-groupee">
                                            <label>Dénomination</label>
                                            <input 
                                            type="text" 
                                            value={formData.denominationProprietaire}
                                            name="denominationProprietaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Raison sociale</label>
                                            <input 
                                            type="text" 
                                            value={formData.raisonSocialeProprietaire}
                                            name="raisonSocialeProprietaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>N° Registre de commerce</label>
                                            <input 
                                            type="text" 
                                            value={formData.registreCommerceProprietaire}
                                            name="registreCommerceProprietaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>N° Tél.</label>
                                            <input 
                                            type="text" 
                                            value={formData.telProprietaire}
                                            name="telProprietaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>N° Fax.</label>
                                            <input 
                                            type="number" 
                                            name="faxProprietaire" 
                                            value={formData.faxProprietaire}
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>GSM</label>
                                            <input 
                                            type="text" 
                                            name="gsmProprietaire" 
                                            value={formData.gsmProprietaire}
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>E-Mail</label>
                                            <input 
                                            type="email" 
                                            value={formData.emailProprietaire}
                                            name="emailProprietaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>
                                        <br />
                                        <hr />
                                        <br />

                                        <p>Le gestionnaire</p>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Profil</label>
                                            <select value={formData.profilGestionnaire} name="profilGestionnaire" onChange={handleInputChange}>
                                            <option>Indépendant ( Personne physique )</option>
                                            <option value="Indépendant">Indépendant</option>
                                            </select>
                                        </div>
                                        <div className="form-groupee">
                                            <label>Nature du document</label>
                                            <select value={formData.natureDocumentGestionnaire} name="natureDocumentGestionnaire" onChange={handleInputChange}>
                                            <option>CIN</option>
                                            <option value="CIN">CIN</option>
                                            </select>
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>N° de la CIN</label>
                                            <input 
                                            type="number"
                                            value={formData.cinGestionnaire} 
                                            name="cinGestionnaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Nom</label>
                                            <input 
                                            type="text" 
                                            value={formData.nomGestionnaire}
                                            name="nomGestionnaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Prénom</label>
                                            <input 
                                            type="text" 
                                            value={formData.prenomGestionnaire}
                                            name="prenomGestionnaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Nationalité</label>
                                            <select value={formData.nationaliteGestionnaire} name="nationaliteGestionnaire" onChange={handleInputChange}>
                                            <option>-- INDETE --</option>
                                            <option value="INDETE">INDETE</option>
                                            </select>
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Sexe</label>
                                            <select name="sexeGestionnaire" onChange={handleInputChange}>
                                            <option>-- Sexe --</option>
                                            <option value="M">M</option>
                                            <option value="F">F</option>
                                            </select>
                                        </div>
                                        <div className="form-groupee">
                                            <label>Date contrat de gestion</label>
                                            <input 
                                            type="date"
                                            value={formData.dateContratGestion} 
                                            name="dateContratGestion" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>N° Tél.</label>
                                            <input 
                                            type="text"
                                            value={formData.telGestionnaire}  
                                            name="telGestionnaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>N° Fax.</label>
                                            <input 
                                            type="number" 
                                            value={formData.faxGestionnaire} 
                                            name="faxGestionnaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>GSM</label>
                                            <input 
                                            type="text"
                                            value={formData.gsmGestionnaire}  
                                            name="gsmGestionnaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>E-Mail</label>
                                            <input 
                                            type="email" 
                                            value={formData.emailGestionnaire} 
                                            name="emailGestionnaire" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>
                                        <br />
                                        <hr />
                                        <br />

                                        <p>Le directeur</p>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nature du document</label>
                                            <select value={formData.natureDocumentDirecteur}  name="natureDocumentDirecteur" onChange={handleInputChange}>
                                            <option>CIN</option>
                                            <option value="CIN">CIN</option>
                                            </select>
                                        </div>
                                        <div className="form-groupee">
                                            <label>N° de la CIN</label>
                                            <input 
                                            type="text"
                                            value={formData.cinDirecteur} 
                                            name="cinDirecteur" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nom</label>
                                            <input 
                                            type="text" 
                                            value={formData.nomDirecteur}
                                            name="nomDirecteur" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Prénom</label>
                                            <input 
                                            type="text"
                                            value={formData.prenomDirecteur} 
                                            name="prenomDirecteur" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nationalité</label>
                                            <select value={formData.nationaliteDirecteur} name="nationaliteDirecteur" onChange={handleInputChange}>
                                            <option>-- INDETE --</option>
                                            <option value="INDETE">INDETE</option>
                                            </select>
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Niveau scolaire</label>
                                            <select value={formData.niveauScolaireDirecteur} name="niveauScolaireDirecteur" onChange={handleInputChange}>
                                            <option>Niveau N°1</option>
                                            <option value="niveau">Niveau 1</option>
                                            </select>
                                        </div>
                                        <div className="form-groupee">
                                            <label>Date du recrutement</label>
                                            <input 
                                            type="date"
                                            value={formData.dateRecrutementDirecteur} 
                                            name="dateRecrutementDirecteur" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>N° Tél.</label>
                                            <input 
                                            type="text"
                                            value={formData.telDirecteur} 
                                            name="telDirecteur" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>N° Fax.</label>
                                            <input 
                                            type="number" 
                                            value={formData.faxDirecteur}
                                            name="faxDirecteur" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>

                                        <div className="form-row">
                                        <div className="form-groupee">
                                            <label>GSM</label>
                                            <input 
                                            type="text"
                                            value={formData.gsmDirecteur} 
                                            name="gsmDirecteur" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-groupee">
                                            <label>E-Mail</label>
                                            <input 
                                            type="email"
                                            value={formData.emailDirecteur} 
                                            name="emailDirecteur" 
                                            placeholder="Saisi ici" 
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        </div>
                                        <button 
                                        className="save-btn" 
                                        onClick={(e) => handleStepSubmit(e, "labels")}
                                        >
                                        Enregistrer
                                        </button>
                                    </section>
                                    )}

                                    {step === "labels" && (
                                        <section id="labels">
                                            
                                            <p>Labels et Certifications</p>
                                            <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nature</label>
                                                <select value={formData.natureDistinction} name="natureDistinction" onChange={handleInputChange}>
                                                    <option>Certification</option>
                                                    <option value="Certification">Certification</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Type</label>
                                                <select value={formData.typeDistinction} name="typeDistinction" onChange={handleInputChange}>
                                                    <option value="ISO 9 001">ISO 9 001</option>
                                                    <option value="ISO">ISO</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date obtention</label>
                                                <input value={formData.dateObtentionDistinction} type="date" name="dateObtentionDistinction" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date Ouvertir</label>
                                                <input value={formData.dateouvertir} type="date" name="dateouvertir" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <p style={{ color: 'red' }}>* Tous les champs sont obligatoires</p>
                                        
                                        <hr />

                                        <p>Liste des distinctions</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nature</label>
                                                <input type="text" value="Certification" />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Type</label>
                                                <input type="text" value="ISO 9 001" />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date d'obtention</label>
                                                <input type="text" value="01/03/2012" />
                                            </div>
                                        </div>
                                        
                                            <button className="save-btn" onClick={(e) => handleStepSubmit(e, "services")}>Enregistrer</button>
                                        </section>
                                    )}

                                    {step === "services" && (
                                        <section id="services">
                                            <p>Services</p>
                                            <div className="form-row">
                                            <div className="form-groupeeee">
                                                <div className="form_check">
                                                <label> Restaurant</label>
                                                <input
                                                    type="checkbox"
                                                    name="services"
                                                    checked={formData.restaurant}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Night-club</label>
                                                <input
                                                    type="checkbox"
                                                    name="nightClub"
                                                    checked={formData.nightClub}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Golf</label>
                                                <input
                                                    type="checkbox"
                                                    name="golf"
                                                    checked={formData.golf}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Salles de conférence</label>
                                                <input
                                                    type="checkbox"
                                                    name="sallesConference"
                                                    checked={formData.sallesConference}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Jardins</label>
                                                <input
                                                    type="checkbox"
                                                    name="jardins"
                                                    checked={formData.jardins}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Centre bien être / Spa</label>
                                                <input
                                                    type="checkbox"
                                                    name="centreBienEtre"
                                                    checked={formData.centreBienEtre}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Internet</label>
                                                <input
                                                    type="checkbox"
                                                    name="internet"
                                                    checked={formData.internet}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label>Parking</label>
                                                <input
                                                    type="checkbox"
                                                    name="parking"
                                                    checked={formData.parking}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Casino</label>
                                                <input
                                                    type="checkbox"
                                                    name="casino"
                                                    checked={formData.casino}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                            </div>

                                            <div className="form-groupeeee">
                                                <div className="form_check">
                                                <label> Bar</label>
                                                <input
                                                    type="checkbox"
                                                    name="bar"
                                                    checked={formData.bar}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Piscine</label>
                                                <input
                                                    type="checkbox"
                                                    name="piscine"
                                                    checked={formData.piscine}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Salle de sport</label>
                                                <input
                                                    type="checkbox"
                                                    name="salleSport"
                                                    checked={formData.salleSport}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Boutiques</label>
                                                <input
                                                    type="checkbox"
                                                    name="boutiques"
                                                    checked={formData.boutiques}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Garderie / club d’enfants</label>
                                                <input
                                                    type="checkbox"
                                                    name="garderieClubEnfants"
                                                    checked={formData.garderieClubEnfants}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Salon de coiffure et d’esthétique</label>
                                                <input
                                                    type="checkbox"
                                                    name="salonCoiffureEsthetique"
                                                    checked={formData.salonCoiffureEsthetique}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Cafétéria</label>
                                                <input
                                                    type="checkbox"
                                                    name="cafeteria"
                                                    checked={formData.cafeteria}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Chambres climatisées</label>
                                                <input
                                                    type="checkbox"
                                                    name="chambresClimatisees"
                                                    checked={formData.chambresClimatisees}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                                <div className="form_check">
                                                <label> Terrains de sport</label>
                                                <input
                                                    type="checkbox"
                                                    name="terrainsSport"
                                                    checked={formData.terrainsSport}
                                                    onChange={handleInputChange}
                                                />
                                                </div>
                                            </div>
                                            </div>
                                            <button className="save-btn" onClick={(e) => handleStepSubmit(e, "etats")}>Enregistrer</button>
                                        </section>
                                        )}


                                    {step === "etats" && (
                                        <section id="etats">
                                     
                                            <p>Traitement des etats</p>
                                            

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nature</label>
                                                <select name="etatNature" onChange={handleInputChange}>
                                                    <option>Ouvert au public</option>
                                                    <option value="Ouvert">Ouvert</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date d'ouvertir</label>
                                                <input type="date" value={formData.etatDateOuverture} name="etatDateOuverture" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <p style={{ color: 'red' }}>* Tous les champs sont obligatoires</p>
                                        <hr />
                                    <p>L'état en cours</p>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nature</label>
                                            <select value={formData.etatActuelNature} name="etatActuelNature" onChange={handleInputChange}>
                                                <option>Ouvert au public</option>
                                                <option value="Ouvert">Ouvert au public</option>

                                            </select>
                                        </div>
                                        <div className="form-groupee">
                                            <label>Date d'ouvertir</label>
                                            <input type="date" value={formData.etatActuelDateOuverture} name="etatActuelDateOuverture" onChange={handleInputChange} />
                                        </div>
                                     </div>
                                        <button className="save-btn" type="button" onClick={handleSubmit}>Enregistrer</button>
                                    </section>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Etablissement;
