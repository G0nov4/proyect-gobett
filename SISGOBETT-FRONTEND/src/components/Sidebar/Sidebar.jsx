import { Button, Divider, Image, Layout } from 'antd'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/Logo Gobett.png'
import MenuList from './MenuList'
import './Sidebar.css'
import { LogoutOutlined } from '@ant-design/icons'
import { AuthContext } from '../../context/AuthContext'



const { Sider } = Layout


const Sidebar = ({ breakpoint }) => {
    const { logout } = useContext(AuthContext)
    return (
        <Sider
            className='sidebar'
            theme='light'
            collapsedWidth={0}
            breakpoint={breakpoint}
        >
            <div className='logo'>
                <div className='logo-icon'>
                    <Link>
                        <Image preview={false} src={logo}></Image>
                    </Link>
                </div>
            </div>
            <Divider style={{ margin: 0 }} />
            <MenuList />
            <Divider style={{ margin: 0 }} />
            <div style={{
                padding: 10
            }}>
                <Button type="text" block danger icon={<LogoutOutlined />} onClick={logout}>
                    Cerrar sesión
                </Button>
            </div>
        </Sider>
    )
}

export default Sidebar