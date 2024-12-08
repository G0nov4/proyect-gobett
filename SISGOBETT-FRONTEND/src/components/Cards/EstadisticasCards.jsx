import React, { useMemo } from 'react';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShopOutlined, DollarOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Card, Row, Col, Statistic } from 'antd';

const EstadisticasCards = ({ sales, clients }) => {
    const estadisticas = useMemo(() => {
        // Cálculo de clientes nuevos (última semana)
        const hoy = new Date();
        const unaSemanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

        const clientesNuevos = clients.filter(client =>
            new Date(client.createdAt) >= unaSemanaAtras
        ).length;

        // Cálculo de ventas de hoy
        const ventasHoy = sales.filter(sale => {
            const fechaVenta = new Date(sale.attributes.createdAt);
            return fechaVenta.toDateString() === hoy.toDateString();
        });

        // Cálculo de ingresos hoy
        const ingresosHoy = ventasHoy.reduce((total, venta) => {
            const detalles = venta.attributes.detail || [];
            return total + detalles.reduce((subtotal, detalle) =>
                subtotal + (detalle.unit_price * detalle.quantity_meterage), 0);
        }, 0);

        // Cantidad de ventas totales
        const cantidadVentas = sales.length;

        return {
            clientesNuevos,
            ventasHoy: ventasHoy.length,
            ingresosHoy,
            cantidadVentas
        };
    }, [sales, clients]);

    return (
        <Row gutter={[16, 16]} className="estadisticas-cards">
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="estadistica-card">
                    <Statistic
                        title="Clientes Nuevos (Semana)"
                        value={estadisticas.clientesNuevos}
                        valueStyle={{ color: '#3f8600' }}
                        prefix={<UserOutlined />}
                        suffix={
                            <ArrowUpOutlined style={{ fontSize: '16px', color: '#3f8600' }} />
                        }
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="estadistica-card">
                    <Statistic
                        title="Ventas Hoy"
                        value={estadisticas.ventasHoy}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<ShoppingOutlined />}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="estadistica-card">
                    <Statistic
                        title="Ingresos Hoy"
                        value={estadisticas.ingresosHoy}
                        precision={2}
                        valueStyle={{ color: '#cf1322' }}
                        prefix={<DollarOutlined />}
                        suffix="Bs"
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="estadistica-card">
                    <Statistic
                        title="Total Ventas"
                        value={estadisticas.cantidadVentas}
                        valueStyle={{ color: '#722ed1' }}
                        prefix={<ShopOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default EstadisticasCards;