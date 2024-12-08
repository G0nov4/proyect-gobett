import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RiArrowGoBackFill } from "react-icons/ri";
import logo from '../assets/Logo Gobett.png'; // Asegúrate de tener la ruta correcta del logo

const Page404 = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <Result
                icon={
                    <div style={{ marginBottom: '20px' }}>
                        <img 
                            src={logo} 
                            alt="Logo" 
                            style={{
                                width: '150px',
                                animation: 'float 3s ease-in-out infinite'
                            }}
                        />
                    </div>
                }
                title={
                    <div style={{ 
                        fontSize: '72px', 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        404
                    </div>
                }
                subTitle={
                    <span style={{ 
                        fontSize: '18px',
                        color: '#666',
                        marginBottom: '20px'
                    }}>
                        Lo sentimos, la página que buscas no existe
                    </span>
                }
                extra={
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<RiArrowGoBackFill />}
                        onClick={() => navigate('/')}
                        style={{
                            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                            border: 'none',
                            height: '45px',
                            padding: '0 30px',
                            borderRadius: '25px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Volver al inicio
                    </Button>
                }
            />
            <style>
                {`
                    @keyframes float {
                        0% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-20px);
                        }
                        100% {
                            transform: translateY(0px);
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default Page404;
