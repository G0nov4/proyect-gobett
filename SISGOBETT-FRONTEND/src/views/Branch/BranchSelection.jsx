import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranches } from '../../services/Branches';
import { Button, Card, Col, Row, Spin, Badge, Statistic, message, Avatar, Divider } from 'antd';
import { 
    ShopOutlined, 
    EnvironmentOutlined, 
    CheckCircleOutlined,
    UserOutlined,
    ClockCircleOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import './BranchSelection.css';

const SidebarLogo = () => (
    <div className="company-logo">
        <div className="logo-container">
            <ShopOutlined className="logo-icon" />
        </div>
        <h1>SISGOBETT</h1>
    </div>
);

const UserProfileCard = ({ onLogout }) => {
    const userName = localStorage.getItem('username') || 'Usuario';
    const userRole = localStorage.getItem('sis_role') || 'Operador';

    return (
        <Card className="user-profile-card">
            <div className="user-profile-content">
             
                <div className="user-info-container">
                    <h3 className="user-name">{userName}</h3>
                    <p className="user-role">{userRole}</p>
                    <Button 
                        type="primary" 
                        danger
                        icon={<LogoutOutlined />} 
                        onClick={onLogout}
                        className="logout-button"
                    >
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const BranchSelection = () => {
    const navigate = useNavigate();
    const { data: branchesData, isLoading, error } = useBranches('id', 'asc', {
            available: {
                $eq: true
            }
    });

    const handleBranchSelection = (branch) => {
        localStorage.setItem('selected_branch', branch.id);
        localStorage.setItem('branch_name', branch.attributes.name);
        message.success({
            content: `¡Bienvenido a ${branch.attributes.name}!`,
            icon: <CheckCircleOutlined style={{ color: '#FF002F' }} />
        });
        navigate('/operator/sales');
    };

    const handleLogout = () => {
        localStorage.clear();
        message.success('Sesión cerrada exitosamente');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="branch-loading">
                <div className="loading-content">
                    <ShopOutlined className="loading-icon" />
                    <Spin size="large" />
                    <p>Conectando con las sucursales...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="branch-error">
                <h2>No pudimos conectar con las sucursales</h2>
                <p>Intenta nuevamente en unos momentos</p>
                <Button type="primary" onClick={() => window.location.reload()}>
                    Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className="branch-dashboard">
            <div className="dashboard-sidebar">
                <SidebarLogo />
                <div className="sidebar-stats">
                    <Statistic 
                        title="Sucursales Activas" 
                        value={branchesData?.data.length} 
                        prefix={<ShopOutlined />} 
                    />
                    <p className="welcome-text">Selecciona tu espacio de trabajo</p>
                </div>
                <UserProfileCard onLogout={handleLogout} />
            </div>

            <div className="dashboard-main">
                <div className="dashboard-header">
                    <h2>Selección de Sucursal</h2>
                    <div className="header-time">
                        <ClockCircleOutlined />
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="branches-grid">
                    {branchesData?.data.map(branch => (
                        <div className="branch-card-wrapper" key={branch.id}>
                            <div className="branch-card">
                                <div className="branch-status">
                                    <Badge status="success" text="Activa" />
                                </div>
                                <div className="branch-icon">
                                    <ShopOutlined />
                                </div>
                                <div className="branch-info">
                                    <h3>{branch.attributes.name}</h3>
                                    <p>
                                        <EnvironmentOutlined />
                                        {branch.attributes.address}
                                    </p>
                                </div>
                                <Divider/>
                                <Button 
                                    type="primary" 
                                    className="select-branch-btn"
                                    onClick={() => handleBranchSelection(branch)}
                                >
                                    Seleccionar Sucursal
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BranchSelection;