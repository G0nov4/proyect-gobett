import React, { useMemo, useState } from 'react';
import { Table, Typography, Button, Tag, Modal, Radio, Space } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, DollarOutlined, PrinterOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { generateSaleTicket } from '../../utils/admin/SaleTicket';
import { PDFViewer } from '@react-pdf/renderer';

const { Text } = Typography;

const RecentSales = ({ sales = [] }) => {
    const [showTicket, setShowTicket] = useState(false);
    const [ticketFormat, setTicketFormat] = useState('thermal');
    const [selectedSale, setSelectedSale] = useState(null);

    const recentSales = useMemo(() => {
        return sales
            .filter(sale => sale.attributes.sales_type === 'VENTA')
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
                    status: attributes.status,
                    fullData: {
                        id,
                        attributes: {
                            createdAt: attributes.createdAt,
                            client: attributes.client,
                            detail: attributes.detail,
                            delivery: attributes.delivery || 'Inmediata',
                            delivery_date: attributes.delivery_date,
                            address: attributes.address,
                            payments: attributes.payments || { data: [] }
                        }
                    }
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }, [sales]);

    const handlePrintTicket = (record) => {
        setSelectedSale(record.fullData);
        Modal.confirm({
            title: 'Seleccione el formato de impresión',
            icon: <PrinterOutlined />,
            content: (
                <Radio.Group defaultValue="thermal" onChange={e => setTicketFormat(e.target.value)}>
                    <Space direction="vertical">
                        <Radio value="thermal">Papel Térmico (80mm)</Radio>
                        <Radio value="letter">Tamaño Carta</Radio>
                    </Space>
                </Radio.Group>
            ),
            onOk() {
                setShowTicket(true);
            }
        });
    };

    const columns = [
        {
            title: <>#</>,
            dataIndex: 'id', 
            width: 20,
        },
        {
            title: <><UserOutlined /> Cliente</>,
            dataIndex: 'client',
            render: (client) => (
                <div>
                    <Text strong style={{ fontSize: '13px' }}>{client.name ? client.name.toUpperCase() : 'S/N'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>{client.phone}</Text>
                </div>
            ),
        },
        {
            title: <><CalendarOutlined /> Fecha</>,
            dataIndex: 'date',
            render: (date) => {
                const today = dayjs();
                const dateObj = dayjs(date);
                const diffDays = today.diff(dateObj, 'day');

                if (diffDays === 0) return <span style={{ fontSize: '13px' }}>Hoy</span>;
                if (diffDays === 1) return <span style={{ fontSize: '13px' }}>Ayer</span>;
                return <span style={{ fontSize: '13px' }}>{dateObj.format('DD/MM')}</span>;
            },
        },
        {
            title: <><DollarOutlined /> Monto</>,
            dataIndex: 'amount',
            render: (amount) => (
                <Text strong style={{ fontSize: '13px' }}>
                    Bs. {amount.toLocaleString('es-BO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </Text>
            ),
        },
        {
            title: <><CheckCircleOutlined /> Estado</>,
            dataIndex: 'status',
            render: (status) => (
                <Tag 
                    color={status ? 'success' : 'warning'} 
                    style={{ 
                        fontSize: '10px',
                        borderRadius: '12px',
                        border: `1px solid ${status ? '#52c41a' : '#faad14'}`
                    }}
                >
                    {status ? 'Completado' : 'Pendiente'}
                </Tag>
            ),
        },
        {
            title: 'Acción',
            key: 'action', 
            width: 50,
            render: (_, record) => (
                <>
                    <Button
                        icon={<PrinterOutlined />}
                        size="small"
                        onClick={() => handlePrintTicket(record)}
                    />
                    {showTicket && selectedSale && (
                        <Modal
                            title="Generar Boleta"
                            open={showTicket}
                            onCancel={() => setShowTicket(false)}
                            width={800}
                            centered
                            footer={[
                                <Radio.Group
                                    key="format"
                                    value={ticketFormat}
                                    onChange={e => setTicketFormat(e.target.value)}
                                >
                                    <Radio.Button value="thermal">Papel Térmico</Radio.Button>
                                    <Radio.Button value="letter">Carta</Radio.Button>
                                </Radio.Group>,
                                <Button key="close" onClick={() => setShowTicket(false)}>
                                    Cerrar
                                </Button>
                            ]}
                        >
                            <PDFViewer style={{ width: '100%', height: '500px' }}>
                                {generateSaleTicket(selectedSale, ticketFormat)}
                            </PDFViewer>
                        </Modal>
                    )}
                </>
            ),
        },
    ];

    return (
        <div className="recent-sales-card" style={{ border: '1px solid #e8e8e8' }}>
            <h2>Últimas Ventas</h2>
            <Table
                dataSource={recentSales}
                columns={columns}
                pagination={false}
                size="small"
                className="recent-sales-table"
            />
        </div>
    );
};

export default RecentSales;