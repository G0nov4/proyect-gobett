import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, DatePicker, Space, Select } from 'antd';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  DollarOutlined, 
  RiseOutlined, 
  ShoppingOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { useSales } from '../../services/Sales';
import { useClients } from '../../services/Client';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SalesAnalytics = () => {
    const [timeRange, setTimeRange] = useState('week');
    const { data: salesData, isLoading } = useSales();
    const { data: clientsData } = useClients();

    // Agregar console.log para debug
    console.log('Sales Data:', salesData);

    // Verificar la estructura de los datos
    useEffect(() => {
        if (salesData?.data) {
            console.log('Primera venta:', salesData.data[0]);
            console.log('Detalles de la primera venta:', salesData.data[0]?.attributes?.detail);
        }
    }, [salesData]);

    // 1. MÉTRICAS FINANCIERAS BÁSICAS
    const financialMetrics = useMemo(() => {
        if (!salesData?.data) return {};
        
        const sales = salesData.data;
        const totalRevenue = sales.reduce((sum, sale) => {
            const saleTotal = sale.attributes.detail.reduce((detailSum, item) => 
                detailSum + (item.quantity_meterage * item.unit_price), 0);
            return sum + saleTotal;
        }, 0);

        const totalCost = sales.reduce((sum, sale) => {
            return sum + sale.attributes.detail.reduce((detailSum, item) => 
                detailSum + (item.quantity_meterage * item.fabric.data.attributes.cost), 0);
        }, 0);

        return {
            totalRevenue: totalRevenue,
            grossProfit: totalRevenue - totalCost,
            averageTicket: totalRevenue / sales.length,
            margin: ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(2)
        };
    }, [salesData]);

    // 2. ANÁLISIS DE PRODUCTOS
    const productAnalysis = useMemo(() => {
        if (!salesData?.data) return [];

        const productSales = {};
        salesData.data.forEach(sale => {
            sale.attributes.detail.forEach(item => {
                const fabricName = item.fabric.data.attributes.name;
                const colorName = item.color.data.attributes.name;
                const key = `${fabricName} - ${colorName}`;

                if (!productSales[key]) {
                    productSales[key] = {
                        name: key,
                        quantity: 0,
                        revenue: 0,
                        transactions: new Set(),
                        colorHex: item.color.data.attributes.color
                    };
                }
                
                productSales[key].quantity += parseFloat(item.quantity_meterage);
                productSales[key].revenue += item.quantity_meterage * item.unit_price;
                productSales[key].transactions.add(sale.id);
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .map(product => ({
                ...product,
                frequency: product.transactions.size
            }));
    }, [salesData]);

    // 3. COMPORTAMIENTO DEL CLIENTE
    const customerBehavior = useMemo(() => {
        if (!salesData?.data) return [];

        const customerPurchases = {};
        
        salesData.data.forEach(sale => {
            const clientId = sale.attributes.client?.data?.id;
            if (!clientId) return;

            if (!customerPurchases[clientId]) {
                customerPurchases[clientId] = {
                    key: clientId,
                    name: `${sale.attributes.client.data.attributes.name} ${sale.attributes.client.data.attributes.last_name || ''}`.trim(),
                    totalPurchases: 0,
                    totalSpent: 0,
                    lastPurchase: null,
                    city: sale.attributes.client.data.attributes.city || 'No especificado',
                    clientType: sale.attributes.client.data.attributes.kind_of_client || 'No especificado'
                };
            }

            const saleTotal = sale.attributes.detail.reduce((sum, item) => 
                sum + (item.quantity_meterage * item.unit_price), 0);
            
            customerPurchases[clientId].totalPurchases++;
            customerPurchases[clientId].totalSpent += saleTotal;
            
            const saleDate = new Date(sale.attributes.createdAt);
            if (!customerPurchases[clientId].lastPurchase || 
                saleDate > new Date(customerPurchases[clientId].lastPurchase)) {
                customerPurchases[clientId].lastPurchase = sale.attributes.createdAt;
            }
        });

        return Object.values(customerPurchases)
            .sort((a, b) => b.totalSpent - a.totalSpent);
    }, [salesData]);

    // 4. TENDENCIAS TEMPORALES
    const temporalTrends = useMemo(() => {
        if (!salesData?.data) return { labels: [], data: [], transactions: [] };

        const salesByDate = {};
        salesData.data.forEach(sale => {
            const date = new Date(sale.attributes.createdAt).toLocaleDateString();
            if (!salesByDate[date]) {
                salesByDate[date] = {
                    total: 0,
                    transactions: 0
                };
            }
            
            const saleTotal = sale.attributes.detail.reduce((sum, item) => 
                sum + (item.quantity_meterage * item.unit_price), 0);
            
            salesByDate[date].total += saleTotal;
            salesByDate[date].transactions++;
        });

        const sortedDates = Object.keys(salesByDate).sort((a, b) => 
            new Date(a) - new Date(b));

        return {
            labels: sortedDates,
            data: sortedDates.map(date => salesByDate[date].total),
            transactions: sortedDates.map(date => salesByDate[date].transactions)
        };
    }, [salesData]);

    useEffect(() => {
        if (salesData?.data) {
            // Debug de datos financieros
            console.log('Métricas Financieras:', financialMetrics);
            
            // Debug de análisis de productos
            console.log('Análisis de Productos:', productAnalysis);
            
            // Debug de tendencias temporales
            console.log('Tendencias Temporales:', temporalTrends);
        }
    }, [salesData, financialMetrics, productAnalysis, temporalTrends]);

    return (
        <div style={{ padding: '24px' }}>
            {/* Filtros Generales */}
            <Space style={{ marginBottom: 16 }}>
                <RangePicker />
                <Select defaultValue="week" onChange={setTimeRange}>
                    <Option value="week">Última Semana</Option>
                    <Option value="month">Último Mes</Option>
                    <Option value="quarter">Último Trimestre</Option>
                    <Option value="year">Último Año</Option>
                </Select>
            </Space>

            {/* 1. Métricas Financieras */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Ingresos Totales"
                            value={financialMetrics.totalRevenue}
                            prefix={<DollarOutlined />}
                            suffix="Bs."
                            precision={2}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Ganancia Bruta"
                            value={financialMetrics.grossProfit}
                            prefix={<RiseOutlined />}
                            suffix="Bs."
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Ticket Promedio"
                            value={financialMetrics.averageTicket}
                            prefix={<ShoppingOutlined />}
                            suffix="Bs."
                            precision={2}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Margen de Ganancia"
                            value={financialMetrics.margin}
                            prefix={<UserOutlined />}
                            suffix="%"
                            precision={2}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 2. Análisis de Productos y Tendencias */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Productos Más Vendidos">
                        <Table
                            dataSource={productAnalysis.slice(0, 5)}
                            columns={[
                                {
                                    title: 'Producto',
                                    dataIndex: 'name',
                                    key: 'name',
                                },
                                {
                                    title: 'Cantidad',
                                    dataIndex: 'quantity',
                                    key: 'quantity',
                                    render: (val) => `${val.toFixed(2)} mts`,
                                },
                                {
                                    title: 'Ingresos',
                                    dataIndex: 'revenue',
                                    key: 'revenue',
                                    render: (val) => `Bs. ${val.toFixed(2)}`,
                                },
                            ]}
                            pagination={false}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Tendencia de Ventas">
                        <Line
                            data={{
                                labels: temporalTrends.labels,
                                datasets: [
                                    {
                                        label: 'Ventas Diarias',
                                        data: temporalTrends.data,
                                        borderColor: '#1890ff',
                                        tension: 0.4,
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                            }}
                            height={200}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 3. Comportamiento del Cliente */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="Mejores Clientes">
                        <Table
                            dataSource={Array.isArray(customerBehavior) ? customerBehavior.slice(0, 10) : []}
                            columns={[
                                {
                                    title: 'Cliente',
                                    dataIndex: 'name',
                                    key: 'name',
                                },
                                {
                                    title: 'Total Compras',
                                    dataIndex: 'totalPurchases',
                                    key: 'totalPurchases',
                                },
                                {
                                    title: 'Total Gastado',
                                    dataIndex: 'totalSpent',
                                    key: 'totalSpent',
                                    render: (val) => `Bs. ${(val || 0).toFixed(2)}`,
                                },
                                {
                                    title: 'Última Compra',
                                    dataIndex: 'lastPurchase',
                                    key: 'lastPurchase',
                                    render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
                                },
                            ]}
                            pagination={false}
                            rowKey="key"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SalesAnalytics; 