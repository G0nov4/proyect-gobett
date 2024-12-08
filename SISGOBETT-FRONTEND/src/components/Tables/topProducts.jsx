import React, { useMemo } from 'react';
import { Table, Typography } from 'antd';

const { Text } = Typography;

const TopProducts = ({ sales = [] }) => {
    const topProducts = useMemo(() => {
        const productMap = sales.reduce((acc, { attributes }) => {
            attributes.detail.forEach(item => {
                const fabricId = item.fabric.data.id;
                const fabricData = item.fabric.data.attributes;
                const colorData = item.color.data.attributes;
                const key = `${fabricId}-${colorData.code}`;

                if (!acc[key]) {
                    acc[key] = {
                        key,
                        name: fabricData.name,
                        color: colorData.name,
                        totalQuantity: 0,
                        totalAmount: 0,
                        code: fabricData.code
                    };
                }

                acc[key].totalQuantity += item.quantity_meterage;
                acc[key].totalAmount += item.unit_price * item.quantity_meterage;
            });
            return acc;
        }, {});

        return Object.values(productMap)
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 5);
    }, [sales]);

    const columns = [
        {
            title: 'Código',
            dataIndex: 'code',
            width: 100,
        },
        {
            title: 'Producto',
            dataIndex: 'name',
            render: (name, record) => (
                <div>
                    <Text strong>{name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.color}</Text>
                </div>
            ),
        },
        {
            title: 'Cantidad',
            dataIndex: 'totalQuantity',
            render: (qty) => (
                <Text>{qty.toFixed(2)} m</Text>
            ),
        },
        {
            title: 'Total',
            dataIndex: 'totalAmount',
            render: (amount) => (
                <Text strong>
                    Bs. {amount.toLocaleString('es-BO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </Text>
            ),
        },
    ];

    return (
        <div className="top-products-card">
            <h2>Productos Más Vendidos</h2>
            <Table
                dataSource={topProducts}
                columns={columns}
                pagination={false}
                size="small"
            />
        </div>
    );
};

export default TopProducts;