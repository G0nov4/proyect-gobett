import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWarehouseById } from '../../services/Warehouses';
import { 
    Card, Tabs, Badge, Statistic, Row, Col, Table, Space, 
    Typography, Button, Tag, Descriptions, Spin
} from 'antd';
import {
    ShopOutlined,
    InboxOutlined,
    BarChartOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import './warehouse.css';
import { pdf } from '@react-pdf/renderer';
import { generateAndPrintWarehousesReport } from '../../utils/admin/ReportWarehouses';
import { message } from 'antd';

const ViewWarehouse = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data: warehouseData, isLoading } = useWarehouseById(id);

    if (isLoading) return <Spin size="large" />;

    const warehouse = warehouseData?.data?.attributes;
    const rolls = warehouse?.rolls?.data || [];

    // Agrupar rollos por código de tela (primeros 5 caracteres del código)
    const rollsByFabric = rolls.reduce((acc, roll) => {
        const fabricCode = roll.attributes.code.substring(0, 5);
        if (!acc[fabricCode]) {
            acc[fabricCode] = [];
        }
        acc[fabricCode].push(roll);
        return acc;
    }, {});

    const items = [
        {
            key: 'info',
            label: 'Información General',
            children: (
                <Card bordered={false}>
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <Descriptions bordered size="small">
                                <Descriptions.Item label="Nombre" span={2}>
                                    {warehouse.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Estado">
                                    <Tag color={warehouse.status === 'ACTIVO' ? 'green' : 'red'}>
                                        {warehouse.status}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Dirección" span={3}>
                                    {warehouse.address}
                                </Descriptions.Item>
                                <Descriptions.Item label="Fecha Creación">
                                    {new Date(warehouse.createdAt).toLocaleDateString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Última Actualización">
                                    {new Date(warehouse.updatedAt).toLocaleDateString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col span={24}>
                            <Row gutter={[16, 16]}>
                                <Col xs={12} sm={8} md={6}>
                                    <Card className="stat-card">
                                        <Statistic 
                                            title="Total Rollos"
                                            value={rolls.length}
                                            prefix={<InboxOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={8} md={6}>
                                    <Card className="stat-card">
                                        <Statistic 
                                            title="Tipos de Tela"
                                            value={Object.keys(rollsByFabric).length}
                                            prefix={<BarChartOutlined />}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>
            )
        },
        {
            key: 'inventory',
            label: 'Inventario por Tela',
            children: (
                <div className="fabric-groups">
                    {Object.entries(rollsByFabric).map(([fabricCode, fabricRolls]) => {
                        // Obtenemos la información de la tela del primer rollo
                        const fabricInfo = fabricRolls[0]?.attributes?.fabric?.data?.attributes;
                        
                        return (
                            <Card 
                                key={fabricCode}
                                title={
                                    <Space>
                                        <Badge color="blue" />
                                        <span>{fabricInfo?.name || 'Sin nombre'}</span>
                                        <Tag color="blue">{fabricRolls.length} rollos</Tag>
                                    </Space>
                                }
                                className="fabric-card"
                                size="small"
                                style={{ marginBottom: 16 }}
                            >
                                <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
                                    <Descriptions.Item label="Código" span={1}>{fabricInfo?.code}</Descriptions.Item>
                                    <Descriptions.Item label="Ancho" span={1}>{fabricInfo?.height} cm</Descriptions.Item>
                                    <Descriptions.Item label="Peso" span={1}>{fabricInfo?.weight} gr/m²</Descriptions.Item>
                                    <Descriptions.Item label="Descripción" span={3}>
                                        {fabricInfo?.description || 'Sin descripción'}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Table 
                                    dataSource={fabricRolls}
                                    rowKey={record => record.id}
                                    size="small"
                                    pagination={false}
                                    columns={[
                                        {
                                            title: 'Código Rollo',
                                            dataIndex: ['attributes', 'code'],
                                            key: 'code',
                                        },
                                        {
                                            title: 'Estado',
                                            dataIndex: ['attributes', 'status'],
                                            key: 'status',
                                            render: status => (
                                                <Tag color={status === 'DISPONIBLE' ? 'green' : 'red'}>
                                                    {status}
                                                </Tag>
                                            )
                                        },
                                        {
                                            title: 'Metraje',
                                            dataIndex: ['attributes', 'roll_footage'],
                                            key: 'roll_footage',
                                            render: (footage, record) => `${footage} ${record.attributes.unit}`
                                        },
                                        {
                                            title: 'Fecha Ingreso',
                                            dataIndex: ['attributes', 'createdAt'],
                                            key: 'createdAt',
                                            render: date => new Date(date).toLocaleDateString()
                                        }
                                    ]}
                                />
                            </Card>
                        );
                    })}
                </div>
            )
        }
    ];

    const handleGenerateReport = async () => {
        try {
            const warehouseForReport = {
                data: [{
                    id: id,
                    attributes: {
                        ...warehouse,
                        rolls: {
                            data: rolls
                        }
                    }
                }]
            };

            await generateAndPrintWarehousesReport(
                warehouseForReport, 
                `Reporte de Almacén - ${warehouse.name}`
            );
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            message.error('Error al generar el reporte');
        }
    };

    return (
        <div className="warehouse-view">
            <div className="page-header">
                <Row 
                    align="middle" 
                    justify="space-between"
                    gutter={[16, 16]}
                    style={{ width: '100%' }}
                >
                    <Col xs={24} sm={16}>
                        <Space wrap>
                            <Button 
                                type="primary" 
                                danger
                                icon={<ArrowLeftOutlined />} 
                                onClick={() => navigate(-1)}
                            >
                                Volver
                            </Button>
                            <Typography.Title 
                                level={3} 
                                style={{ margin: 0 }}
                                ellipsis={{ rows: 1 }}
                            >
                                {warehouse.name}
                            </Typography.Title>
                        </Space>
                    </Col>
                    <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                        <Button 
                            type="primary"
                            icon={<FileTextOutlined />}
                            onClick={handleGenerateReport}
                            block={window.innerWidth < 576}
                        >
                            Generar Reporte
                        </Button>
                    </Col>
                </Row>
            </div>

            <Card>
                <Tabs items={items} />
            </Card>
        </div>
    );
};

export default ViewWarehouse; 