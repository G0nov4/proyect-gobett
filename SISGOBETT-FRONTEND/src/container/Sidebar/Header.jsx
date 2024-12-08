import React, { useContext, useState } from 'react';
import { Layout, Menu, Dropdown,  Row, Col, Avatar, Button, Drawer, Space, message } from 'antd';
import { UserOutlined, ProfileOutlined, SettingOutlined, LogoutOutlined, MenuOutlined, DownOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar'
import './Header.css'
import { AuthContext } from '../../context/AuthContext';

const { Header, Content } = Layout;

const CustomHeader = ({ title, children }) => {
    const { logout } = useContext(AuthContext)
    const [visibleSidebar, setVisibleSidebar] = useState(false);

    return (
        <Layout>
            <Sidebar breakpoint="lg" collapsedWidth={0} />
            <Layout>
                <Header style={{ 
                    padding: '0 10px',
                    background: '#fff',
                    boxShadow: '0 2px 8px #f0f1f2',
                    height: '45px'
                }}>
                    <Row align='middle' justify='space-between' style={{ width: '100%', height: '45px' }}>
                        <Col style={{ height: '45px', display: 'flex', alignItems: 'center' }}>
                            <Button
                                className="menu-mobile-button"
                                type="text"
                                icon={<MenuOutlined />}
                                onClick={() => setVisibleSidebar(true)}
                                style={{ height: '45px' }}
                            />
                        </Col>
                        <Col style={{ height: '45px', display: 'flex', alignItems: 'center' }}>
                            <Dropdown 

                                overlay={
                                    <Menu >
                                        <Menu.Item disabled style={{cursor:'default',backgroundColor:'white'}}>
                                            <div>
                                                <div style={{fontWeight:'bold'}}>{localStorage.getItem('username')}</div>
                                                <div style={{fontSize:'12px',color:'#666'}}>{localStorage.getItem('user_email')}</div>
                                            </div>
                                        </Menu.Item>
                                        <Menu.Divider/>
                                        <Menu.Item key="1" icon={<UserOutlined/>} >
                                            Mi Perfil
                                        </Menu.Item>
                                        <Menu.Item key="2" icon={<SettingOutlined/>}>
                                            Configuración de perfil
                                        </Menu.Item>
                                        <Menu.Divider/>
                                        <Menu.Item 
                                            key="3" 
                                            icon={<LogoutOutlined/>}
                                            style={{color:'#ff4d4f'}}
                                            onClick={logout}
                                        >
                                            Cerrar sesión
                                        </Menu.Item>
                                    </Menu>
                                } 
                                placement="bottomRight" 
                                trigger={['click']}
                            >
                                <Space style={{cursor:'pointer'}}>
                                    <Avatar size="small" icon={<UserOutlined/>}/>
                                    <DownOutlined/>
                                </Space>
                            </Dropdown>
                        </Col>
                    </Row>
                </Header>
                <Content style={{
                    backgroundColor: '#fff',
                    margin: '5px',
                    width: 'calc(100%-10px)',
                    height: 'calc(100vh - 60px)',
                    borderRadius: 10,
                    padding: '20px',
                    overflow: 'auto'
                }}>
                    {children || <Outlet />}
                </Content>
            </Layout>
            <Drawer
                style={{
                    width: 300
                }}
                styles={{
                    body: {
                        padding: 0,
                        margin: 0,
                        
                    }
                }}
                placement="left"
                onClose={() => setVisibleSidebar(false)}
                visible={visibleSidebar}
            >
                <Sidebar/>
            </Drawer>
        </Layout>

    );
};

export default CustomHeader;
