import { Button, Divider, Flex, Modal, Radio, Space, Spin } from 'antd'
import React, { useState, useEffect } from 'react'
import './SummaryOfSales.css';
import { MdDiscount } from 'react-icons/md';
import { CloseOutlined } from '@ant-design/icons';
import { usePromos } from '../../services/Promotions';

function SummaryOfSales({ subtotal = 0, setDiscount }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {data: promos, isLoading, isFetching} = usePromos()
    const [discountSelected, setDiscountSelected] = useState(null)
    const [descuento, setDescuento] = useState(0)
    const [total, setTotal] = useState(subtotal)

    useEffect(() => {
        setTotal(subtotal - descuento);
    }, [subtotal, descuento]);

    const addDiscountToTotal = (promotion) => {
        let newDiscount;
        if(promotion.promotion_type === 'PORCENTAJE'){
            newDiscount = subtotal * (promotion.attributes.discount / 100);
        } else {
            newDiscount = promotion.attributes.discount;
        }
        setDescuento(newDiscount);
        setDiscountSelected(promotion.attributes.id);
    
        setDiscount(promotion.id);
        setIsModalOpen(false);
    };

    const removeDiscount = () => {
        setDiscountSelected(null);
        setDescuento(0);
        // Resetear el descuento en el componente padre
        setDiscount(null);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const formatCurrency = (value) => {
        return typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : '0.00';
    };

    return (
        <>
            <Flex justify='space-between' onClick={() => showModal()} >
                <h4 className='order-title'>RESUMEN</h4>
                <Space>+ <MdDiscount />Agregar descuento</Space>
            </Flex>
            <hr className='order-divider' />
            <Flex justify='space-between'>
                <span><b>Subtotal: </b></span>
                <span>Bs. {formatCurrency(subtotal)}</span>
            </Flex>

            {descuento > 0 && (
                <Flex justify='space-between' align='center'>
                    <span><b>Descuento: </b></span>
                    <Space>
                        <span style={{ color: 'red' }}>- Bs. {formatCurrency(descuento)}</span>
                        <CloseOutlined 
                            style={{ cursor: 'pointer', fontSize: '12px' }} 
                            onClick={removeDiscount}
                        />
                    </Space>
                </Flex>
            )}
            <Divider dashed style={{ margin: '5px 0px', borderColor: '#000' }} />
            <Flex justify='space-between'>
                <span className='total-text'>Total:</span>
                <span className='total-text'>Bs. {formatCurrency(total)}</span>
            </Flex>
            <Modal
                title={
                    <>
                        <b>Seleccionar promoción</b>
                        <p style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '5px' }}>
                            Elige una promoción para aplicar a tu compra actual.
                        </p>
                    </>
                }
                footer={null}
                open={isModalOpen}
                onCancel={handleCancel}
            >
                {isLoading || isFetching ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Radio.Group onChange={(e) => addDiscountToTotal(e.target.value)} value={discountSelected}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {promos?.data?.map(promo => (
                                <div key={promo.id} style={{
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '4px',
                                    padding: '10px',
                                    marginBottom: '10px',
                                    transition: 'all 0.3s',
                                    ...(discountSelected === promo.id ? {
                                        borderColor: '#1890ff',
                                        boxShadow: '0 0 0 2px rgba(24,144,255,0.2)'
                                    } : {})
                                }}>
                                    <Radio value={promo} style={{ width: '100%', marginRight: 0 }}>
                                        <div><b>{promo.attributes.promotion_name}</b></div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>
                                            {promo.attributes.description}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#1890ff' }}>
                                            Descuento: {promo.attributes.promotion_type === 'PORCENTAJE' 
                                                ? `${promo.attributes.discount} %` 
                                                : `${promo.attributes.discount} Bs`}
                                        </div>
                                    </Radio>
                                </div>
                            ))}
                        </Space>
                    </Radio.Group>
                )}
            </Modal>
        </>
    )
}

export default SummaryOfSales
