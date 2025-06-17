import React, { useEffect } from "react";
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Navbar = () => {

    

    return (
        <div>
            {/* Bouton toggle visible sur petits écrans */}
        

            <section id="sidebar">
                <div className="logo">
                    <img src={assets.logo} alt="Logo" />
                </div>
                <ul className="side-menu top">
                    <li>
                        <NavLink to="/dashboard"><i className='bx bx-home-alt'></i><span className="text">Tableau de board</span></NavLink>
                    </li>
                    <li>
                        <NavLink to="/enregistrement"><i className='bx bxs-file-export'></i><span className="text">Nouvelle fiche</span></NavLink>
                    </li>
                    <li>
                        <NavLink to="/hebergement-en-cours"><i className='bx bxs-file'></i><span className="text">Hebergements</span></NavLink>
                    </li>
                    <li>
                        <NavLink to="/creation-poste"><i className='bx bxs-file-archive'></i><span className="text">Archive</span></NavLink>
                    </li>
                    <li>
                        <span className="text1"><hr /> Configuration</span>
                    </li>
                    <li>
                        <NavLink to="/Etablissement"><i className='bx bxs-school'></i><span className="text">Mon établissement</span></NavLink>
                    </li>
                    <li>
                        <NavLink to="/historique-vente"><i className='bx bxs-message-dots'></i><span className="text">Fiche de conditions</span></NavLink>
                    </li>
                    <li>
                        <NavLink to="/creation-poste"><i className='bx bx-user-voice'></i><span className="text">Utilisateurs</span></NavLink>
                    </li>
                    <li>
                        <span className="text1"><hr /> Pack</span>
                    </li>
                    <li>
                        <NavLink to="/creation-poste"><i className='bx bxs-receipt'></i><span className="text">Conditions générales</span></NavLink>
                    </li>
                    <li>
                        <NavLink to="/creation-poste"><i className='bx bxs-receipt'></i><span className="text">Support</span></NavLink>
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default Navbar;
