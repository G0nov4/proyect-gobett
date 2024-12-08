import {  Menu } from 'antd'
import React, { useState } from 'react'
import { menuData }  from '../../container/Sidebar/sidebarData';
import { NavLink } from 'react-router-dom';

const { SubMenu } = Menu


function MenuList() {
    const [contentIndex, setContentIndex] = useState(0);
    const [selectedKey, setSelectedKey] = useState("0");
    const changeSelectedKey = (event) => {
        const key = event.key;
        setSelectedKey(key);
        setContentIndex(+key);
    };

    const renderMenuItems = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <SubMenu key={item.key} title={item.title} icon={item.icon}>
                        {renderMenuItems(item.children)}
                    </SubMenu>
                );
            } else {
                return (
                    <Menu.Item key={item.key} icon={item.icon} onClick={changeSelectedKey}>
                          <NavLink to={item.path}>{item.title}</NavLink>
                    </Menu.Item>
                );
            }
        });
    };

    return (
        <Menu mode="inline" className='menu-bar' selectedKeys={[selectedKey]} >
          
            {renderMenuItems(menuData)}
    
        </Menu>
    )
}

export default MenuList