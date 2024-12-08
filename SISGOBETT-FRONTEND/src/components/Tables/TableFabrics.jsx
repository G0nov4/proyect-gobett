import { Badge, Button, Popconfirm, Space, Table, Tooltip, Row, Col, Spin, Modal, Alert, Tag, Progress } from 'antd';
import React, { useState, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { ShopOutlined, SyncOutlined, EditOutlined, EyeFilled, QuestionCircleOutlined, RotateLeftOutlined, DeleteOutlined, RollbackOutlined, LineChartOutlined, DollarOutlined, AppstoreOutlined, WarningOutlined, ExclamationOutlined, ClockCircleOutlined, CalendarOutlined, ColumnHeightOutlined, PieChartOutlined, TagsOutlined, UserOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { BsPrinterFill } from 'react-icons/bs';
import { useNavigate, Link } from 'react-router-dom';
import { useDeleteFabric } from '../../services/Fabrics';
import { MdColorize } from 'react-icons/md';
import { message } from 'antd';
import { generateFabricReport } from '../../utils/admin/ReportFabric';
import dayjs from 'dayjs';

const TableFabrics = ({ filteredFabrics, isLoadingFabrics, errorFabrics }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const deleteFabricMutation = useDeleteFabric();
    const [modalState, setModalState] = useState({
        isOpen: false,
        selectedFabric: null
    });

    const handlePrintFabric = (record) => {
        setModalState({
            isOpen: true,
            selectedFabric: { data: [record] }
        });
    };

    const handleModalClose = () => {
        setModalState({
            isOpen: false,
            selectedFabric: null
        });
    };

    if (isLoadingFabrics) return <Spin />;
    if (errorFabrics) return <Alert message="Error al cargar los datos de las telas" type="error" />;
    const columns =  [
        {
            title: (
                <Space>
                    <ShopOutlined />
                    <span>Nombre</span>
                </Space>
            ),
            key: 'name',
            align: 'left',
            width: 250,
            render: (text, record) => (
                <Space>
                    {record.attributes.fabric_images?.data ? (
                        <img 
                            loading="lazy"
                            width={50}
                            height={50}
                            src={'http://localhost:1337'+record.attributes.fabric_images.data[0].attributes.url} 
                            alt={record.attributes.name}
                            style={{ borderRadius: '3px', objectFit: 'cover' }} 
                        />
                    ) : (
                        <img 
                            loading="lazy"
                            width={50}
                            height={50}
                            src="https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg" 
                            alt="Imagen Predeterminada"
                            style={{ borderRadius: '3px', objectFit: 'cover' }} 
                        />
                    )}
                    <Link to={`${record.id}`} state={record}>
                        {record.attributes.name}
                    </Link>
                </Space>
            )
        },
        
        {
            title: (
                <Space>
                    <RotateLeftOutlined />
                    <span>Rollos</span>
                </Space>
            ),
            key: 'rolls',
            align: 'center',
            width: 80,
            render: (text, record) => (
                <span style={{ 
                    color: record.attributes.rolls.data.length < 10 ? 'red' : 'inherit'
                }}>
                    {record.attributes.rolls.data.length}
                </span>
            )
        },
        {
            title: (
                <Space>
                    <MdColorize />
                    <span>Colores</span>
                </Space>
            ),
            key: 'colors',
            align: 'left',
            width: 200,
            render: (text, record) => (
                <Space size={2}>
                    {record.attributes.colors?.data?.map(color => (
                        <div 
                            key={color.attributes.color} 
                            style={{ 
                                width: '20px', 
                                height: '20px', 
                                borderRadius: '50%', 
                                backgroundColor: color.attributes.color,
                                border: '1px solid #e8e8e8',
                                boxShadow: color.attributes.color.toLowerCase() === '#ffffff' ? '0 0 0 1px #d9d9d9' : 'none'
                            }} 
                            title={color.attributes.name}
                        />
                    ))}
                </Space>
            )
        },
        {
            title: (
                <Space>
                    <ShopOutlined />
                    <span>Stock</span>
                </Space>
            ),
            key: 'stock',
            align: 'left',
            width: 150,
            render: (_, record) => {
                const totalRolls = record.attributes.rolls.data.length;
                const totalMeters = record.attributes.rolls.data.reduce((acc, roll) => 
                    acc + parseFloat(roll.attributes.roll_footage), 0);
                const availableRolls = record.attributes.rolls.data.filter(
                    roll => roll.attributes.status === 'DISPONIBLE'
                ).length;

                return (
                    <Space direction="vertical" size="small">
                        <Tag color="blue">
                            <Space>
                                <RollbackOutlined /> {availableRolls}/{totalRolls} rollos
                            </Space>
                        </Tag>
                        <Tag color="cyan">
                            <Space>
                                <LineChartOutlined /> {totalMeters.toFixed(2)} mts
                            </Space>
                        </Tag>
                    </Space>
                );
            }
        },
        {
            title: (
                <Space>
                    <PieChartOutlined />
                    <span>Distribución</span>
                </Space>
            ),
            key: 'distribution',
            align: 'left',
            width: 200,
            render: (_, record) => {
                const rolls = record.attributes.rolls.data;
                const totalRolls = rolls.length;
                const availableRolls = rolls.filter(r => r.attributes.status === 'DISPONIBLE').length;
                const reservedRolls = rolls.filter(r => r.attributes.status === 'RESERVADO').length;
                const inStoreRolls = rolls.filter(r => r.attributes.status === 'EN TIENDA').length;
                const unavailableRolls = rolls.filter(r => r.attributes.status === 'NO DISPONIBLE').length;

                return (
                    <Space direction="vertical" size="small">
                        <Progress 
                            prefix={<CheckCircleOutlined />}
                            percent={Math.round((availableRolls/totalRolls) * 100)} 
                            size="small" 
                            status="active"
                            strokeColor="#1890ff"
                            format={() => (
                                <Space>
                                    <CheckCircleOutlined style={{color: '#1890ff'}} />
                                    <span>{availableRolls} Disponibles</span>
                                </Space>
                            )}
                        />
                        <Progress 
                            percent={Math.round((reservedRolls/totalRolls) * 100)} 
                            size="small"
                            status="exception"
                            strokeColor="#ff4d4f"
                            format={() => (
                                <Space>
                                    <ClockCircleOutlined style={{color: '#ff4d4f'}} />
                                    <span>{reservedRolls} Reservados</span>
                                </Space>
                            )}
                        />
                        <Progress 
                            percent={Math.round((inStoreRolls/totalRolls) * 100)} 
                            size="small"
                            strokeColor="#52c41a"
                            format={() => (
                                <Space>
                                    <ShopOutlined style={{color: '#52c41a'}} />
                                    <span>{inStoreRolls} En Tienda</span>
                                </Space>
                            )}
                        />
                        <Progress 
                            percent={Math.round((unavailableRolls/totalRolls) * 100)} 
                            size="small"
                            status="normal"
                            strokeColor="#faad14"
                            format={() => (
                                <Space>
                                    <StopOutlined style={{color: '#faad14'}} />
                                    <span>{unavailableRolls} No Disponibles</span>
                                </Space>
                            )}
                        />
                    </Space>
                );
            }
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 200,
            align: 'center',
            render: (_, record) => {
                const handleEditClient = () => {
                    navigate(`/admin/fabric/edit/${record.id}`, { state: record });
                };

                const handleDeleteClient = async () => {
                    try {
                        await deleteFabricMutation.mutateAsync(record.id);
                        message.success('Tela eliminada exitosamente');
                        queryClient.invalidateQueries(['fabrics']);
                    } catch (error) {
                        console.error('Error al eliminar la tela:', error);
                        message.error('Error al eliminar la tela');
                    }
                };

                return (
                    <Space>
                        <Tooltip title="Ver" color='#4F646F'>
                            <Link to={`${record.id}`} state={record}>
                                <Button
                                    icon={<EyeFilled />}
                                    size='small'
                                    style={{
                                        color: '#4F646F',
                                        borderColor: '#4F646F'
                                    }}
                                />
                            </Link>
                        </Tooltip>
                        <Tooltip title="Editar" color='#F8BD25'>
                            <Button
                                icon={<EditOutlined />}
                                size='small'
                                style={{
                                    color: '#F8BD25',
                                    borderColor: '#F8BD25'
                                }}
                                onClick={handleEditClient}
                            />
                        </Tooltip>
                        <Tooltip title="Eliminar" color='#000'>
                            <Popconfirm
                                title="¿Estás seguro de eliminar esta tela?"
                                placement='left'
                                description={
                                    <div>
                                        <p>Esta acción no podrá revertirse.</p>
                                        <p>Se eliminarán también todos los rollos y colores asociados.</p>
                                    </div>
                                }
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                okText="Sí, eliminar"
                                cancelText="No, cancelar"
                                okButtonProps={{ danger: true }}
                                onConfirm={handleDeleteClient}
                            >
                                <Button
                                    loading={deleteFabricMutation.isLoading}
                                    danger
                                    icon={<DeleteOutlined />}
                                    size='small'
                                />
                            </Popconfirm>
                        </Tooltip>
                        <Tooltip title="Imprimir Reporte" color='#000'>
                            <Button
                                icon={<BsPrinterFill />}
                                size='small'
                                className="print-button"
                                style={{
                                    color: '#000',
                                    borderColor: '#000',
                                    transition: 'all 0.3s'
                                }}
                                onClick={() => handlePrintFabric(record)}
                            />
                        </Tooltip>
                    </Space>
                );
            }
        }
    ]


    return (
        <>
            <Col span={24}>
                <Spin spinning={isLoadingFabrics} tip='Cargando datos de las telas'>
                    <Table
                        columns={columns}
                        dataSource={filteredFabrics}
                        scroll={{ x: 800 }}
                        bordered
                        size='small'
                        locale={{ emptyText: 'No hay datos disponibles' }}
                        rowKey={record => record.id}
                    />
                </Spin>
            </Col>

            <Modal
                title={
                    <div style={{ 
                        borderBottom: '2px solid #1890ff',
                        padding: '10px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <BsPrinterFill size={20} />
                        <span>Reporte de Tela</span>
                    </div>
                }
                centered
                open={modalState.isOpen}
                onCancel={handleModalClose}
                width={800}
                footer={null}
                destroyOnClose
                className="print-modal"
            >
                {modalState.isOpen && (
                    <div style={{ 
                     
                    }}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <div style={{ height: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                                    {modalState.selectedFabric && generateFabricReport(modalState.selectedFabric)}
                                </div>
                            </Col>
                        </Row>
                        <Row justify="end" style={{ marginTop: '20px' }}>
                            <Space>
                                <Button onClick={handleModalClose} danger>
                                    Cancelar
                                </Button>
                                <Button 
                                    type="primary" 
                                    icon={<BsPrinterFill />}
                                    onClick={() => window.print()}
                                >
                                    Imprimir
                                </Button>
                            </Space>
                        </Row>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default React.memo(TableFabrics);
