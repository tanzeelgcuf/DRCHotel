import React, { useEffect } from "react";
import './TopBar.css';
import { useNavigate } from "react-router-dom";


import { assets } from "../../assets/assets"; // ajuste le chemin selon ton projet

const Topbar = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

    useEffect(() => {
    const toggleButton = document.getElementById("toggleSidebar");
    const sidebar = document.getElementById("sidebar");

    const toggleSidebar = () => {
        sidebar.classList.toggle("active");
    };

    const handleClickOutside = (event) => {
        if (
            sidebar.classList.contains("active") &&
            !sidebar.contains(event.target) &&
            !toggleButton.contains(event.target)
        ) {
            sidebar.classList.remove("active");
        }
    };

    toggleButton.addEventListener("click", toggleSidebar);
    document.addEventListener("click", handleClickOutside);

    return () => {
        toggleButton.removeEventListener("click", toggleSidebar);
        document.removeEventListener("click", handleClickOutside);
    };
}, []);


    return (
        <header className="topbar">
            <div className="topbar-left">
                <button id="toggleSidebar" className="toggle-btn">☰</button>
            </div>
            <div className="topbar-right">
                <div className="power" onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <i className='bx bx-power-off'></i>
            <span className="status-icon"></span>
             </div>
            </div>
        </header>
    );
};

export default Topbar;
