import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Badge, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BsBoxSeam } from 'react-icons/bs';

const WarehousesTable = ({
    warehouses,
    loading,
    onEdit,
    onDelete,
}) => {
    const navigate = useNavigate();
    
    const handleWarehouseClick = (warehouseId) => {
        navigate(`/admin/warehouses/${warehouseId}`);
    };
    const columns = [
        {
            title: 'Nombre',
            dataIndex: ['attributes', 'name'],
            key: 'name',
            render: (text, record) => (
                <Button
                    type="link"
                    onClick={() => handleWarehouseClick(record.id)}
                    style={{
                        padding: 0,
                        height: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <BsBoxSeam style={{ color: record.attributes.color || '#ff4d4f' }} />
                    <span>{text}</span>
                </Button>
            ),
        },
        {
            title: 'Ubicación',
            dataIndex: ['attributes', 'address'],
            key: 'location',
            ellipsis: true
        },
        {
            title: 'Descripción',
            dataIndex: ['attributes', 'description'],
            key: 'description',
            width: 200,
            ellipsis: {
                rows: 2
            },
            render: (text) => text || '-'
        },
        {
            title: 'Estado',
            dataIndex: ['attributes', 'status'],
            key: 'status',
            render: (status) => {
                let color;
                switch (status) {
                    case 'ACTIVO':
                        color = 'success';
                        break;
                    case 'INACTIVO':
                        color = 'error';
                        break;
                    case 'EN MANTENIMIENTO':
                        color = 'warning';
                        break;
                    default:
                        color = 'default';
                }
                return (
                    <Badge
                        status={color}
                        text={status}
                    />
                );
            },
        },
        {
            title: 'Acciones',
            key: 'action',
            width: 70,
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Editar" color='#F8BD25'>
                        <Button
                            icon={<EditOutlined />}
                            size='small'
                            style={{
                                color: '#F8BD25',
                                borderColor: '#F8BD25'
                            }}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar" color='#ff4d4f'>
                        <Popconfirm
                            title="Eliminar Almacén"
                            description="¿Estás seguro de que deseas eliminar este almacén?"
                            onConfirm={() => onDelete(record)}
                            onCancel={() => console.log('Cancelar')}
                            okText="Si"
                            cancelText="No"
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                size='small'
                                style={{
                                    color: '#ff4d4f',
                                    borderColor: '#ff4d4f'
                                }}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            size='small'
            dataSource={warehouses || []}
            loading={loading}
            rowKey={record => record.id}
            style={{
                marginTop: '10px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
        />
    );
};

export default WarehousesTable; 