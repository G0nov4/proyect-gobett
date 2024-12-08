import React, { useState } from 'react';
import { Modal, Descriptions, Table, Button, Space, Tag, Divider, Row, Col, Popconfirm, message, Card, Progress, Tooltip, Radio } from 'antd';
import { 
    PrinterOutlined, 
    FileTextOutlined, 
    UserOutlined,
    CalendarOutlined,
    HomeOutlined,
    TagOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { generateSaleReport } from '../../utils/admin/SaleReport';
import { PDFViewer } from '@react-pdf/renderer';
import { generateSaleTicket } from '../../utils/admin/SaleTicket';

const SaleDetailModal = ({ 
    visible, 
    sale, 
    onClose,
    onCompleteSale,
    onCancelSale,
    onAddPayment
}) => {

    const [showReport, setShowReport] = useState(false);
    const [showTicket, setShowTicket] = useState(false);
    const [ticketFormat, setTicketFormat] = useState('thermal');

    const calculateTotal = (details) => {
        return details?.reduce((sum, item) => 
            sum + (item.quantity_meterage * item.unit_price), 0
        ) || 0;
    };

    if (!sale) return null;

    const payments = sale.attributes.payments?.data || [];
    const totalVenta = calculateTotal(sale.attributes.detail);
    const totalPagado = payments.reduce((sum, payment) => 
        sum + (payment.attributes?.amount || 0), 0);
    const saldoPendiente = totalVenta - totalPagado;
    const porcentajePagado = (totalPagado / totalVenta) * 100;

    const handleCompleteSale = async () => {
        try {
            if (saldoPendiente > 0) {
                message.error('No se puede completar la venta. Hay pagos pendientes.');
                return;
            }

            await onCompleteSale(sale.id);
            message.success('Pedido completado exitosamente');
        } catch (error) {
            message.error('Error al completar el pedido');
        }
    };

    const handleCancelSale = async () => {
        try {
            await onCancelSale(sale.id);
            message.success('Pedido cancelado exitosamente');
        } catch (error) {
            message.error('Error al cancelar el pedido');
        }
    };

    const handlePrintTicket = () => {
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

    return (
        <Modal
            centered
            title={
                <Row justify="space-between" align="middle">
                    <Col xs={24} sm={12}>
                        <Space wrap>
                            <TagOutlined />
                            {`Venta #${sale.id}`}
                            <Tag color={
                                sale.attributes.status === 'COMPLETADO' ? 'success' :
                                sale.attributes.status === 'CANCELADO' ? 'error' : 
                                'processing'
                            }>
                                {sale.attributes.status}
                            </Tag>
                        </Space>
                    </Col>
                   
                    <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                        <Space wrap>
                            <Button 
                                icon={<PrinterOutlined />} 
                                type="primary"
                                onClick={handlePrintTicket}
                            >
                                Boleta
                            </Button>
                            <Button 
                                icon={<FileTextOutlined />}
                                onClick={() => setShowReport(true)}
                            >
                                Reporte
                            </Button>
                        </Space>
                    </Col>
                </Row>
            }
            visible={visible}
            onCancel={onClose}
            width={800}
            footer={
                <Row justify="space-between">
                    <Col>
                        <Space>
                            {!sale.attributes.status && (
                                <Tooltip 
                                    title={saldoPendiente > 0 ? 
                                        "No se puede completar la venta hasta que esté totalmente pagada" : 
                                        "Completar venta"}
                                >
                                    <Popconfirm
                                        title="¿Estás seguro de completar este pedido?"
                                        description="Esta acción no se puede deshacer"
                                        icon={<ExclamationCircleOutlined style={{ color: '#52c41a' }} />}
                                        onConfirm={handleCompleteSale}
                                        disabled={saldoPendiente > 0}
                                    >
                                        <Button 
                                            type="primary" 
                                            icon={<CheckCircleOutlined />}
                                            style={{ backgroundColor: '#52c41a' }}
                                            disabled={saldoPendiente > 0}
                                        >
                                            Completar Pedido
                                        </Button>
                                    </Popconfirm>
                                </Tooltip>
                            )}
                            
                            <Popconfirm
                                title="¿Estás seguro de cancelar esta venta?"
                                description={
                                    sale.attributes.status ? 
                                    "Esta venta ya está completada. ¿Estás seguro de cancelarla?" : 
                                    "Esta acción no se puede deshacer"
                                }
                                icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                                onConfirm={handleCancelSale}
                            >
                                <Button 
                                    danger 
                                    icon={<CloseCircleOutlined />}
                                >
                                    Cancelar Venta
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Col>
                    <Col>
                        <Button onClick={onClose}>
                            Cerrar
                        </Button>
                    </Col>
                </Row>
            }
        >
            <Row gutter={[16, 16]}>
                {/* Lista de Productos */}
                <Col xs={24} md={16}>
                    <Card title="Productos" size="small">
                        <Table
                            dataSource={sale.attributes.detail}
                            pagination={false}
                            size="small"
                            scroll={{ x: 'max-content' }}
                            columns={[
                                {
                                    title: 'Tela',
                                    dataIndex: ['fabric', 'data', 'attributes', 'name'],
                                    width: '30%',
                                    render: (text, record) => (
                                        <Space>
                                            <div style={{
                                                width: 20,
                                                height: 20,
                                                backgroundColor: record?.color?.data?.attributes?.color,
                                                borderRadius: '4px'
                                            }}/>
                                            {text}
                                        </Space>
                                    )
                                },
                                {
                                    title: 'Tipo',
                                    dataIndex: 'roll_code',
                                    width: '20%',
                                    render: (text) => text ? 'Rollo' : 'Metro'
                                },
                                {
                                    title: 'Cantidad',
                                    dataIndex: 'quantity_meterage',
                                    width: '15%',
                                    render: (text) => `${text} mts`
                                },
                                {
                                    title: 'Precio',
                                    dataIndex: 'unit_price',
                                    width: '15%',
                                    render: (price) => `Bs. ${price.toFixed(2)}`
                                },
                                {
                                    title: 'Total',
                                    width: '20%',
                                    render: (_, record) => 
                                        `Bs. ${(record.quantity_meterage * record.unit_price).toFixed(2)}`
                                }
                            ]}
                        />
                    </Card>
                </Col>

                {/* Panel Lateral */}
                <Col xs={24} md={8}>
                    {/* Información del Cliente */}
                    <Card title="Información del Cliente" size="small" style={{ marginBottom: 16 }}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label={<><UserOutlined /> Cliente</>}>
                                {`${sale.attributes?.client?.data?.attributes?.name || 'Cliente Natural'} ${sale.attributes?.client?.data?.attributes?.last_name || ''}`}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><CalendarOutlined /> Fecha</>}>
                                {new Date(sale.attributes.createdAt).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><HomeOutlined /> Entrega</>}>
                                <Tag color={sale.attributes.delivery === 'EN TIENDA' ? 'green' : 'blue'}>
                                    {sale.attributes.delivery}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Resumen de Pagos */}
                    <Card title="Resumen de Pagos" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Progress 
                                percent={Math.round(porcentajePagado)} 
                                status={porcentajePagado === 100 ? "success" : "active"}
                                size="small"
                            />
                            <Row justify="space-between">
                                <Col>Total:</Col>
                                <Col><strong>Bs. {totalVenta.toFixed(2)}</strong></Col>
                            </Row>
                            <Row justify="space-between">
                                <Col>Pagado:</Col>
                                <Col><strong>Bs. {totalPagado.toFixed(2)}</strong></Col>
                            </Row>
                            <Row justify="space-between">
                                <Col>Pendiente:</Col>
                                <Col>
                                    <strong style={{ color: saldoPendiente > 0 ? '#ff4d4f' : '#52c41a' }}>
                                        Bs. {saldoPendiente.toFixed(2)}
                                    </strong>
                                </Col>
                            </Row>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                disabled={saldoPendiente <= 0}
                                block
                                onClick={() => onAddPayment(sale.id)}
                            >
                                Registrar Pago
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {sale.attributes.promo?.data && (
                <div style={{ marginTop: '16px' }}>
                    <Tag color="volcano">
                        Promoción: {sale.attributes.promo.data.attributes.promotion_name} 
                        ({sale.attributes.promo.data.attributes.discount}
                        {sale.attributes.promo.data.attributes.promotion_type === 'PORCENTAJE' ? '%' : ' Bs.'} descuento)
                    </Tag>
                </div>
            )}

            <Modal
                title="Reporte de Venta"
                open={showReport}
                onCancel={() => setShowReport(false)}
                width={800}
                centered
                footer={null}
            >
                <PDFViewer style={{ width: '100%', height: '500px' }}>
                    {generateSaleReport(sale)}
                </PDFViewer>
            </Modal>

            {/* Modal de la Boleta */}
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
                    {generateSaleTicket(sale, ticketFormat)}
                </PDFViewer>
            </Modal>
        </Modal>
    );
};

export default SaleDetailModal; 