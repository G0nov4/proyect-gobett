import { Avatar, Button, Card, message, Modal, Space, Table, Tooltip, Typography } from 'antd';
import { 
    ShoppingOutlined, 
    DollarCircleOutlined, 
    RiseOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    BarChartOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import { useDeleteSupplier } from '../../services/Suppliers';
import { useQueryClient } from 'react-query';
import { useState } from 'react';
import SupplierDetailsModal from '../Modals/SupplierDetailsModal';

const { Text } = Typography;

const SuppliersTable = ({ data }) => {
    const queryClient = useQueryClient();
    const deleteSupplier = useDeleteSupplier();
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    console.log(data)

    const handleViewDetails = (record) => {
        setSelectedSupplier(record);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Proveedor',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: 280,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar 
                        src={`http://localhost:1337${record.logo}`} 
                        size={45}
                        style={{ 
                            border: '2px solid #f0f0f0',
                            backgroundColor: '#fafafa' 
                        }}
                    >
                        {!record.logo && text.charAt(0)}
                    </Avatar>
                    <div>
                        <Text strong style={{ fontSize: '14px' }}>{text}</Text>
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#8c8c8c',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px' 
                        }}>
                            <span>{record.city}</span>
                            <span>•</span>
                            <span>{record.country}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Estadísticas',
            key: 'statistics',
            width: 400,
            render: (_, record) => (
                <Space size="large">
                    <Tooltip title="Total Productos">
                        <div style={{ textAlign: 'center' }}>
                            <ShoppingOutlined style={{ 
                                fontSize: '18px', 
                                color: '#1890ff',
                                marginBottom: '4px'
                            }} />
                            <div style={{ fontWeight: 'bold' }}>
                                {record.statistics.totalProducts}
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip title="Total Ventas">
                        <div style={{ textAlign: 'center' }}>
                            <DollarCircleOutlined style={{ 
                                fontSize: '18px', 
                                color: '#52c41a',
                                marginBottom: '4px'
                            }} />
                            <div style={{ fontWeight: 'bold' }}>
                                {record.statistics.totalSales}
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip title="Monto Total">
                        <div style={{ textAlign: 'center' }}>
                            <RiseOutlined style={{ 
                                fontSize: '18px', 
                                color: '#faad14',
                                marginBottom: '4px'
                            }} />
                            <div style={{ fontWeight: 'bold' }}>
                                {new Intl.NumberFormat('es-BO', { 
                                    style: 'currency', 
                                    currency: 'BOB',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(record.statistics.totalSalesAmount)}
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip title="Promedio por Venta">
                        <div style={{ textAlign: 'center' }}>
                            <BarChartOutlined style={{ 
                                fontSize: '18px', 
                                color: '#722ed1',
                                marginBottom: '4px'
                            }} />
                            <div style={{ fontWeight: 'bold' }}>
                                {new Intl.NumberFormat('es-BO', { 
                                    style: 'currency', 
                                    currency: 'BOB',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(record.statistics.averageSaleAmount)}
                            </div>
                        </div>
                    </Tooltip>
                </Space>
            )
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Ver detalles">
                        <Button 
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(record);
                            }}
                            style={{ backgroundColor: '#1890ff' }}
                        />
                    </Tooltip>
                    <Tooltip title="Editar">
                        <Button 
                            size="small"
                            icon={<EditOutlined />}
                            style={{ backgroundColor: '#faad14', color: '#fff' }}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <Button 
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                Modal.confirm({
                                    title: '¿Estás seguro de eliminar este proveedor?',
                                    content: 'Esta acción no se puede deshacer',
                                    okText: 'Sí, eliminar',
                                    cancelText: 'Cancelar',
                                    okButtonProps: {
                                        danger: true
                                    },
                                    onOk: () => {
                                        deleteSupplier.mutateAsync(record.id)
                                        .then(() => {
                                            message.success('Proveedor eliminado exitosamente');
                                            queryClient.invalidateQueries('suppliers');
                                        })
                                        .catch((error) => {
                                            message.error('Error al eliminar el proveedor');
                                        });
                                    }
                                });
                            }}
                        />
                    </Tooltip>
                    {record.link_web && (
                        <Tooltip title="Sitio Web">
                            <Button 
                                size="small"
                                icon={<GlobalOutlined />}
                                style={{ backgroundColor: '#000000', color: '#fff' }}
                                onClick={() => window.open(record.link_web, '_blank')}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    return (
        <>
            <Table 
                columns={columns} 
                dataSource={data}
                rowKey="id"
                size='small'
                onRow={(record) => ({
                    onClick: () => handleViewDetails(record),
                    style: { cursor: 'pointer' }
                })}
                pagination={{
                    pageSize: 8,
                    showSizeChanger: false,
                    showTotal: (total) => `Total ${total} proveedores`
                }}
                scroll={{ x: 830 }}
                style={{ 
                    backgroundColor: '#fff',
                    borderRadius: '8px'
                }}
            />

            <SupplierDetailsModal 
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setSelectedSupplier(null);
                }}
                supplier={selectedSupplier}
            />
        </>
    );
};

export default SuppliersTable; 