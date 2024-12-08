// ClientDetailsDrawer.js
import React from 'react';
import { Drawer, Tabs, Tag, Space,  Badge } from 'antd';
import { ShoppingCartOutlined, UserOutlined, ShoppingOutlined, PhoneOutlined, HomeOutlined, GlobalOutlined, CarOutlined, ShopOutlined } from '@ant-design/icons';

import { useSales } from '../../services/Sales';
import { Avatar, Card, Timeline } from 'antd';

const { TabPane } = Tabs

const ClientDetailsDrawer = ({ client, onClose, visible }) => {
    const { data: salesByClient, isLoading } = useSales(null,null,
        visible && client?.id ? {
            filters: {
                client: {
                    id: {
                        $eq: client.id
                    }
                }
            }
        } : null
    );

    
    // Juntar todas las compras (ventas y pedidos)
    const compras = salesByClient?.data || [];
    const totalCompras = compras.length;

    return (
        <Drawer
            title={
                <Space align="center" size="middle">
                    <Avatar size={64} icon={<UserOutlined />} />
                    <div>
                        <h2 style={{ margin: 0 }}>{`${client?.attributes?.name} ${client?.attributes?.last_name || ''}`}</h2>
                        <Tag color={
                            client?.attributes?.kind_of_client === 'MAYORISTA' ? '#108ee9' :
                            client?.attributes?.kind_of_client === 'MINORISTA' ? 'green' : 'volcano'
                        }>
                            {client?.attributes?.kind_of_client}
                        </Tag>
                    </div>
                </Space>
            }
            placement="right"
            width={600}
            onClose={onClose}
            open={visible}
        >
            {client && (
                <>
                    <Card size="small">
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                                <PhoneOutlined style={{ fontSize: '12px' }} />
                                <span style={{ fontSize: '12px' }}>
                                    (+591) {client.attributes.phone_1}
                                    {client.attributes.phone_2 && `, (+591) ${client.attributes.phone_2}`}
                                </span>
                            </Space>
                            <Space>
                                <HomeOutlined style={{ fontSize: '12px' }} />
                                <span style={{ fontSize: '12px' }}>{client.attributes.direction}</span>
                            </Space>
                            <Space>
                                <GlobalOutlined style={{ fontSize: '12px' }} />
                                <span style={{ fontSize: '12px' }}>{client.attributes.city}</span>
                            </Space>
                        </Space>
                    </Card>

                    <Tabs defaultActiveKey="1" style={{ marginTop: 8 }} size='small'>
                        <TabPane
                            tab={
                                <Space size="small">
                                    <ShoppingOutlined />
                                    Compras <Badge count={totalCompras} size="small" />
                                </Space>
                            }
                            key="1"
                        >
                            <Timeline>
                                {compras.map(compra => (
                                    <Timeline.Item key={compra.id}>
                                        <Card size="small" bodyStyle={{ padding: '8px' }}>
                                            <Space direction="vertical" size={0} style={{ width: '100%' }}>
                                                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                                    <Space>
                                                        <Tag color={compra.attributes.sales_type === 'VENTA' ? 'green' : 'blue'} style={{ margin: 0 }}>
                                                            {compra.attributes.sales_type}
                                                        </Tag>
                                                        {compra.attributes.delivery === 'DOMICILIO' ? (
                                                            <Tag icon={<CarOutlined />} color="orange">Domicilio</Tag>
                                                        ) : (
                                                            <Tag icon={<ShopOutlined />} color="cyan">Tienda</Tag>
                                                        )}
                                                    </Space>
                                                    <span style={{ fontSize: '12px', color: '#888' }}>
                                                        {new Date(compra.attributes.createdAt).toLocaleDateString()}
                                                    </span>
                                                </Space>
                                                
                                                {/* Lista de productos */}
                                                <div style={{ fontSize: '12px', marginTop: 4 }}>
                                                    {compra.attributes.detail.map((item, index) => (
                                                        <div key={index} style={{ marginBottom: 2 }}>
                                                            • {item.fabric?.data?.attributes?.name} ({item.quantity_meterage} {item.sales_unit === 'POR METRO' ? 'mts' : 'Kgs.'})
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                               
                                            </Space>
                                        </Card>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </TabPane>
                    
                    </Tabs>
                </>
            )}
        </Drawer>
    );
};

export default ClientDetailsDrawer;
