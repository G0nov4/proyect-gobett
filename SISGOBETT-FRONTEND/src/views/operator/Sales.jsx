import { Button, Col, Divider, Flex, Form, Radio, Row, Space, Modal, Table, InputNumber, message } from 'antd';
import React, { useState, useMemo } from 'react';
import Categories from '../../components/operator/Categories';
import FabricList from '../../components/operator/FabricList';
import SearchClient from '../../components/operator/SearchClient';
import DetailOrderList from '../../components/operator/DetailOrderList';
import DetailAddress from '../../components/operator/DetailAddress';
import SummaryOfSales from '../../components/operator/SummaryOfSales';
import { CalendarOutlined, CloseCircleOutlined, HistoryOutlined, RightCircleFilled, UserOutlined } from '@ant-design/icons';
import TransactionType from '../../components/operator/TransactionType';
import { useCreateSale } from '../../services/Sales';
import './Sales.css';
import dayjs from 'dayjs';
import { TbReportAnalytics } from 'react-icons/tb';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { generateSaleTicket } from '../../utils/admin/SaleTicket';
import { PrinterOutlined, FileTextOutlined } from '@ant-design/icons';

// Función responsable de actualizar la lista de órdenes
const updateOrderList = (orderList, fabric, item, isRoll = false, isRemoving = false) => {
    if (isRoll) {
        // Manejo de rollos
        if (isRemoving) {
            return orderList.filter(order => order.key !== `roll-${item.id}`);
        }

        // Verificar si el rollo ya existe
        const existingRoll = orderList.find(order => order.key === `roll-${item.id}`);
        if (existingRoll) {
            return orderList;
        }

        // Añadir nuevo rollo
        return [
            ...orderList,
            {
                key: `roll-${item.id}`,
                quantity: item.attributes.roll_footage,
                description: fabric.name,
                fabricId: fabric.id,
                color: item.attributes.color.data.attributes.color,
                colorId: item.attributes.color.data.id,
                unitPrice: fabric.wholesale_price,
                totalPrice: fabric.wholesale_price * item.attributes.roll_footage,
                isRoll: true,
                rollCode: item.attributes.code,
                saleType: 'POR ROLLO',
                cuts: 1,
                rollId: item.id
            }
        ];
    } else {
        // Manejo de metros
        const existingMeterItem = orderList.find(
            (orderItem) =>
                orderItem.description === fabric.name &&
                orderItem.colorId === item.id &&
                !orderItem.isRoll
        );

        if (existingMeterItem) {
            return orderList.map((orderItem) =>
                orderItem.key === existingMeterItem.key
                    ? {
                        ...orderItem,
                        quantity: orderItem.quantity + 1,
                        totalPrice: (orderItem.quantity + 1) * orderItem.unitPrice,
                    }
                    : orderItem
            );
        }

        return [
            ...orderList,
            {
                key: `meter-${fabric.name}-${item.id}`,
                quantity: 1,
                description: fabric.name,
                fabricId: fabric.id,
                color: item.color,
                colorId: item.id,
                unitPrice: fabric.wholesale_price,
                totalPrice: fabric.wholesale_price,
                isRoll: false,
                saleType: 'POR METRO',
                cuts: 1
            }
        ];
    }
};

// Nuevo componente para el resumen de venta
const SaleSuccessModal = ({ ticketData, visible, onClose }) => {
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    return (
        <Modal
            title={`Venta #${ticketData.id} realizada exitosamente`}
            open={visible}
            onOk={onClose}
            onCancel={onClose}
            width="60%"
            centered
        >
            <div>
                {showPdfPreview && (
                    <PDFViewer style={{ width: '100%', height: '60vh', marginTop: '15px', marginBottom: '15px' }}>
                        {generateSaleTicket(ticketData, 'thermal')}
                    </PDFViewer>
                )}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                    <Button
                        type="primary"
                        danger
                        icon={<PrinterOutlined />}
                        onClick={() => setShowPdfPreview(!showPdfPreview)}
                    >
                        {showPdfPreview ? 'Ocultar Boleta' : 'Ver Boleta'}
                    </Button>
                    <PDFDownloadLink
                        document={generateSaleTicket(ticketData, 'thermal')}
                        fileName={`boleta-${ticketData.id}.pdf`}
                    >
                        {({ loading }) => (
                            <Button
                                type="primary" 
                                danger
                                icon={<FileTextOutlined />}
                                loading={loading}
                            >
                                Descargar Boleta
                            </Button>
                        )}
                    </PDFDownloadLink>
                </div>
            </div>
        </Modal>
    );
};

