import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/AuthService";
import { message } from "antd";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [loggedUser, setLoggedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        const token = localStorage.getItem("sisgbt-jwtoken");
        if (token) {
            try {
                setLoggedUser({
                    type: localStorage.getItem("sis_role"),
                    token: token,
                    id: localStorage.getItem("user_id"),
                    username: localStorage.getItem("username"),
                    email: localStorage.getItem("user_email")
                });
            } catch (error) {
                console.error('Error al verificar la autenticación:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    const redirectToDashboard = (userType) => {
        checkAuthentication();
        const username = localStorage.getItem('username');
        
        switch (userType) {
            case 'gerente':
                message.success(`¡Bienvenido ${username}!`);
                navigate('/admin', { replace: true });
                break;
            case 'operador de venta':
                const selectedBranch = localStorage.getItem('selected_branch');
                if (selectedBranch) {
                    message.success(`¡Bienvenido ${username}!`);
                    navigate('/operator/sales', { replace: true });
                } else {
                    navigate('/select-branch', { replace: true });
                }
                break;
            case 'operador de almacen':
                message.success(`¡Bienvenido ${username}!`);
                navigate('/warehouse', { replace: true });
                break;
            default:
                message.warning('Usuario no reconocido');
                navigate('/login', { replace: true });
        }
    };

    const login = async (email, password) => {
        try {
            const userInfo = await authService.login(email, password);
            const roleInfo = await authService.getRole(userInfo);

            if (roleInfo) {
                localStorage.setItem('sisgbt-jwtoken', roleInfo.jwt);
                localStorage.setItem('sis_role', roleInfo.role.name);
                
                redirectToDashboard(roleInfo.role.name);
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setLoggedUser(null);
        message.success('Sesión cerrada exitosamente');
        navigate('/login', { replace: true });
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated: !!loggedUser, 
            loggedUser, 
            isLoading, 
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
