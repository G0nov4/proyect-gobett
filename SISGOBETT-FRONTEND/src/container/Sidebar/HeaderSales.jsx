import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Divider, Button, Drawer, Tag } from 'antd';
import { SettingOutlined, LogoutOutlined, UserOutlined, ShopOutlined, MenuOutlined } from '@ant-design/icons';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'; // Necesitamos usarLocation para saber la ruta activa
import './HeaderSales.css';
import { BsClipboardCheck, BsBox, BsCalculator } from 'react-icons/bs';
import { Content } from 'antd/es/layout/layout';
import { FaCashRegister } from 'react-icons/fa';

const { Header } = Layout;

const HeaderSales = ({children}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const branchName = localStorage.getItem('branch_name');
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

    // Menú desplegable del avatar mejorado
    const profileMenu = (
        <Menu>
           
            <Menu.Item 
                key="branch" 
                icon={<ShopOutlined />}
                onClick={() => navigate('/select-branch')}
            >
                Cambiar Sucursal
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
                key="logout" 
                icon={<LogoutOutlined />}
                danger
                onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                }}
            >
                Cerrar Sesión
            </Menu.Item>
        </Menu>
    );

    const menuItems = [
        { path: 'sales', icon: <FaCashRegister />, label: 'CAJA' },
        { path: 'orders', icon: <BsClipboardCheck />, label: 'PEDIDOS' },
        { path: 'products', icon: <BsBox />, label: 'PRODUCTOS' },
    ];

    return (
        <Layout>
            <Header className="header">
                {/* Vista Móvil */}
                <div className="mobile-view">
                    <Button
                        className="mobile-menu-btn"
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileMenuVisible(true)}
                    />
                    <div className="branch-badge">
                        <ShopOutlined />
                        <span>{branchName.toUpperCase()}</span>
                    </div>
                    <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
                        <Avatar size="small" icon={<UserOutlined />} className="avatar-icon" />
                    </Dropdown>
                </div>

                {/* Vista Desktop */}
                <div className="desktop-view">
                    <div className="branch-badge">
                        <ShopOutlined />
                        <span>{branchName}</span>
                    </div>
                    <div className="nav-menu">
                        {menuItems.map(item => (
                            <Link 
                                key={item.path}
                                to={item.path} 
                                className={`nav-link ${location.pathname === `/operator/${item.path}` ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="user-profile">
                        <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
                            <Avatar size="small" icon={<UserOutlined />} className="avatar-icon" />
                        </Dropdown>
                    </div>
                </div>
            </Header>

            {/* Menú móvil */}
            <Drawer
                title={branchName}
                placement="left"
                onClose={() => setMobileMenuVisible(false)}
                open={mobileMenuVisible}
                width={250}
            >
                {menuItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`drawer-link ${location.pathname === `/operator/${item.path}` ? 'active' : ''}`}
                        onClick={() => setMobileMenuVisible(false)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </Drawer>

            <Content >{children}</Content>
        </Layout>
    );
};

export default HeaderSales;