const Sales = () => {
    const [orderList, setOrderList] = useState([]);
    const [isSecondPartSelect, setIsSecondPartSelected] = useState(false);
    const [clientSelected, setClientSelected] = useState(null)
    const [descuento, setDescuento] = useState(0);
    const [transactionType, setTransactionType] = useState('VENTA');
    const [deliveryOption, setDeliveryOption] = useState('EN TIENDA');
    const [address, setAddress] = useState('');
    const createSaleMutation = useCreateSale();
    const [deliveryDate, setDeliveryDate] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [currentTicketData, setCurrentTicketData] = useState(null);

    const clientAddress = clientSelected?.address || '';

    const handleAddToOrderList = (fabric, item, isRoll = false, isRemoving = false) => {
        setOrderList(updateOrderList(orderList, fabric, item, isRoll, isRemoving));
    };

    const resetValues = () => {
        setOrderList([]);
        setIsSecondPartSelected(false);
        setClientSelected(null);
        setDescuento(0);
        setTransactionType('VENTA');
        setDeliveryOption('EN TIENDA');
        setAddress('');
        setDeliveryDate(null);
        setPaymentAmount(0);
        setShowSummaryModal(false);
    };

    const onFinish = async () => {
        try {
            // Validaciones iniciales
            if (!orderList || orderList.length === 0) {
                Modal.error({
                    title: 'Error',
                    content: 'Debe agregar al menos un item al pedido'
                });
                return;
            }

            // Validar monto de pago
            if (!paymentAmount || paymentAmount <= 0) {
                Modal.error({
                    title: 'Error',
                    content: 'Debe ingresar un monto de pago válido'
                });
                return;
            }

            const payment = {
                amount: paymentAmount,
                change: Math.max(0, calculateChange()),
                payment_date: dayjs().format('YYYY-MM-DD HH:mm:ss')
            };

            const newOrder = {
                delivery: deliveryOption || 'EN TIENDA',
                status: transactionType === 'VENTA' ? 'COMPLETADO' : 'PENDIENTE',
                client_id: clientSelected?.value || null,
                sales_box: 1,
                detail: orderList || [],
                total_sale: total || 0,
                address: address || '',
                promo: descuento || 0,
                sales_type: transactionType || 'VENTA',
                delivery_date: deliveryDate || null,
                payment: payment,
                branch: localStorage.getItem('selected_branch')
            }

            await createSaleMutation.mutateAsync(newOrder)
            .then((response) => {
                console.log(response, orderList)
                const ticketData = {
                    id: response.data.id,
                    attributes: {
                        createdAt: response.data.createdAt,
                        status: response.data.status,
                        delivery: response.data.delivery,
                        delivery_date: response.data.delivery_date,
                        address: response.data.address,
                        sales_type: response.data.sales_type,
                        detail: orderList.map(item => ({
                            id: item.rollId || `${item.fabricId}-${item.colorId}`,
                            unit_price: item.unitPrice,
                            quantity_meterage: item.quantity,
                            sales_unit: item.isRoll ? 'POR ROLLO' : 'POR METRO',
                            roll_code: item.rollCode || '',
                            cuts: item.cuts,
                            color: {
                                data: {
                                    id: item.colorId,
                                    attributes: {
                                        color: item.color,
                                        name: item.color,
                                        code: item.colorId
                                    }
                                }
                            },
                            fabric: {
                                data: {
                                    id: item.fabricId,
                                    attributes: {
                                        name: item.description,
                                        code: item.rollCode ? item.rollCode.split('-')[0] : '',
                                        height: 0, // Si tienes acceso a estos datos, agrégalos
                                        retail_price: item.unitPrice
                                    }
                                }
                            }
                        })),
                        client: {
                            data: {
                                id: clientSelected?.value || 0,
                                attributes: {
                                    name: clientSelected?.label || 'Cliente General',
                                    phone_1: clientSelected?.phone || '-'
                                }
                            }
                        },
                        payments: {
                            data: [{
                                attributes: {
                                    createdAt: new Date().toISOString(),
                                    amount: paymentAmount,
                                }
                            }]
                        }
                    }
                };

                setCurrentTicketData(ticketData);
                setSuccessModalVisible(true);
                setShowSummaryModal(false);
            })
            .catch((error) => {
                let errorMessage = 'Error desconocido al realizar la venta';
                
                if (error.response?.data?.error?.message) {
                    errorMessage = error.response.data.error.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                Modal.error({
                    title: 'Error al realizar la venta',
                    content: errorMessage,
                    centered: true
                });
            });
        } catch (error) {
            console.error('Error completo:', error);
            
            // Manejar diferentes tipos de errores
            let errorMessage = 'Error desconocido al realizar la venta';
            
            if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Modal.error({
                title: 'Error al realizar la venta',
                content: errorMessage,
                centered: true
            });
        }
    };

    const subtotal = useMemo(() => {
        return orderList.reduce((acc, item) => acc + item.totalPrice, 0);
    }, [orderList]);


    const total = useMemo(() => {
        return subtotal - descuento;
    }, [subtotal, descuento]);

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const handleShowSummary = () => {
        setShowSummaryModal(true);
    };

    const handleConfirmSale = () => {
        setShowSummaryModal(false);
        onFinish();
    };

    const calculateChange = () => {
        return paymentAmount - total;
    };

    const handleSuccessModalClose = () => {
        setSuccessModalVisible(false);
        resetValues();
    };

    return (
        <>
            <div style={{ 
                margin: 5, 
                padding: 10, 
                borderRadius: 10, 
                height: 'calc(100vh - 100px)',
                backgroundColor: 'white'
            }}>
                <Row gutter={[8]} style={{ height: '100%' }}>
                    <Col lg={17} xs={24}>
                        <Categories onCategorySelect={handleCategorySelect} />
                        <Divider style={{ marginBottom: 10, marginTop: 5 }} />
                        <FabricList
                            addToOrderList={handleAddToOrderList}
                            selectedCategory={selectedCategory}
                        />
                    </Col>

                    <Col lg={7} xs={24}>

                        {!isSecondPartSelect ? (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                                <div style={{ flexGrow: 1 }}>
                                    <TransactionType
                                        transactionType={transactionType}
                                        setTransactionType={setTransactionType}
                                    />

                                    <Divider style={{ margin: '5px 0px' }} />
                                    <DetailOrderList
                                        orderList={orderList}
                                        setOrderList={setOrderList}
                                    />
                                </div>

                                {/* Esta parte actúa como un "footer" fijo */}
                                <div style={{ marginTop: 'auto' }}>

                                    <Button danger type="primary" style={{ width: '100%' }} icon={<RightCircleFilled />} iconPosition='right' onClick={() => setIsSecondPartSelected(true)}>
                                        PROCESAR VENTA
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <SearchClient
                                    clientData={clientSelected}
                                    setClientSelected={setClientSelected}
                                    setIsSecondPartSelected={setIsSecondPartSelected}
                                />
                                <DetailAddress
                                    deliveryOption={deliveryOption}
                                    setDeliveryOption={setDeliveryOption}
                                    address={address}
                                    setAddress={setAddress}
                                    clientAddress={clientAddress}
                                        deliveryDate={deliveryDate}
                                        setDeliveryDate={setDeliveryDate}
                                />

                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flexGrow: 1 }}>

                                    </div>

                                    <div style={{ marginTop: 'auto' }}>
                                        <SummaryOfSales
                                            subtotal={subtotal}
                                            setDiscount={setDescuento}
                                        />
                                        <Button
                                            danger
                                            type="primary"
                                            style={{ width: '100%' }}
                                            onClick={handleShowSummary}
                                            loading={createSaleMutation.isLoading}
                                        >
                                            TERMINAR VENTA
                                        </Button>
                                        
                                    </div>
                                </div>

                            </div>

                        )}
                    </Col>
                </Row>

                <Modal
                    title={`${transactionType} - Resumen de transacción`}
                    open={showSummaryModal}
                    footer={null}
                    onCancel={() => setShowSummaryModal(false)}
                    width={800}
                    style={{ maxHeight: '80vh', overflowY: 'scroll' }}
                 
                >
                    <Row gutter={[16, 16]}>
                        {/* Lista de productos - Lado izquierdo */}
                        <Col span={14} xs={0} sm={0} md={14}>
                            <div className="order-list-container">
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ border: '1px solid #d9d9d9', padding: '12px', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <UserOutlined />
                                                {clientSelected?.label || 'Cliente General'}
                                            </h3>
                                            <div style={{ fontSize: '13px', color: '#666' }}>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <strong>Dirección:</strong> {address || clientAddress || deliveryOption}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <CalendarOutlined />
                                                    <strong>Fecha de entrega:</strong> {deliveryDate ? new Date(deliveryDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DetailOrderList
                                    orderList={orderList}
                                    setOrderList={setOrderList}
                                />
                            </div>
                        </Col>

                        {/* Detalles de la venta - Lado derecho */}
                        <Col span={10} xs={24} sm={24} md={10}>
                         
                          

                            <Divider style={{ margin: '12px 0' }}><strong>Ingrese monto de pago</strong></Divider>
                            <InputNumber
                                style={{ 
                                    width: '100%', 
                                    height: '40px', 
                                    marginBottom: '12px',
                                    textAlign: 'center',
                                    border: 'none',
                                }}
                                size="large"
                                value={paymentAmount}
                                onChange={(value) => setPaymentAmount(value || 0)}
                                precision={2}
                                min={0}
                                placeholder="0.00"
                                prefix={<span >Bs.</span>}
                                autoFocus
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px', width: '100%' }}>
                                {[10, 20, 50, 100, 200].map(amount => (
                                    <Button
                                        key={amount}
                                        size="small"
                                        onClick={() => setPaymentAmount(amount)}
                                        style={{ width: '100%' }}
                                    >
                                        ${amount}
                                    </Button>
                                ))}
                            </div>
                                <div className="total-row total-final">
                                    <span>Total:</span>
                                    <span>Bs. {total.toFixed(2)}</span>
                                </div>
                            <div className="payment-section">
                                <div className="total-row">
                                    <span>Monto Recibido:</span>
                                    <span>${paymentAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                                {paymentAmount > 0 && (
                                    <div className="total-row">
                                        <span>Cambio:</span>
                                        <span className={calculateChange() >= 0 ? 'change-amount' : 'insufficient-amount'}>
                                            ${Math.abs(calculateChange()).toFixed(2)}
                                            {calculateChange() < 0 ? ' (Falta)' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {calculateChange() < 0 ? (
                                <Button 
                                    type="primary"
                                    icon={<TbReportAnalytics />}
                                    onClick={() => {
                                        Modal.confirm({
                                            title: 'Crear historial de pagos',
                                            content: '¿Desea crear un historial de pagos para esta venta? El cliente podrá pagar el monto restante en cuotas posteriores.',
                                            okText: 'Sí, crear',
                                            cancelText: 'No',
                                            centered: true,
                                            onOk() {
                                                onFinish()
                                                   
                                            }
                                        });
                                    }}
                                    style={{ width: '100%', marginTop: '16px' }}
                                >
                                    Crear historial de pagos
                                </Button>
                            ) : (
                                <Button 
                                    type="primary"
                                    danger
                                        icon={<CloseCircleOutlined />}
                                    style={{ width: '100%', marginTop: '16px' }}
                                    onClick={() => {
                                        onFinish()
                                            .then(() => {
                                                message.success('Historial de pagos creado exitosamente');
                                            })
                                            .catch(() => {
                                                message.error('Error al crear el historial de pagos');
                                            });
                                    }}
                                >
                                    Cerrar Venta
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Modal>
            </div>

            {currentTicketData && (
                <SaleSuccessModal
                    ticketData={currentTicketData}
                    visible={successModalVisible}
                    onClose={handleSuccessModalClose}
                />
            )}
        </>
    );
};

export default Sales;
