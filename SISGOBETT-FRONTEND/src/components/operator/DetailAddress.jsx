import React from 'react';
import { Select, Input, Space, DatePicker } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, ShopOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

function DetailAddress({ deliveryOption, setDeliveryOption, address, setAddress, clientAddress, deliveryDate, setDeliveryDate }) {
    const handleDeliveryOptionChange = (value) => {
        setDeliveryOption(value);
        if (value === 'EN DOMICILIO') {
            setAddress(clientAddress || '');
        } else if (value === 'LUGAR ESPECIFICO') {
            setAddress(''); // Vaciar el input para lugar específico
        } else {
            setAddress('');
        }
    };

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    return (
        <>
            <h4 className='order-title'>
                DETALLE DE ENTREGA
            </h4>
            
            <hr className='order-divider' />

            <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                    value={deliveryOption}
                    style={{ width: '100%' }}
                    defaultValue="EN TIENDA"
                    onChange={handleDeliveryOptionChange}
                >
                    <Option value="EN TIENDA">
                        <ShopOutlined /> Recoger en tienda
                    </Option>
                    <Option value="EN DOMICILIO">
                        <HomeOutlined /> En domicilio
                    </Option>
                    <Option value="LUGAR ESPECIFICO">
                        <EnvironmentOutlined /> Lugar Específico
                    </Option>
                </Select>

                {(deliveryOption === 'EN DOMICILIO' || deliveryOption === 'LUGAR ESPECIFICO') && (
                    <Input
                        placeholder={
                            deliveryOption === 'EN DOMICILIO' 
                                ? "Dirección de entrega" 
                                : "Ingrese la dirección específica"
                        }
                        value={address}
                        onChange={handleAddressChange}
                        prefix={
                            deliveryOption === 'EN DOMICILIO' 
                                ? <HomeOutlined /> 
                                : <EnvironmentOutlined />
                        }
                    />
                )}

                <DatePicker 
                    style={{ width: '100%' }}
                    placeholder="Fecha de entrega"
                    value={deliveryDate ? dayjs(deliveryDate) : null}
                    onChange={(date) => setDeliveryDate(date ? date.toISOString() : null)}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
            </Space>
        </>
    );
}

export default DetailAddress;
