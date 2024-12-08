import React, { useState } from 'react';
import { Layout, Row, Col, Button, Space, Input, Spin } from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { useWarehouses } from '../../services/Warehouses';
import WarehousesTable from '../../components/Tables/WarehousesTable';
import WarehouseModal from '../../components/Modals/WarehouseModal';

const Warehouses = () => {
    const { data: warehouses, isLoading } = useWarehouses();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [searchText, setSearchText] = useState('');

    const filteredWarehouses = warehouses?.data?.filter(warehouse => {
        const searchLower = searchText.toLowerCase();
        const name = warehouse.attributes.name?.toLowerCase() || '';
        const location = warehouse.attributes.location?.toLowerCase() || '';

        return name.includes(searchLower) || location.includes(searchLower);
    });

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleEdit = (record) => {
        setSelectedWarehouse(record);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedWarehouse(null);
    };

    const handleSuccess = () => {
        setIsModalVisible(false);
        setSelectedWarehouse(null);
        // Aquí podrías refrescar los datos si es necesario
    };

    const handleDelete = (record) => {
        console.log(record);
    };  

    const handleView = (record) => {
        console.log(record);
    };

    if(isLoading){
        return <Spin />
    }

    return (
        <Row>
            <Col xs={24}>
                <Row style={{ padding: { xs: '16px', sm: '24px' }, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ 
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: '16px', sm: '0' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        borderBottom: '2px solid #f0f0f0',
                        paddingBottom: '12px'
                    }}>
                        <div>
                            <h1 style={{ 
                                margin: 0,
                                fontSize: { xs: '24px', sm: '32px' },
                                background: 'linear-gradient(45deg, #ff4d4f, #ff7875)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                Gestión de Almacenes
                            </h1>
                            <p style={{ 
                                margin: '8px 0 0', 
                                color: '#8c8c8c',
                                fontSize: { xs: '14px', sm: '16px' },
                                fontWeight: 500
                            }}>
                                {filteredWarehouses?.length || 0} almacenes registrados
                            </p>
                        </div>
                        <Space size="middle" wrap>
                            <Button 
                                icon={<PlusOutlined />} 
                                type='primary'
                                size='large'
                                onClick={() => setIsModalVisible(true)}
                                style={{ 
                                    borderRadius: '8px',
                                    background: '#ff4d4f',
                                    boxShadow: '0 2px 4px rgba(255,77,79,0.3)',
                                    border: 'none'
                                }}
                            >
                                Crear nuevo almacén
                            </Button>
                        </Space>
                    </div>

                    <Input.Search
                        placeholder="Buscar por nombre o ubicación..."
                        style={{
                            width: '100%',
                            maxWidth: { xs: '100%', sm: '400px' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            borderRadius: '8px'
                        }}
                        size="large"
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                        value={searchText}
                        enterButton={
                            <Button
                                type="primary"
                                style={{
                                    background: '#ff4d4f',
                                    borderColor: '#ff4d4f'
                                }}
                            >
                                Buscar
                            </Button>
                        }
                    />
                </Row>

                <WarehousesTable 
                    warehouses={filteredWarehouses}
                    loading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            </Col>

            <WarehouseModal
                open={isModalVisible}
                onCancel={handleCloseModal}
                onSuccess={handleSuccess}
                initialData={selectedWarehouse}
            />
        </Row>
    );
};

export default Warehouses;