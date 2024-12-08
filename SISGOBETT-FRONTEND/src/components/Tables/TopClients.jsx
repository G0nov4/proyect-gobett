import React, { useMemo } from 'react';
import { Table, Avatar, Badge, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './TopClients.css';
const TopClients = ({ sales = [] }) => {
    const topClients = useMemo(() => {
        const clientSalesMap = sales.reduce((acc, { attributes }) => {
            // Verificar si existe client y sus datos
            const client = attributes?.client?.data;
            if (!client) return acc;

            const clientId = client.id;
            const { name, city = 'No especificado' } = client.attributes;

            // Calcular total de la venta
            const total = attributes.detail.reduce((sum, item) => {
                return sum + (item.unit_price * item.quantity_meterage);
            }, 0);

            // Aplicar descuento si hay promoción
            const discount = attributes.promo?.data?.attributes?.discount || 0;
            const finalTotal = total * (1 - discount / 100);

            // Actualizar o crear entrada del cliente
            if (acc[clientId]) {
                acc[clientId].totalPurchases += finalTotal;
                acc[clientId].purchaseCount += 1;
            } else {
                acc[clientId] = {
                    id: clientId,
                    name,
                    city,
                    totalPurchases: finalTotal,
                    purchaseCount: 1
                };
            }

            return acc;
        }, {});

        // Convertir a array y ordenar
        return Object.values(clientSalesMap)
            .sort((a, b) => b.totalPurchases - a.totalPurchases)
            .slice(0, 5)
            .map(client => ({
                ...client,
                totalPurchases: `Bs. ${client.totalPurchases.toLocaleString('es-BO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`
            }));
    }, [sales]);

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            width: 20,
            render: (_, __, index) => index + 1
        },
        {
            title: 'Cliente',
            dataIndex: 'name',
            key: 'name',
            render: (name) => (
                <div className="client-name">
                    <span>{name ? name.toUpperCase() : 'Cliente sin nombre'}</span>
                </div>
            )
        },
       
        {
            title: 'Valoración',
            dataIndex: 'totalPurchases',
            key: 'totalPurchases',
            render: (_, record) => {
                const stars = Math.min(5, Math.ceil(record.purchaseCount / 2));
                return '⭐'.repeat(stars);
            }
        },
        {
            title: 'N° Compras',
            dataIndex: 'purchaseCount',
            key: 'purchaseCount',
        }
    ];

    return (
        <div className="top-clients-card">
            <h2>Mejores Clientes</h2>
            <Table
                dataSource={topClients}
                columns={columns}
                pagination={false}
                rowKey="id"
                size='small'
                scroll={{ y: 50*3 }}
                style={{ maxHeight: '300px' }}
            />
        </div>
    );
};

export default TopClients;