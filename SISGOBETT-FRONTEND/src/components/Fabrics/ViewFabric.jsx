import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewFabric.css';
import { Badge, Button, Card, Carousel, Col, Descriptions, Divider, Image, Row, Space, Typography, message, Spin, Statistic, Tabs, List,  Tag, Popconfirm, Tooltip, Table, Modal, Form, Input, Select } from 'antd';
import { PrinterFilled, ShopOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SyncOutlined, ArrowLeftOutlined, QuestionCircleOutlined, SwapOutlined, DeleteOutlined } from '@ant-design/icons'; 
import { useGetFabricById } from '../../services/Fabrics';
import { FaRulerHorizontal, FaToiletPaper } from 'react-icons/fa';
import { FaCalendarAlt, FaWeight, FaRulerVertical, FaPalette, FaTruck } from 'react-icons/fa';
import { LuWarehouse } from 'react-icons/lu';
import { useDeleteRoll, useUpdateRoll } from '../../services/Rolls';
import { useQueryClient } from 'react-query';
import { useBranches } from '../../services/Branches';
import { useWarehouses } from '../../services/Warehouses';
import RollLabels from './RollLabels';

const { Text, Title } = Typography;

function ViewFabric() {
    const { id } = useParams();
    const { data, isLoading, error } = useGetFabricById(id);
    const navigate = useNavigate();

    const [moveModalVisible, setMoveModalVisible] = useState(false);
    const [selectedRoll, setSelectedRoll] = useState(null);
    const [moveForm] = Form.useForm();
    const deleteRoll = useDeleteRoll();
    const updateRoll = useUpdateRoll();
    const queryClient = useQueryClient();
    const { data: branchesData } = useBranches();
    const { data: warehousesData } = useWarehouses();
    const [printModalVisible, setPrintModalVisible] = useState(false);
    const labelsPrintRef = useRef();

    const handlePrintLabels = () => {
        const printContent = labelsPrintRef.current;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent.innerHTML;
        
        window.print();
        
        document.body.innerHTML = originalContent;
        window.location.reload(); // Recargar la página después de imprimir
    };

    // Muestra loading mientras se cargan los datos
    if (isLoading) return <Spin size="large" />


    if (error) {
        message.error('Error al cargar los datos de la tela');
        return <h2>Error: No se pudo cargar la información de la tela.</h2>;
    }

    // Validación de los datos
    if (!data || !data.data || !data.data.attributes) {
        return <h2>Error: No se encontraron datos para esta tela.</h2>;
    }

    const datos = data.data;
    const {
        name,
        description,
        arrive_date,
        supplier,
        height,
        weight,
        code,
        fabric_images,
        colors,
        retail_price,
        wholesale_price,
        wholesale_price_assorted,
        price_per_roll,
        price_per_roll_assorted,
        rolls
    } = datos.attributes;

    const organizedRolls = rolls.data.reduce((acc, roll) => {
        const colorData = roll.attributes.color.data.attributes;
        const colorName = colorData.name;

        if (!acc[colorName]) {
            acc[colorName] = {
                color: colorData.color,
                rolls: [],
                totalRolls: 0,
                totalFootage: 0
            };
        }

        if (roll.attributes.status === 'DISPONIBLE') {
            acc[colorName].totalFootage += roll.attributes.roll_footage;
            acc[colorName].totalRolls++;
        }

        acc[colorName].rolls.push(roll);
        return acc;
    }, {});

    const rollData = Object.entries(organizedRolls).map(([colorName, colorData], index) => ({
        key: index,
        color: colorName,
        colorCode: colorData.color,
        totalRolls: colorData.totalRolls,
        totalFootage: `${colorData.totalFootage} mts`,
        rolls: colorData.rolls,
    }));

    const handleDeleteRoll = async (rollId) => {
        await deleteRoll.mutateAsync(rollId)
        .then(() => {
            message.success('Rollo eliminado correctamente');
            queryClient.invalidateQueries(['fabric', id]);
        })
        .catch((error) => {
            message.error('Error al eliminar el rollo');
            console.error('Error:', error);
        });
    };


    const showMoveModal = (roll) => {
        setSelectedRoll(roll);
        // Determinar la ubicación actual
        const currentLocation = roll.warehouseName || roll.branchName || 'Sin ubicación';
        
        moveForm.setFieldsValue({
            currentLocation: currentLocation
        });
        setMoveModalVisible(true);
    };

    const getGroupedLocations = () => {
        const options = [
            {
                label: 'Almacenes',
                options: warehousesData?.data?.map(warehouse => ({
                    value: `WAREHOUSE_${warehouse.id}`,
                    label: warehouse.attributes.name
                })) || []
            },
            {
                label: 'Sucursales',
                options: branchesData?.data?.map(branch => ({
                    value: `BRANCH_${branch.id}`,
                    label: branch.attributes.name
                })) || []
            }
        ];

        return options;
    };

    const handleMoveRoll = async (values) => {
        const [type, locationId] = values.destination.split('_');
        
        try {
            await updateRoll.mutateAsync({
                id: selectedRoll.id,
              
                    warehouse: type === 'WAREHOUSE' ? parseInt(locationId) : null,
                    branch: type === 'BRANCH' ? parseInt(locationId) : null,
                    status: type === 'BRANCH' ? 'EN TIENDA' : 'DISPONIBLE'
                
            }).then(() => { 
               
                queryClient.invalidateQueries(['fabric', id]);
                message.success('Rollo movido correctamente');
            })



            setMoveModalVisible(false);
            moveForm.resetFields();
        } catch (error) {
            message.error('Error al mover el rollo');
            console.error('Error:', error);
        }
    };

    return (
        <div className="fabric-view-container">
            <Row className="page-header" justify="space-between" align="middle" style={{padding: 0}}>
                <Col>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/admin/fabrics')}
                        danger
                        type='primary'
                        
                    >
                        Volver a Telas
                    </Button>
                </Col>
                <Col>
                    <Space size="small">
                        <Button 
                            icon={<PrinterFilled />} 
                            onClick={() => setPrintModalVisible(true)}
                            type="primary"
                        >
                            Imprimir Etiquetas
                        </Button>
                        <Button 
                            type="dashed" 
                            danger
                            onClick={() => navigate(`/admin/fabric/edit/${id}`)}
                        >
                            Editar Tela
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Tabs con información detallada */}
            <Row style={{ marginTop: 0 }}>
                <Col span={24}>
                    <Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab="Detalles de la Tela" key="1">
                            <Row gutter={[24, 24]}>
                                {/* Imagen Principal */}
                                <Col lg={8} md={12} sm={24}>
                                    <Badge.Ribbon text={code} color="blue">
                                        {fabric_images?.data?.length > 0 ? (
                                            <Carousel autoplay className="fabric-carousel">
                                                {fabric_images.data.map((image, index) => (
                                                    <Image 
                                                        key={index} 
                                                        src={'http://localhost:1337'+image.attributes.url} 
                                                        alt={`Fabric ${index}`} 
                                                    />
                                                ))}
                                            </Carousel>
                                        ) : (
                                            <div style={{
                                                background: '#f5f5f5',
                                                padding: '20px',
                                                textAlign: 'center'
                                            }}>
                                                No hay imágenes disponibles
                                            </div>
                                        )}
                                    </Badge.Ribbon>
                                </Col>

                                {/* Detalles Principales */}
                                <Col lg={8} md={12} sm={24}>
                                    <Title level={3}>{name}</Title>
                                    <Text type="secondary">{description}</Text>
                                    <Divider />
                                    <Descriptions column={1}>
                                        <Descriptions.Item label={<><FaCalendarAlt /> Fecha de Llegada</>}>
                                            {new Date(arrive_date).toLocaleDateString('es-BO')}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><FaTruck /> Proveedor</>}>
                                            {supplier?.data?.attributes?.name || '-'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><FaRulerVertical /> Altura</>}>
                                            {height} cm
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><FaWeight /> Peso</>}>
                                            {weight} g/m²
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><FaPalette /> Colores</>}>
                                            <Space>
                                                {colors.data.map((color, index) => (
                                                    <Tag key={index} color={color.attributes.color}>
                                                        {color.attributes.name}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>

                                {/* Resumen de Stock */}
                                <Col lg={8} md={24} sm={24}>
                                    <Card title="Resumen de Stock" className="summary-card">
                                        <Statistic 
                                            title="Total Rollos Disponibles"
                                            value={rollData.reduce((acc, curr) => acc + curr.totalRolls, 0)}
                                            suffix="rollos"
                                        />
                                        <Statistic 
                                            title="Metraje Total Disponible"
                                            value={rollData.reduce((acc, curr) => acc + parseFloat(curr.totalFootage), 0)}
                                            suffix="mts"
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Tabs.TabPane>

                        <Tabs.TabPane tab="Inventario por Color" key="2">
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Table
                                        dataSource={rollData.flatMap(colorData => 
                                            colorData.rolls.map(roll => ({
                                                ...roll.attributes,
                                                key: roll.id,
                                                id: roll.id,
                                                colorName: colorData.color,
                                                colorCode: colorData.colorCode,
                                                warehouseName: roll.attributes.warehouse?.data?.attributes?.name || null,
                                                branchName: roll.attributes.branch?.data?.attributes?.name || null
                                            }))
                                        )}
                                        columns={[
                                            {
                                                title: '#',
                                                width: 60,
                                                render: (_, __, index) => index + 1,
                                                align: 'center'
                                            },
                                            {
                                                title: 'Color',
                                                key: 'color',
                                                width: 120,
                                                render: (_, record) => (
                                                    <Space>
                                                        <div 
                                                            style={{ 
                                                                width: 20, 
                                                                height: 20, 
                                                                borderRadius: '50%', 
                                                                backgroundColor: record.colorCode,
                                                                border: '1px solid #ddd'
                                                            }} 
                                                        />
                                                        {record.colorName}
                                                    </Space>
                                                ),
                                                filters: rollData.map(c => ({
                                                    text: c.color,
                                                    value: c.color,
                                                })),
                                                onFilter: (value, record) => record.colorName === value,
                                            },
                                            {
                                                title: 'Código',
                                                dataIndex: 'code',
                                                width: 120,
                                                sorter: (a, b) => a.code.localeCompare(b.code)
                                            },
                                            {
                                                title: 'Estado',
                                                dataIndex: 'status',
                                                width: 120,
                                                render: (status) => {
                                                    const statusConfig = {
                                                        'DISPONIBLE': {
                                                            color: 'success',
                                                            icon: <CheckCircleOutlined />
                                                        },
                                                        'NO DISPONIBLE': {
                                                            color: 'error',
                                                            icon: <CloseCircleOutlined />
                                                        },
                                                        'EN TIENDA': {
                                                            color: 'warning',
                                                            icon: <ExclamationCircleOutlined />
                                                        },
                                                        'RESERVADO': {
                                                            color: 'processing',
                                                            icon: <SyncOutlined spin />
                                                        }
                                                    };

                                                    return (
                                                        <Tag color={statusConfig[status]?.color} icon={statusConfig[status]?.icon}>
                                                            {status}
                                                        </Tag>
                                                    );
                                                },
                                                filters: [
                                                    { text: 'Disponible', value: 'DISPONIBLE' },
                                                    { text: 'No Disponible', value: 'NO DISPONIBLE' },
                                                    { text: 'En Tienda', value: 'EN TIENDA' },
                                                    { text: 'Reservado', value: 'RESERVADO' },
                                                ],
                                                onFilter: (value, record) => record.status === value,
                                            },
                                            {
                                                title: 'Metraje',
                                                dataIndex: 'roll_footage',
                                                width: 100,
                                                render: (footage, record) => `${footage} ${record.unit}`,
                                                sorter: (a, b) => a.roll_footage - b.roll_footage,
                                            },
                                            {
                                                title: 'Ubicación',
                                                width: 200,
                                                render: (_, record) => {
                                                    return (
                                                        <Space direction="vertical" size="small">
                                                            {record.warehouseName && (
                                                                <Tag icon={<LuWarehouse />} color="blue">
                                                                    {record.warehouseName}
                                                                </Tag>
                                                            )}
                                                            {record.branchName && (
                                                                <Tag icon={<ShopOutlined />} color="green">
                                                                    {record.branchName}
                                                                </Tag>
                                                            )}
                                                        </Space>
                                                    );
                                                }
                                            },
                                            {
                                                title: 'Acciones',
                                                width: 120,
                                                render: (_, record) => {
                                
                                                    return (
                                                        <Space>
                                                            <Tooltip title="Mover" color='#F8BD25' key='Mover'>
                                                                <Button
                                                                    icon={<SwapOutlined />}
                                                                    size='small'
                                                                    style={{
                                                                        color: '#F8BD25', 
                                                                        borderColor: '#F8BD25'
                                                                    }}
                                                                    onClick={() => showMoveModal(record)}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip title="Eliminar" color='#000' key='Eliminar'>
                                                                <Popconfirm
                                                                    title="Eliminar Rollo"
                                                                    placement='left'
                                                                    description="Esta accion no podra revertirse."
                                                                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                                                    onConfirm={() => handleDeleteRoll(record.id)}
                                                                >
                                                                    <Button
                                                                        danger
                                                                        icon={<DeleteOutlined />}
                                                                        size='small'
                                                                    />
                                                                </Popconfirm>
                                                            </Tooltip>
                                                        </Space>
                                                    );
                                                }
                                            },
                                        ]}
                                        size="small"
                                      
                                        summary={(pageData) => {
                                            const totalMetros = pageData.reduce((sum, row) => sum + row.roll_footage, 0);
                                            return (
                                                <Table.Summary.Row>
                                                    <Table.Summary.Cell index={0} colSpan={3}>
                                                        <Text strong>Total</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1}>
                                                        <Text strong>{totalMetros.toFixed(2)} mts</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={2} colSpan={2} />
                                                </Table.Summary.Row>
                                            );
                                        }}
                                    />
                                </Col>
                            </Row>

                        

                            {/* Modal para mover rollo */}
                            <Modal
                                title="Mover Rollo"
                                open={moveModalVisible}
                                onCancel={() => {
                                    setMoveModalVisible(false);
                                    moveForm.resetFields();
                                }}
                                footer={null}
                            >
                                <Form
                                    form={moveForm}
                                    onFinish={handleMoveRoll}
                                    layout="vertical"
                                >
                                    <Form.Item
                                        label="Ubicación Actual"
                                        style={{ marginBottom: '8px' }}
                                    >
                                        <Input
                                            value={selectedRoll?.warehouseName || selectedRoll?.branchName || 'Sin ubicación'}
                                            disabled
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="destination"
                                        label="Nueva Ubicación"
                                        rules={[{ required: true, message: 'Seleccione una ubicación' }]}
                                    >
                                        <Select
                                            placeholder="Seleccione destino"
                                            options={getGroupedLocations()}
                                            optionFilterProp="label"
                                            showSearch
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" block>
                                            Confirmar Movimiento
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Modal>
                        </Tabs.TabPane>
                        
                        <Tabs.TabPane tab="Precios y Costos" key="3">
                            <Row gutter={[16, 16]}>
                                {/* Precios Minoristas */}
                                <Col xs={24} md={12} lg={8}>
                                    <Card 
                                        title={<><FaRulerHorizontal /> Precio por Metro</>}
                                        className="price-card"
                                        bordered={false}
                                    >
                                        <Statistic
                                            title="Precio por Metro"
                                            value={retail_price}
                                            precision={2}
                                            prefix="Bs."
                                            valueStyle={{ color: '#3f8600' }}
                                        />
                                        <Divider />
                                        <List
                                            size="small"
                                            header={<Text strong>Descuentos por Cantidad</Text>}
                                        >
                                            <List.Item>
                                                <Text>0-5 metros:</Text>
                                                <Text strong>{retail_price} Bs.</Text>
                                            </List.Item>
                                            <List.Item>
                                                <Text>5-20 metros:</Text>
                                                <Text strong>{wholesale_price} Bs.</Text>
                                            </List.Item>
                                            <List.Item>
                                                <Text>+20 metros:</Text>
                                                <Text strong>{wholesale_price_assorted} Bs.</Text>
                                            </List.Item>
                                        </List>
                                    </Card>
                                </Col>

                                {/* Precios Mayoristas */}
                                <Col xs={24} md={12} lg={8}>
                                    <Card 
                                        title={<><FaToiletPaper /> Precio Por Rollo</>}
                                        className="price-card"
                                        bordered={false}
                                    >
                                        <Statistic
                                            title="Precio por rollo"
                                            value={price_per_roll}
                                            precision={2}
                                            prefix="Bs."
                                            valueStyle={{ color: '#1890ff' }}
                                        />
                                        <Divider />
                                        <List
                                            size="small"
                                            header={<Text strong>Descuentos por Cantidad</Text>}
                                        >
                                            <List.Item>
                                                <Text>1 rollo:</Text>
                                                <Text strong>{price_per_roll} Bs.</Text>
                                            </List.Item>
                                            <List.Item>
                                                <Text>+2 rollos:</Text>
                                                <Text strong>{price_per_roll_assorted} Bs.</Text>
                                            </List.Item>
                                        </List>
                                    </Card>
                                </Col>
                            </Row>
                        </Tabs.TabPane>
                    </Tabs>
                </Col>
            </Row>

            <Modal
                title="Vista previa de etiquetas"
                open={printModalVisible}
                onCancel={() => setPrintModalVisible(false)}
                width={800}
                footer={[
                    <Button key="cancel" onClick={() => setPrintModalVisible(false)}>
                        Cancelar
                    </Button>,
                    <Button key="print" type="primary" onClick={handlePrintLabels}>
                        Imprimir
                    </Button>
                ]}
            >
                <div ref={labelsPrintRef}>
                    <RollLabels 
                        fabric={datos}
                        rolls={rolls.data}
                    />
                </div>
            </Modal>
        </div>
    );
}

export default ViewFabric;
