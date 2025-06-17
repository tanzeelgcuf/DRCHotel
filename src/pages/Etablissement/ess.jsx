import React, { useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Etablissement.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { assets } from "../../assets/assets";

const Etablissement = () => {
    const fileInputRef = useRef(null);
    const [step, setStep] = useState("informations");
    const handleInformationsSubmit = (e) => {
        e.preventDefault();
        // logique de sauvegarde
        setStep("capacites");
      };
    

    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        message: '',
        adresse: '',
        ville: '',
        gsm: '',
        fixe: '',
        type: '',
        siteweb: '',
        useNomChambre: false,
        nombreChambres: '',
        aPartirDe: ''
    });
    const [logo, setLogo] = useState(null);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e) => {
        setLogo(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        for (let key in formData) {
            data.append(key, formData[key]);
        }
        if (logo) {
            data.append("logo", logo);
        }

        try {
            const response = await fetch("http://localhost:3000/api/ajouter-client", {
                method: "POST",
                body: data,
            });

            const result = await response.json();
            console.log("Succès :", result);
            toast.success("Données envoyées avec succès !");
        } catch (error) {
            console.error("Erreur :", error);
            toast.error("Une erreur est survenue !");
        }
    };

    const handleCancel = () => {
        setLogo(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Réinitialise le champ input
        }
      };
      

    return (
        <div id="content">
            <main>
            <ToastContainer />
                <header className="header">
                    <span className="admin">Admin</span>
                    <div>
                        <Link to='/login'><i className='bx bx-power-off'></i></Link>
                        <span className="status-icon"></span>
                    </div>
                </header>
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

                                    <button className="cancel-btn" type="button" onClick={handleCancel}>
                                        Annuler
                                    </button>
                                    </div>
                                    <br />


                                <p className="file-info">Fichier JPG, GIF ou PNG autorisés. Taille maximale de 800K</p><br />
                                <hr />

                                <form className="form-box"  onSubmit={handleInformationsSubmit}>
                                    <p>Informations générales</p>
                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nom d’établissement</label>
                                            <input type="text" name="nom" placeholder="hotel beatrice" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Email</label>
                                            <input type="email" name="email" placeholder="mjl@wayscompany.com" onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <label>Petit message en fin d’inscription des clients</label>
                                    <div className="form-groupeee">
                                        <div className="group-text">
                                            <label>Message</label>
                                        </div>
                                        <div className="group-input">
                                            <textarea name="message" placeholder="Saisissez une description affichée aux clients" onChange={handleInputChange}></textarea>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Adresse</label>
                                            <input type="text" name="adresse" placeholder="306 Ave De La Gombe, Kinshasa, République dém" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Ville</label>
                                            <select name="ville" onChange={handleInputChange}>
                                                <option value="">-- Choisir --</option>
                                                <option>Casablanca</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>N° GSM</label>
                                            <input type="text" name="gsm" placeholder="MA (+212) +243993873999" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>N° Fixe</label>
                                            <input type="text" name="fixe" placeholder="MA (+212) 05/8 00 00 00 00" onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Type d’établissement</label>
                                            <select name="type" onChange={handleInputChange}>
                                                <option value="">-- Choisir --</option>
                                                <option>Hôtel</option>
                                            </select>
                                        </div>
                                        <div className="form-groupee">
                                            <label>Site Web</label>
                                            <input type="text" name="siteweb" placeholder="www" onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <div className="check">
                                        <div className="check_icon">
                                            <input type="checkbox" name="useNomChambre" onChange={handleInputChange} />
                                        </div>
                                        <div className="check_text">
                                            <p>Utiliser les noms des chambres ou les adresses des appartements.</p>
                                        </div>
                                    </div>
                                    
                                    <button className="save-btn" type="submit">Enregistrer</button>
                                    <hr />
                                    <fieldset><legend>Capacités</legend>

                                    <p>Capacités courantes</p>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nombre des chambres</label>
                                            <input type="number" name="nombreChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>À partir N° Chambres</label>
                                            <input type="number" name="aPartirDe" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nombre des studios</label>
                                            <input type="number" name="nombreChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Nombre de lit</label>
                                            <input type="number" name="aPartirDe" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nombre de suite</label>
                                            <input type="number" name="nombreChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Nombre de villa</label>
                                            <input type="number" name="aPartirDe" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nombre d'emplacement</label>
                                            <input type="number" name="nombreChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Nombre de début d'effet </label>
                                            <input type="date" name="aPartirDe" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    
                                    <hr />
                                    
                                    <p>Capacités operationnelles</p>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nombre des chambres</label>
                                            <input type="number" name="nombreChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>À partir N° Chambres</label>
                                            <input type="number" name="aPartirDe" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nombre des studios</label>
                                            <input type="number" name="nombreChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Nombre de lit</label>
                                            <input type="number" name="aPartirDe" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nombre de suite</label>
                                            <input type="number" name="nombreChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Nombre de villa</label>
                                            <input type="number" name="aPartirDe" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nombre d'emplacement</label>
                                            <input type="number" name="nombreChambres" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-groupee">
                                            <label>Nombre de fin d'effet </label>
                                            <input type="date" name="aPartirDe" placeholder="Saisi ici" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    
                                    <button className="save-btn" type="submit">Enregistrer</button>
                                    </fieldset>
                                    <hr />
                                    <fieldset><legend>Autorisations</legend>
                                    <p>Autorisation d'exploitation</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Autorité de délivrance</label>
                                                <select name="autoriteDelivrance" onChange={handleInputChange}>
                                                    <option>Province/Préfecture</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date de délivrance</label>
                                                <input type="date" name="dateDelivrance" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>N° d'autorisation</label>
                                                <input type="text" name="numeroAutorisation" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Profil</label>
                                                <select name="profil" onChange={handleInputChange}>
                                                    <option>Personne physique</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nature document</label>
                                                <select name="natureDocument" onChange={handleInputChange}>
                                                    <option>CIN</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>N° du document</label>
                                                <input type="text" name="numeroDocument" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nationalité</label>
                                                <select name="nationalite" onChange={handleInputChange}>
                                                    <option>MAROC</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nom</label>
                                                <input type="text" name="nom" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Prénom</label>
                                                <input type="text" name="prenom" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        
                                        <hr />
                                        <p>Autorisation de débit d'alcool - Personne physique</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Autorité de délivrance</label>
                                                <select name="autoriteDelivranceAlcoolPhysique" onChange={handleInputChange}>
                                                    <option>La wilaya</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date de délivrance</label>
                                                <input type="date" name="dateDelivranceAlcoolPhysique" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>N° d'autorisation</label>
                                                <input type="text" name="numeroAutorisationAlcoolPhysique" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nature document</label>
                                                <select name="natureDocumentAlcoolPhysique" onChange={handleInputChange}>
                                                    <option>CIN</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>N° du document</label>
                                                <input type="text" name="numeroDocumentAlcoolPhysique" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nationalité</label>
                                                <select name="nationaliteAlcoolPhysique" onChange={handleInputChange}>
                                                    <option>-- INDETERMINE --</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nom</label>
                                                <input type="text" name="nomAlcoolPhysique" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Prénom</label>
                                                <input type="text" name="prenomAlcoolPhysique" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        
                                        <hr />
                                        <p>Autorisation de débit d'alcool - Personne morale</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Autorité de délivrance</label>
                                                <select name="autoriteDelivranceAlcoolMorale" onChange={handleInputChange}>
                                                    <option>La wilaya</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date de délivrance</label>
                                                <input type="date" name="dateDelivranceAlcoolMorale" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>N° d'autorisation</label>
                                                <input type="text" name="numeroAutorisationAlcoolMorale" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Raison sociale</label>
                                                <input type="text" name="raisonSocialeAlcoolMorale" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>N° Registre de commerce</label>
                                                <input type="text" name="registreCommerceAlcoolMorale" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Dénomination</label>
                                                <input type="text" name="denominationAlcoolMorale" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        
                                        <button className="save-btn" type="submit">Enregistrer</button>
                                        </fieldset>
                                        <hr />
                                        <fieldset><legend>Opérateurs</legend>
                                        <p>Le propriétaire</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Profil</label>
                                                <select name="profilProprietaire" onChange={handleInputChange}>
                                                    <option>Consortium</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Dénomination</label>
                                                <input type="text" name="denominationProprietaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Raison sociale</label>
                                                <input type="text" name="raisonSocialeProprietaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>N° Registre de commerce</label>
                                                <input type="text" name="registreCommerceProprietaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>N° Tél.</label>
                                                <input type="text" name="telProprietaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>N° Fax.</label>
                                                <input type="text" name="faxProprietaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>GSM</label>
                                                <input type="text" name="gsmProprietaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>E-Mail</label>
                                                <input type="email" name="emailProprietaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div><br />
                                        <hr /><br />

                                        <p>Le gestionnaire</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Profil</label>
                                                <select name="profilGestionnaire" onChange={handleInputChange}>
                                                    <option>Indépendant ( Personne physique )</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nature du document</label>
                                                <select name="natureDocumentGestionnaire" onChange={handleInputChange}>
                                                    <option>CIN</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>N° de la CIN</label>
                                                <input type="text" name="cinGestionnaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nom</label>
                                                <input type="text" name="nomGestionnaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Prénom</label>
                                                <input type="text" name="prenomGestionnaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nationalité</label>
                                                <select name="nationaliteGestionnaire" onChange={handleInputChange}>
                                                    <option>-- INDETE --</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Sexe</label>
                                                
                                                <select name="sexe" onChange={handleInputChange}>
                                                    <option>-- Sexe --</option>
                                                    <option value="M">M</option>
                                                    <option value="F">F</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date contrat de gestion</label>
                                                <input type="date" name="dateContratGestion" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>N° Tél.</label>
                                                <input type="text" name="telGestionnaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>N° Fax.</label>
                                                <input type="text" name="faxGestionnaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>GSM</label>
                                                <input type="text" name="gsmGestionnaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>E-Mail</label>
                                                <input type="email" name="emailGestionnaire" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            
                                        </div><br />
                                        
                                        <hr /><br />

                                        <p>Le directeur</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nature du document</label>
                                                <select name="natureDocumentDirecteur" onChange={handleInputChange}>
                                                    <option>CIN</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>N° de la CIN</label>
                                                <input type="text" name="cinDirecteur" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nom</label>
                                                <input type="text" name="nomDirecteur" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Prénom</label>
                                                <input type="text" name="prenomDirecteur" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Sexe</label>
                                                <select name="sexe" onChange={handleInputChange}>
                                                    <option>-- Sexe --</option>
                                                    <option value="M">M</option>
                                                    <option value="F">F</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Nationalité</label>
                                                <select name="nationaliteDirecteur" onChange={handleInputChange}>
                                                    <option>-- INDETE --</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Niveau scolaire</label>
                                                <select name="niveauScolaireDirecteur" onChange={handleInputChange}>
                                                    <option>Niveau N°1</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date du recrutement</label>
                                                <input type="date" name="dateRecrutementDirecteur" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>N° Tél.</label>
                                                <input type="text" name="telDirecteur" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>N° Fax.</label>
                                                <input type="text" name="faxDirecteur" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>GSM</label>
                                                <input type="text" name="gsmDirecteur" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                            <div className="form-groupee">
                                                <label>E-Mail</label>
                                                <input type="email" name="emailDirecteur" placeholder="Saisi ici" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        
                                    <button className="save-btn" type="submit">Enregistrer</button>
                                    </fieldset>
                                        <hr />
                                        <fieldset><legend>Labels et Certifications</legend>
                                        <p>Traitement des distinctions</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nature</label>
                                                <select name="natureDistinction" onChange={handleInputChange}>
                                                    <option>Certification</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Type</label>
                                                <select name="typeDistinction" onChange={handleInputChange}>
                                                    <option>ISO 9 001</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date obtention</label>
                                                <input type="date" name="dateObtentionDistinction" onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <p style={{ color: 'red' }}>* Tous les champs sont obligatoires</p>
                                        
                                        <hr />

                                        <p>Liste des distinctions</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nature</label>
                                                <input type="text" value="Certification" disabled />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Type</label>
                                                <input type="text" value="ISO 9 001" disabled />
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date d'obtention</label>
                                                <input type="text" value="01/03/2012" disabled />
                                            </div>
                                        </div>
                                        
                                    <button className="save-btn" type="submit">Enregistrer</button>
                                    </fieldset>
                                        <hr />
                                        <fieldset><legend>Services</legend>
                                        <p>Liste des Services</p>

                                        <div className="form-row">
                                        <div className="form-groupeeee">
                                            <div className="form_check">
                                                <label> Restaurant</label><input type="checkbox"  />
                                            </div>
                                            <div className="form_check">
                                                <label> Night-club</label><input type="checkbox" />
                                            </div>
                                            <div className="form_check">
                                            <label> Golf</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Salles de conférence</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Jardins</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Centre bien être / Spa</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Internet</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                            <label>Parking</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Casino</label><input type="checkbox"/>
                                            </div>
                                        </div>

                                        <div className="form-groupeeee">
                                            <div className="form_check">
                                                <label> Bar</label><input type="checkbox" />
                                            </div>
                                            <div className="form_check">
                                                <label> Piscine</label><input type="checkbox" />
                                            </div>
                                            <div className="form_check">
                                            <label> Salle de sport</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Boutiques</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Garderie / club d’enfants</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Salon de coiffure et d’esthétique</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Cafétéria</label><input type="checkbox"/>
                                            </div>
                                            <div className="form_check">
                                                <label> Chambres climatisées</label><input type="checkbox" />
                                            </div>
                                            <div className="form_check">
                                                <label> Terrains de sport</label><input type="checkbox" />
                                            </div>
                                        </div>
                                        </div>
                                        <button className="save-btn" type="submit">Enregistrer</button>
                                    </fieldset>
                                        <hr />
                                        <fieldset><legend>Etats</legend>
                                        <p>Traitement des etats</p>

                                        <div className="form-row">
                                            <div className="form-groupee">
                                                <label>Nature</label>
                                                <select name="natureDistinction" onChange={handleInputChange}>
                                                    <option>Ouvert au public</option>
                                                </select>
                                            </div>
                                            <div className="form-groupee">
                                                <label>Date d'ouvertir</label>
                                                <input type="date" name="dateouvertir" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <p style={{ color: 'red' }}>* Tous les champs sont obligatoires</p>
                                        <hr />
                                    <p>L'état en cours</p>

                                    <div className="form-row">
                                        <div className="form-groupee">
                                            <label>Nature</label>
                                            <select name="natureDistinction" onChange={handleInputChange}>
                                                <option>Ouvert au public</option>
                                            </select>
                                        </div>
                                        <div className="form-groupee">
                                            <label>Date d'ouvertir</label>
                                            <input type="date" name="dateouvertir" onChange={handleInputChange} />
                                        </div>
                                    </div>
                    

                                    <button className="save-btn" type="submit">Enregistrer</button>
                                    </fieldset>
                                </form>
                            </div>
                        </div>

                        <div className="pdf-box">
                            <h3 className="pdf-title">📄 VOTRE FICHE - PDF</h3>
                            <hr />
                            <h2 className="pdf-text">Votre fiche de police est prête</h2>
                            <br /><br />
                            
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Etablissement;
