import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RiLoginBoxLine } from "react-icons/ri";
import logo from '../../assets/Logo Gobett.png';

const Page403 = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: '#fff'
        }}>
            <Result
                icon={
                    <div>
                        <img 
                            src={logo} 
                            alt="Logo" 
                            style={{
                                width: '120px',
                                maxWidth: '100%',
                                marginBottom: '20px'
                            }}
                        />
                    </div>
                }
                title={
                    <div style={{ 
                        fontSize: 'clamp(40px, 10vw, 72px)', 
                        fontWeight: 'bold',
                        color: '#ff4d4f'
                    }}>
                        403
                    </div>
                }
                subTitle={
                    <span style={{ 
                        fontSize: 'clamp(14px, 4vw, 18px)',
                        color: '#666',
                        textAlign: 'center',
                        display: 'block',
                        margin: '10px 0'
                    }}>
                        No tienes autorización para acceder
                    </span>
                }
                extra={
                    <Button 
                        type="primary" 
                        icon={<RiLoginBoxLine />}
                        onClick={() => {
                            localStorage.clear();
                            navigate('/login');
                        }}
                        style={{
                            backgroundColor: '#ff4d4f',
                            border: 'none',
                            height: '40px',
                            borderRadius: '6px'
                        }}
                    >
                        Ir al Login
                    </Button>
                }
            />
        </div>
    );
};

export default Page403;