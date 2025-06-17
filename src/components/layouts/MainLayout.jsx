import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../composants/NAVBAR/Navbar';
import Topbar from '../../composants/Topbar/TopBar';  // <-- import Topbar

const MainLayout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Topbar />}   {/* Affiche Topbar */}
      {!shouldHideNavbar && <Navbar />}   {/* Affiche Navbar */}
      {children}
    </>
  );
};

export default MainLayout;
