import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineScan } from "react-icons/ai"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SelectCountry from "../../components/ui/SelectCountry";
import { COUNTRIES } from '../../constants/countries';
import axios from 'axios';

import './Nfiche.css';

const Nfiche = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    sexe: "",
    dateNaissance: "",
    lieuNaissance: "",
    nationalite: "FRANCE",
    qualification: "",
    typeIdentite: "",
    numIdentite: "",
    dateEntreeCongo: "",
    numeroEntree: "",
    dateDelivrance: "",
    email: "",
    telephone: "",
    motifVoyage: "",
    organisationVoyage: "",
    dateArriveeCongo: "",  // <- corriger ici
    dateDepart: "",
    nbMineurs: "",
    lieuProvenance: "",
    destination: "",
    adresseDomiciliaire: "",
    ville: "",
    pays: "",
    chambre: "",
    indemnite: "",
    establishmentId: localStorage.getItem("establishmentId") || ""     // <- ajouter ici
  });
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token"); // CORRECTION ICI
  
    try {
      const response = await fetch("http://34.30.198.6:8081/api/clients/register-hotel-guest", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
    
      const responseData = await response.json(); // lire une seule fois
    
      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || "Erreur lors de l'envoi des données.";
        toast.error(`Erreur ${response.status} - ${response.statusText}\n${errorMessage}`);
        return;
      }
    
      toast.success("Formulaire soumis avec succès !");
      console.log("Form Data Submitted:", formData);
    
    } catch (error) {
      toast.error(error.message || "Une erreur est survenue lors de l'envoi du formulaire.");
    }
  };

  const handleScanClick = () => {
    // Déclenche le scan ou l'ouverture de la caméra
    document.getElementById("scanInput").click();
  };


