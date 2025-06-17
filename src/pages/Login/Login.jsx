import React, { useMemo, useState, useEffect } from 'react';
import './Login.css';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import API_ENDPOINTS from '../../constants/apiConfig';

const Login = () => {
  const [currState, setCurrState] = useState("Se connecter");
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('operator');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/Etablissement');
    }
  }, [isAuthenticated, navigate]);

  const securite = useMemo(() => {
    return evaluatePasswordStrength(password);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (currState === "Créer un compte") {
        const userData = {
          username,
          email,
          password,
          firstName,
          lastName,
          role
        };

        const result = await register(userData);

        if (result.success) {
          toast.success("Compte créé avec succès");
          setCurrState("Se connecter");
        } else {
          toast.error(result.error || "Erreur lors de la création du compte");
        }
      } else {
        const result = await login(username, password);

        if (result.success) {
          toast.success("Connexion réussie !");
          setTimeout(() => {
            navigate("/Etablissement");
          }, 1000);
        } else {
          toast.error(result.error || "Erreur lors de la connexion");
        }
      }
    } catch (error) {
      toast.error("Erreur de communication avec le serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fullscreen-background">
      <div className='login-popup'>
        <form className="login-popup-contenair" onSubmit={handleSubmit}>
          <div className="img_logo">
            <img src={assets.logo} alt="Logo" />
          </div>
          <div className="login-popup-title">
            <h2>{currState}</h2>
          </div>

          <div className="login-popup-inputs">
            {currState === "Créer un compte" && (
              <>
                <div className="flex_input">
                  <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <input
                    type="email"
                    placeholder="Adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex_input">
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex_input">
                  <input
                    type="text"
                    placeholder="Rôle (admin ou operator)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            {currState === "Se connecter" && (
              <div className="flex_input">
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="flex_input">
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {currState === "Créer un compte" && (
              <p className='securite'>{securite}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Chargement..." :
              currState === "Créer un compte" ? "Créer un compte" : "Se connecter"}
          </button>

          {currState === "Se connecter" ? (
            <p>Créer le compte ? <span onClick={() => setCurrState("Créer un compte")}>cliquez ici</span></p>
          ) : (
            <p>Déjà un compte ? <span onClick={() => setCurrState("Se connecter")}>Se connecter</span></p>
          )}

          <div className="login-popup-titl">
            <p><span><i className='bx bx-chevron-left'></i></span></p>
            <p><span>Accueil</span></p>
          </div>
        </form>
      </div>
    </div>
  );
};

function evaluatePasswordStrength(password) {
  if (password.length === 0) return '';
  if (password.length < 5) return 'Le mot de passe est faible !';
  else if (password.length < 7) return 'Le mot de passe est moyen';
  else return 'Le mot de passe est fort';
}

export default Login;
