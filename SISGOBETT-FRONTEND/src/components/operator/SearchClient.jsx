import { Avatar, Button, Card, Col, Divider, Input, Row, Select, Space, Alert, Form } from 'antd';
import React, { useState } from 'react';
import { useClients } from '../../services/Client';
import { ArrowLeftOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import CreateClientModal from '../clients/ModalCreateClient';
import './SearchClient.css';

function SearchClient({ setIsSecondPartSelected, clientData, setClientSelected}) {
    const { data: clients, isLoading } = useClients();
    const [addModalOpen, setAddModalOpen] = useState(false);

    const handleClientSelect = (option) => {

        setClientSelected(option);
    };

    const handleClientDeselect = () => {
        setClientSelected(null);
    };

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <Space>
                <h4 className='order-title'>
                    <ArrowLeftOutlined onClick={() => setIsSecondPartSelected(false)} style={{ marginRight: '10px', cursor: 'pointer' }} />
                    SELECCIONAR CLIENTE
                </h4>
            </Space>
            <hr className='order-divider' />
            {clientData ? (
                <div className='card-client'>
                    <Row align="middle" justify='center' gutter={[16, 16]}>
                        <Col span={21}>
                            <div>
                                <b style={{ color: 'red', fontSize: '16px' }}>
                                    {clientData.label || 'Nombre del cliente'}
                                </b>
                                <br />
                                <span style={{ color: 'grey', fontSize: '12px' }}>
                                    Celular: {clientData.phone || '00000000'}
                                </span>
                                <br />
                                <span style={{ color: 'grey', fontSize: '12px' }}>
                                    Dirección: {clientData.address || 'No hay dirección registrada'}
                                </span>
                            </div>
                        </Col>
                        <Col span={3}>
                            <CloseOutlined onClick={handleClientDeselect} />
                        </Col>
                    </Row>
                </div>
            ) : (
               
                    <Select
                        showSearch
                        style={{ display: 'block', width: '100%' }}
                        size='large'
                        onSelect={(value, option) => handleClientSelect(option)}
                        placeholder="Buscar cliente..."
                        optionFilterProp="label"
                        filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                        }
                        options={clients.data.map((client) => ({
                            phone: client.attributes.phone_1,
                            address: client.attributes.direction, 
                            label: `${client.attributes.name} ${client.attributes.last_name}`,
                            value: client.id,
                        }))}
                        dropdownRender={(menu) => (
                            <>
                                {menu}
                                <Divider style={{ margin: '8px 0' }} />
                                <Button type="text" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ width: '100%' }}>
                                    Añadir Cliente
                                </Button>
                            </>
                        )}
                    />
            )}

            <CreateClientModal visible={addModalOpen} onClose={() => setAddModalOpen(false)} setClientSelected={setClientSelected} />
        </>
    );
}

export default SearchClient;
