import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Typography, Progress } from 'antd';
import { 
    DollarOutlined, 
    ShoppingOutlined,
    UserOutlined,
    RiseOutlined 
} from '@ant-design/icons';
import { useSales } from '../services/Sales';
import { useClients } from '../services/Client';
import TopClients from '../components/Tables/TopClients';
import './DashboardAdmin.css';

const { Title } = Typography;

const DashboardAdmin = () => {
    const { data: salesData } = useSales(null, null, {
        pagination: {
            pageSize: 1000,
            page: 1
        }
    });
    const { data: clientsData } = useClients();


    const stats = useMemo(() => {
        if (!salesData?.data) return null;
        
        const sales = salesData.data;
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => {
            return sum + sale.attributes.detail.reduce((detailSum, item) => 
                detailSum + (item.unit_price * item.quantity_meterage), 0
            );
        }, 0);
        const clientCount = clientsData?.data?.length || 0;

        return {
            totalSales,
            totalRevenue,
            clientCount
        };
    }, [salesData, clientsData]);

    return (
        <div className="dashboard-container">
            <Title level={2} className="dashboard-title">
                Panel de Control
            </Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="stat-card blue">
                        <Statistic
                            title="Ventas Totales"
                            value={stats?.totalSales || 0}
                            prefix={<ShoppingOutlined />}
                        />
                    
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="stat-card green">
                        <Statistic
                            title="Ingresos Totales"
                            value={stats?.totalRevenue || 0}
                            precision={2}
                            prefix={<DollarOutlined />}
                            suffix="Bs"
                        />
            
                    </Card>
                </Col>
            
                <Col xs={24} sm={12} lg={8}>
                    <Card className="stat-card orange">
                        <Statistic
                            title="Total Clientes"
                            value={stats?.clientCount || 0}
                            prefix={<UserOutlined />}
                        />
                       
                    </Card>
                </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
                <Col xs={24}>
                 
                     
                        <TopClients sales={salesData?.data || []} />
                  
                </Col>
            </Row>
        </div>
    );
};

export default DashboardAdmin;
