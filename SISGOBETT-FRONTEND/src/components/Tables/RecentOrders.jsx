import React, { useMemo } from 'react';
import { Table, Typography, Button, Tag } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const RecentOrders = ({ sales = [] }) => {
    const recentOrders = useMemo(() => {
        return sales
            .filter(sale => sale.attributes.sales_type === 'PEDIDO')
            .map(({ id, attributes }) => {
                const total = attributes.detail.reduce((sum, item) =>
                    sum + (item.unit_price * item.quantity_meterage), 0);

                return {
                    key: id,
                    id,
                    client: {
                        name: attributes.client?.data?.attributes?.name || 'Cliente sin nombre',
                        phone: attributes.client?.data?.attributes?.phone_1
                    },
                    date: attributes.createdAt,
                    amount: total,
                    status: attributes.status
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }, [sales]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
        },
        {
            title: 'Cliente',
            dataIndex: 'client',
            render: (client) => (
                <div>
                    <Text strong>{client.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{client.phone}</Text>
                </div>
            ),
        },
        {
            title: 'Fecha',
            dataIndex: 'date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Monto',
            dataIndex: 'amount',
            render: (amount) => (
                <Text strong>
                    Bs. {amount.toLocaleString('es-BO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </Text>
            ),
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            render: (status) => (
                <Tag color={status ? 'success' : 'warning'}>
                    {status ? 'Completado' : 'Pendiente'}
                </Tag>
            ),
        },
        {
            title: 'Acción',
            key: 'action',
            width: 80,
            render: () => (
                <Button
                    icon={<PrinterOutlined />}
                    size="small"
                    onClick={() => console.log('Imprimir')}
                />
            ),
        },
    ];

    return (
        <div className="recent-orders-card" style={{ border: '1px solid #e8e8e8' }}>
            <h2>Últimos Pedidos</h2>
            <Table
                dataSource={recentOrders}
                columns={columns}
                pagination={false}
                size="small"
            />
        </div>
    );
};

export default RecentOrders;