const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    console.log("Fichier scanné :", file);

    const token = localStorage.getItem('token');

    const formDataToSend = new FormData();
    formDataToSend.append('document', file);

    const response = await axios.post('http://34.30.198.6:8081/api/scanner/passport', formDataToSend, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Réponse API:', response.data);

    if (response.data.success) {
      const data = response.data.extracted_data;

      // Fonction pour convertir les codes pays en noms lisibles
      const convertCountryCode = (code) => {
        const countryMap = {
          US: "États-Unis",
          FR: "France",
          CD: "RDCongo",
          BE: "Belgique",
          // ajoute d'autres si besoin
        };
        return countryMap[code] || code;
      };

      // Fonction pour traduire le type d'identité
      const convertDocType = (type) => {
        const types = {
          passport: "Passeport",
          id_card: "Carte d'identité",
          // autres types si disponibles
        };
        return types[type] || type;
      };

      setFormData(prev => ({
        ...prev,
        nom: data.last_name || "",
        prenom: data.first_name || "",
        sexe: data.gender === "M" ? "Homme" : data.gender === "F" ? "Femme" : "",
        dateNaissance: data.date_of_birth || "",
        lieuNaissance: data.place_of_birth || "",
        nationalite: convertCountryCode(data.nationality),
        typeIdentite: convertDocType(data.document_type),
        numIdentite: data.document_number || "",
        dateDelivrance: data.issue_date || "",
        // Tu peux compléter ici avec d'autres champs si l’API les fournit
      }));

      toast.success("Formulaire rempli automatiquement !");
    }

  } catch (error) {
    console.error('Erreur lors du scan :', error);
    toast.error("Échec du scan automatique");
  }
};


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div id="content">
      <main>
      <ToastContainer />
		<header className="header">
				<span className="admin"><i className='bx bxs-file-export'></i> Ajouter une fiche d'arrivée</span>
        <div className="scan-block">
          <p>Scanner un document :</p>
          <div className="scan-icon" onClick={handleScanClick}>
            <AiOutlineScan size={40} />
          </div>
          <input
            id="scanInput"
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

            </header><br /> 
        <div className="container">
          <div className="form-wrapper">
            <form onSubmit={handleSubmit}>
              <fieldset>
                <p>INFORMATIONS PERSONNELLES</p><br />
                <div className="form-group">
                  <label>* Nom</label>
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>* Prenom</label>
                  <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
                </div>
                <div className="form-group">
                <label>* Sexe</label>
                <div className="radio-options">
                  <div className="sexe">
                    <p>Homme</p>
                    <input
                      type="radio"
                      id="homme"
                      name="sexe"
                      value="Homme"
                      checked={formData.sexe === "Homme"}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="sexe">
                    <p>Femme</p>
                    <input
                      type="radio"
                      id="femme"
                      name="sexe"
                      value="Femme"
                      checked={formData.sexe === "Femme"}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

                <div className="flex">
                  <div className="block">
                    <label>* Date de naissance </label>
                    <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} required />
                  </div>
                  <div className="block">
                    <label>* Lieu de naissance</label>
                    <input type="text" placeholder="Saisi ici" name="lieuNaissance" value={formData.lieuNaissance} onChange={handleChange} />
                  </div>
                </div>
                <div className="flex">
                  <div className="block">
                    <label>* Nationalite</label>
                    <select name="nationalite" value={formData.nationalite} onChange={handleChange} required>
                      <option>Afficher la liste</option>
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Afrique du Sud">Afrique du Sud</option>
                      <option value="Albanie">Albanie</option>
                      <option value="Algérie">Algérie</option>
                      <option value="Allemagne">Allemagne</option>
                      <option value="Andorre">Andorre</option>
                      <option value="Angola">Angola</option>
                      <option value="Antigua-et-Barbuda">Antigua-et-Barbuda</option>
                      <option value="Arabie saoudite">Arabie saoudite</option>
                      <option value="Argentine">Argentine</option>
                      <option value="Arménie">Arménie</option>
                      <option value="Australie">Australie</option>
                      <option value="Autriche">Autriche</option>
                      <option value="Azerbaïdjan">Azerbaïdjan</option>
                      <option value="Bahamas">Bahamas</option>
                      <option value="Bahreïn">Bahreïn</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Barbade">Barbade</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Belize">Belize</option>
                      <option value="Bénin">Bénin</option>
                      <option value="Bhoutan">Bhoutan</option>
                      <option value="Biélorussie">Biélorussie</option>
                      <option value="Birmanie">Birmanie</option>
                      <option value="Bolivie">Bolivie</option>
                      <option value="Bosnie-Herzégovine">Bosnie-Herzégovine</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Brésil">Brésil</option>
                      <option value="Brunei">Brunei</option>
                      <option value="Bulgarie">Bulgarie</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Burundi">Burundi</option>
                      <option value="Cambodge">Cambodge</option>
                      <option value="Cameroun">Cameroun</option>
                      <option value="Canada">Canada</option>
                      <option value="Cap-Vert">Cap-Vert</option>
                      <option value="Chili">Chili</option>
                      <option value="Chine">Chine</option>
                      <option value="Chypre">Chypre</option>
                      <option value="Colombie">Colombie</option>
                      <option value="Comores">Comores</option>
                      <option value="Congo-Brazzaville">Congo-Brazzaville</option>
                      <option value="Congo-Kinshasa">Congo-Kinshasa</option>
                      <option value="Corée du Nord">Corée du Nord</option>
                      <option value="Corée du Sud">Corée du Sud</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Croatie">Croatie</option>
                      <option value="Cuba">Cuba</option>
                      <option value="Danemark">Danemark</option>
                      <option value="Djibouti">Djibouti</option>
                      <option value="Dominique">Dominique</option>
                      <option value="Égypte">Égypte</option>
                      <option value="Émirats arabes unis">Émirats arabes unis</option>
                      <option value="Équateur">Équateur</option>
                      <option value="Érythrée">Érythrée</option>
                      <option value="Espagne">Espagne</option>
                      <option value="Estonie">Estonie</option>
                      <option value="Eswatini">Eswatini</option>
                      <option value="États-Unis">États-Unis</option>
                      <option value="Éthiopie">Éthiopie</option>
                      <option value="Fidji">Fidji</option>
                      <option value="Finlande">Finlande</option>
                      <option value="France">France</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Gambie">Gambie</option>
                      <option value="Géorgie">Géorgie</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Grèce">Grèce</option>
                      <option value="Grenade">Grenade</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="Guinée">Guinée</option>
                      <option value="Guinée équatoriale">Guinée équatoriale</option>
                      <option value="Guinée-Bissau">Guinée-Bissau</option>
                      <option value="Guyana">Guyana</option>
                      <option value="Haïti">Haïti</option>
                      <option value="Honduras">Honduras</option>
                      <option value="Hongrie">Hongrie</option>
                      <option value="Inde">Inde</option>
                      <option value="Indonésie">Indonésie</option>
                      <option value="Irak">Irak</option>
                      <option value="Iran">Iran</option>
                      <option value="Irlande">Irlande</option>
                      <option value="Islande">Islande</option>
                      <option value="Israël">Israël</option>
                      <option value="Italie">Italie</option>
                      <option value="Jamaïque">Jamaïque</option>
                      <option value="Japon">Japon</option>
                      <option value="Jordanie">Jordanie</option>
                      <option value="Kazakhstan">Kazakhstan</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Kirghizistan">Kirghizistan</option>
                      <option value="Kiribati">Kiribati</option>
                      <option value="Kosovo">Kosovo</option>
                      <option value="Koweït">Koweït</option>
                      <option value="Laos">Laos</option>
                      <option value="Lesotho">Lesotho</option>
                      <option value="Lettonie">Lettonie</option>
                      <option value="Liban">Liban</option>
                      <option value="Libéria">Libéria</option>
                      <option value="Libye">Libye</option>
                      <option value="Liechtenstein">Liechtenstein</option>
                      <option value="Lituanie">Lituanie</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Macédoine du Nord">Macédoine du Nord</option>
                      <option value="Madagascar">Madagascar</option>
                      <option value="Malaisie">Malaisie</option>
                      <option value="Malawi">Malawi</option>
                      <option value="Maldives">Maldives</option>
                      <option value="Mali">Mali</option>
                      <option value="Malte">Malte</option>
                      <option value="Maroc">Maroc</option>
                      <option value="Marshall">Marshall</option>
                      <option value="Maurice">Maurice</option>
                      <option value="Mauritanie">Mauritanie</option>
                      <option value="Mexique">Mexique</option>
                      <option value="Micronésie">Micronésie</option>
                      <option value="Moldavie">Moldavie</option>
                      <option value="Monaco">Monaco</option>
                      <option value="Mongolie">Mongolie</option>
                      <option value="Monténégro">Monténégro</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Namibie">Namibie</option>
                      <option value="Nauru">Nauru</option>
                      <option value="Népal">Népal</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Niger">Niger</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Norvège">Norvège</option>
                      <option value="Nouvelle-Zélande">Nouvelle-Zélande</option>
                      <option value="Oman">Oman</option>
                      <option value="Ouganda">Ouganda</option>
                      <option value="Ouzbékistan">Ouzbékistan</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Palaos">Palaos</option>
                      <option value="Palestine">Palestine</option>
                      <option value="Panama">Panama</option>
                      <option value="Papouasie-Nouvelle-Guinée">Papouasie-Nouvelle-Guinée</option>
                      <option value="Paraguay">Paraguay</option>
                      <option value="Pays-Bas">Pays-Bas</option>
                      <option value="Pérou">Pérou</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Pologne">Pologne</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Roumanie">Roumanie</option>
                      <option value="Royaume-Uni">Royaume-Uni</option>
                      <option value="Russie">Russie</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Saint-Christophe-et-Niévès">Saint-Christophe-et-Niévès</option>
                      <option value="Saint-Marin">Saint-Marin</option>
                      <option value="Saint-Vincent-et-les-Grenadines">Saint-Vincent-et-les-Grenadines</option>
                      <option value="Sainte-Lucie">Sainte-Lucie</option>
                      <option value="Salomon">Salomon</option>
                      <option value="Salvador">Salvador</option>
                      <option value="Samoa">Samoa</option>
                      <option value="Sao Tomé-et-Principe">Sao Tomé-et-Principe</option>
                      <option value="Sénégal">Sénégal</option>
                      <option value="Serbie">Serbie</option>
                      <option value="Seychelles">Seychelles</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="Singapour">Singapour</option>
                      <option value="Slovaquie">Slovaquie</option>
                      <option value="Slovénie">Slovénie</option>
                      <option value="Somalie">Somalie</option>
                      <option value="Soudan">Soudan</option>
                      <option value="Soudan du Sud">Soudan du Sud</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Suède">Suède</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Suriname">Suriname</option>
                      <option value="Syrie">Syrie</option>
                      <option value="Tadjikistan">Tadjikistan</option>
                      <option value="Tanzanie">Tanzanie</option>
                      <option value="Tchad">Tchad</option>
                      <option value="Tchéquie">Tchéquie</option>
                      <option value="Thaïlande">Thaïlande</option>
                      <option value="Timor oriental">Timor oriental</option>
                      <option value="Togo">Togo</option>
                      <option value="Tonga">Tonga</option>
                      <option value="Trinité-et-Tobago">Trinité-et-Tobago</option>
                      <option value="Tunisie">Tunisie</option>
                      <option value="Turkménistan">Turkménistan</option>
                      <option value="Turquie">Turquie</option>
                      <option value="Tuvalu">Tuvalu</option>
                      <option value="Ukraine">Ukraine</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Vanuatu">Vanuatu</option>
                      <option value="Vatican">Vatican</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Yémen">Yémen</option>
                      <option value="Zambie">Zambie</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                    </select>
                  </div>
                  <div className="block">
                    <label>* Qualification</label>
                    <select name="qualification" value={formData.qualification || ""} onChange={handleChange} required>
                      <option>Afficher la liste</option>
                      <option value="Cadres, professions intellectuelles supérieures">Cadres, professions intellectuelles supérieures</option>
                      <option value="Professions intermediaires">Professions intermediaires</option>
                      <option value="Employés et ouvriers">Employés et ouvriers </option>
                      <option value="Retraités">Retraités</option>
                      <option value="Etudiants">Etudiants</option>
                    </select>
                  </div>
                </div>
                <div className="flex">
                  <div className="block">
                    <label>* Type d'identité</label>
                    <select name="typeIdentite" value={formData.typeIdentite} onChange={handleChange} required>
                      <option>Afficher la liste</option>
                      <option value="CIN">CIN</option>
                      <option value="Passport">Passport</option>
                      <option value="Titre de séjour">Titre de séjour</option>
                      <option value="Autres">Autres</option>
                    </select>
                  </div>
                  <div className="block">
                    <label>* Date & numéro d'entrée en RDCongo</label>
                    <input type="date" name="dateEntreeCongo" value={formData.dateEntreeCongo} onChange={handleChange} />
                    <input type="number" name="numeroEntree" value={formData.numeroEntree} onChange={handleChange} placeholder="Numéro entré"/>
                  </div>
                </div>
                <div className="flex">
                  <div className="block">
                    <label>* Numéro d'identité</label>
                    <input type="text" placeholder="Saisi ici" name="numIdentite" value={formData.numIdentite} onChange={handleChange} required />
                  </div>
                  <div className="block">
                    <label>* Date de delivrance</label>
                    <input type="date" name="dateDelivrance" value={formData.dateDelivrance} onChange={handleChange} />
                  </div>
                </div>
                <div className="flex">
                  <div className="block">
                    <label>* Adresse email </label>
                    <input type="email" placeholder="Saisi ici" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="block">
                    <label>Téléphone</label>
                    <input type="text" placeholder="+212 6 00 00 00 00" name="telephone" value={formData.telephone} onChange={handleChange} />
                  </div>
                </div>
              </fieldset>
            </form>
            <form onSubmit={handleSubmit}>
              <fieldset>
                <p>INFORMATIONS D'HÉBERGEMENT</p><br />
                <div className="form-group">
                  <label>Motif de voyage</label>
                  <select name="motifVoyage" value={formData.motifVoyage} onChange={handleChange}>
                    <option>Afficher la liste</option>
                    <option value="Loisirs et/ou récréation">Loisirs et/ou récréation</option>
                    <option value="Motifs professionels">Motifs professionels</option>
                    <option value="Rendre visite à des amis et familles">Rendre visite à des amis et familles</option>
                    <option value="Congrès, Conférences, Salons & Foires">Congrès, Conférences, Salons & Foires</option>
                    <option value="Autres">Autres</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Organisation de voyage</label>
                  <select name="organisationVoyage" value={formData.organisationVoyage} onChange={handleChange}>
                    <option>Afficher la liste</option>
                    <option value="Sans reservation">Sans reservation</option>
                    <option value="Reservation directe au près de l'hébergeur">Reservation directe au près de l'hébergeur</option>
                    <option value="Voyage organisé(TO étranger & TO RDCongo)">Voyage organisé(TO étranger & TO RDCongo)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date d'arrivée *</label>
                  <input type="date" name="dateArriveeCongo" value={formData.dateArriveeCongo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Date de départ</label>
                  <input type="date" name="dateDepart" value={formData.dateDepart} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Nombre de mineurs</label>
                  <input type="number" name="nbMineurs" placeholder="Saisi ici" value={formData.nbMineurs} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Lieu de provenance</label>
                  <input type="text" name="lieuProvenance" placeholder="Saisi ici" value={formData.lieuProvenance} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Destination</label>
                  <input type="text" name="destination" placeholder="Saisi ici" value={formData.destination} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Adresse domiciliaire actuelle</label>
                  <input type="text" name="adresseDomiciliaire" placeholder="Saisi ici" value={formData.adresseDomiciliaire} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Ville</label>
                  <input type="text" placeholder="Saisi ici" name="ville" value={formData.ville} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Pays *</label>
                  <select name="pays" value={formData.pays} onChange={handleChange} required>
                    <option>Afficher la liste</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Afrique du Sud">Afrique du Sud</option>
                    <option value="Albanie">Albanie</option>
                    <option value="Algérie">Algérie</option>
                    <option value="Allemagne">Allemagne</option>
                    <option value="Andorre">Andorre</option>
                    <option value="Angola">Angola</option>
                    <option value="Antigua-et-Barbuda">Antigua-et-Barbuda</option>
                    <option value="Arabie saoudite">Arabie saoudite</option>
                    <option value="Argentine">Argentine</option>
                    <option value="Arménie">Arménie</option>
                    <option value="Australie">Australie</option>
                    <option value="Autriche">Autriche</option>
                    <option value="Azerbaïdjan">Azerbaïdjan</option>
                    <option value="Bahamas">Bahamas</option>
                    <option value="Bahreïn">Bahreïn</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Barbade">Barbade</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Belize">Belize</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Bhoutan">Bhoutan</option>
                    <option value="Biélorussie">Biélorussie</option>
                    <option value="Birmanie">Birmanie</option>
                    <option value="Bolivie">Bolivie</option>
                    <option value="Bosnie-Herzégovine">Bosnie-Herzégovine</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Brésil">Brésil</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Bulgarie">Bulgarie</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Burundi">Burundi</option>
                    <option value="Cambodge">Cambodge</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Canada">Canada</option>
                    <option value="Cap-Vert">Cap-Vert</option>
                    <option value="Chili">Chili</option>
                    <option value="Chine">Chine</option>
                    <option value="Chypre">Chypre</option>
                    <option value="Colombie">Colombie</option>
                    <option value="Comores">Comores</option>
                    <option value="Congo-Brazzaville">Congo-Brazzaville</option>
                    <option value="Congo-Kinshasa">Congo-Kinshasa</option>
                    <option value="Corée du Nord">Corée du Nord</option>
                    <option value="Corée du Sud">Corée du Sud</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Croatie">Croatie</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Danemark">Danemark</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Dominique">Dominique</option>
                    <option value="Égypte">Égypte</option>
                    <option value="Émirats arabes unis">Émirats arabes unis</option>
                    <option value="Équateur">Équateur</option>
                    <option value="Érythrée">Érythrée</option>
                    <option value="Espagne">Espagne</option>
                    <option value="Estonie">Estonie</option>
                    <option value="Eswatini">Eswatini</option>
                    <option value="États-Unis">États-Unis</option>
                    <option value="Éthiopie">Éthiopie</option>
                    <option value="Fidji">Fidji</option>
                    <option value="Finlande">Finlande</option>
                    <option value="France">France</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Gambie">Gambie</option>
                    <option value="Géorgie">Géorgie</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Grèce">Grèce</option>
                    <option value="Grenade">Grenade</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Guinée">Guinée</option>
                    <option value="Guinée équatoriale">Guinée équatoriale</option>
                    <option value="Guinée-Bissau">Guinée-Bissau</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Haïti">Haïti</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Hongrie">Hongrie</option>
                    <option value="Inde">Inde</option>
                    <option value="Indonésie">Indonésie</option>
                    <option value="Irak">Irak</option>
                    <option value="Iran">Iran</option>
                    <option value="Irlande">Irlande</option>
                    <option value="Islande">Islande</option>
                    <option value="Israël">Israël</option>
                    <option value="Italie">Italie</option>
                    <option value="Jamaïque">Jamaïque</option>
                    <option value="Japon">Japon</option>
                    <option value="Jordanie">Jordanie</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Kirghizistan">Kirghizistan</option>
                    <option value="Kiribati">Kiribati</option>
                    <option value="Kosovo">Kosovo</option>
                    <option value="Koweït">Koweït</option>
                    <option value="Laos">Laos</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Lettonie">Lettonie</option>
                    <option value="Liban">Liban</option>
                    <option value="Libéria">Libéria</option>
                    <option value="Libye">Libye</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Lituanie">Lituanie</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Macédoine du Nord">Macédoine du Nord</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malaisie">Malaisie</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Mali">Mali</option>
                    <option value="Malte">Malte</option>
                    <option value="Maroc">Maroc</option>
                    <option value="Marshall">Marshall</option>
                    <option value="Maurice">Maurice</option>
                    <option value="Mauritanie">Mauritanie</option>
                    <option value="Mexique">Mexique</option>
                    <option value="Micronésie">Micronésie</option>
                    <option value="Moldavie">Moldavie</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mongolie">Mongolie</option>
                    <option value="Monténégro">Monténégro</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Namibie">Namibie</option>
                    <option value="Nauru">Nauru</option>
                    <option value="Népal">Népal</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Norvège">Norvège</option>
                    <option value="Nouvelle-Zélande">Nouvelle-Zélande</option>
                    <option value="Oman">Oman</option>
                    <option value="Ouganda">Ouganda</option>
                    <option value="Ouzbékistan">Ouzbékistan</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Palaos">Palaos</option>
                    <option value="Palestine">Palestine</option>
                    <option value="Panama">Panama</option>
                    <option value="Papouasie-Nouvelle-Guinée">Papouasie-Nouvelle-Guinée</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Pays-Bas">Pays-Bas</option>
                    <option value="Pérou">Pérou</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Pologne">Pologne</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Roumanie">Roumanie</option>
                    <option value="Royaume-Uni">Royaume-Uni</option>
                    <option value="Russie">Russie</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Saint-Christophe-et-Niévès">Saint-Christophe-et-Niévès</option>
                    <option value="Saint-Marin">Saint-Marin</option>
                    <option value="Saint-Vincent-et-les-Grenadines">Saint-Vincent-et-les-Grenadines</option>
                    <option value="Sainte-Lucie">Sainte-Lucie</option>
                    <option value="Salomon">Salomon</option>
                    <option value="Salvador">Salvador</option>
                    <option value="Samoa">Samoa</option>
                    <option value="Sao Tomé-et-Principe">Sao Tomé-et-Principe</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Serbie">Serbie</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Singapour">Singapour</option>
                    <option value="Slovaquie">Slovaquie</option>
                    <option value="Slovénie">Slovénie</option>
                    <option value="Somalie">Somalie</option>
                    <option value="Soudan">Soudan</option>
                    <option value="Soudan du Sud">Soudan du Sud</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Suède">Suède</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Syrie">Syrie</option>
                    <option value="Tadjikistan">Tadjikistan</option>
                    <option value="Tanzanie">Tanzanie</option>
                    <option value="Tchad">Tchad</option>
                    <option value="Tchéquie">Tchéquie</option>
                    <option value="Thaïlande">Thaïlande</option>
                    <option value="Timor oriental">Timor oriental</option>
                    <option value="Togo">Togo</option>
                    <option value="Tonga">Tonga</option>
                    <option value="Trinité-et-Tobago">Trinité-et-Tobago</option>
                    <option value="Tunisie">Tunisie</option>
                    <option value="Turkménistan">Turkménistan</option>
                    <option value="Turquie">Turquie</option>
                    <option value="Tuvalu">Tuvalu</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Vanuatu">Vanuatu</option>
                    <option value="Vatican">Vatican</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Yémen">Yémen</option>
                    <option value="Zambie">Zambie</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Chambre *</label>
                  <select name="chambre" value={formData.chambre} onChange={handleChange} required>
                    <option>Afficher la liste</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Prix de la nuité *</label>
                  <input type="number" name="indemnite" value={formData.indemnite} placeholder="Prix de l'indemnité" onChange={handleChange} />
                </div>
                <button type="submit">VALIDER</button>
              </fieldset>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Nfiche;