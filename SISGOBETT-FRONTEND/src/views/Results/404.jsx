import React from 'react';
import { Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RiArrowGoBackFill } from "react-icons/ri";
import { FiLogIn } from "react-icons/fi";
import logo from '../../assets/Logo Gobett.png';
import './404.css';

const Page404 = () => {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <div className="error-content">
                <span className="error-number">404</span>
                <div className="logo-container-sis">
                    <img src={logo} alt="Logo Gobett" className="floating-logo" />
                </div>
                
                <div className="error-text">
                    <p className="error-subtitle">¡Oops! Página no encontrada</p>
                    <p className="error-description">
                        La página que estás buscando podría haber sido eliminada, 
                        cambió de nombre o está temporalmente inaccesible.
                    </p>
                </div>

                <Space size="middle" className="buttons-container">
                 
                    <Button 
                        type="default"
                        icon={<FiLogIn />}
                        onClick={() => navigate('/login')}
                        className="login-button"
                    >
                        Iniciar Sesión
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default Page404;