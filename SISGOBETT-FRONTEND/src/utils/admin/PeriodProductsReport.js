import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../assets/Logo Gobett.png';

const styles = StyleSheet.create({
    // ... estilos similares a PeriodSalesReport ...
    page: {
        padding: 40,
        fontSize: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: 1,
        paddingBottom: 10,
    },
    logoSection: {
        width: '40%',
    },
    logo: {
        width: 80,
        height: 60,
    },
    companyInfo: {
        width: '60%',
        textAlign: 'right',
        fontSize: 9,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statBox: {
        width: '30%',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 4,
    },
    statLabel: {
        fontSize: 9,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    table: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#cccccc',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'column',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        padding: 8,
    },
    mainRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    colorsContainer: {
        marginLeft: 35,
        marginTop: 4,
        paddingBottom: 4,
    },
    colorRow: {
        flexDirection: 'row',
        marginVertical: 2,
    },
    col1: { width: '25%' }, // Producto
    col2: { width: '10%' }, // Código
    col3: { width: '15%' }, // Cantidad Total
    col4: { width: '35%' }, // Precio Promedio
    col5: { width: '15%', textAlign: 'right' }, // Total
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTop: 1,
        borderColor: '#e8e8e8',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#8c8c8c',
    },
    colorStats: {
        flexDirection: 'row',
        marginVertical: 2,
        gap: 4,
    },
    colorName: {
        fontSize: 8,
        color: '#595959',
        width: '60%',
    },
    colorQuantity: {
        fontSize: 8,
        color: '#8c8c8c',
        width: '40%',
    },
    colorDivider: {
        borderTopWidth: 0.5,
        borderTopColor: '#e8e8e8',
        marginVertical: 4,
    }
});

const generatePeriodProductsReport = ({ sales }) => {
    // Procesar datos de productos y sus colores
    const productStats = sales.reduce((acc, sale) => {
        sale.attributes.detail.forEach(item => {
            const productName = item.fabric?.data?.attributes?.name || 'Producto sin nombre';
            const productCode = item.fabric?.data?.attributes?.code || 'S/C';
            const colorName = item.color?.data?.attributes?.name || 'Sin color';
            const quantity = item.quantity_meterage || 0;
            const price = item.unit_price || 0;
            const total = quantity * price;

            if (!acc[productName]) {
                acc[productName] = {
                    code: productCode,
                    totalQuantity: 0,
                    totalAmount: 0,
                    sales: 0,
                    prices: [],
                    colors: {}
                };
            }

            if (!acc[productName].colors[colorName]) {
                acc[productName].colors[colorName] = {
                    quantity: 0,
                    amount: 0
                };
            }

            acc[productName].totalQuantity += quantity;
            acc[productName].totalAmount += total;
            acc[productName].sales++;
            acc[productName].prices.push(price);
            acc[productName].colors[colorName].quantity += quantity;
            acc[productName].colors[colorName].amount += total;
        });
        return acc;
    }, {});

    const sortedProducts = Object.entries(productStats)
        .map(([name, stats]) => ({
            name,
            code: stats.code,
            quantity: stats.totalQuantity,
            averagePrice: stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length,
            total: stats.totalAmount,
            sales: stats.sales,
            colors: Object.entries(stats.colors)
                .map(([color, data]) => ({
                    color,
                    quantity: data.quantity,
                    amount: data.amount
                }))
                .sort((a, b) => b.quantity - a.quantity)
        }))
        .sort((a, b) => b.total - a.total);

    const totalProducts = sortedProducts.length;
    const totalQuantity = sortedProducts.reduce((sum, product) => sum + product.quantity, 0);
    const totalRevenue = sortedProducts.reduce((sum, product) => sum + product.total, 0);

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        <Image src={logo} style={styles.logo} />
                    </View>
                    <View style={styles.companyInfo}>
                        <Text>GOBETT MODAS</Text>
                        <Text>Av. América #xxx - La Paz, Bolivia</Text>
                        <Text>Teléfono: +591 2 XXXXXX</Text>
                        <Text>NIT: XXXXXXXXX</Text>
                        <Text>Email: ventas@gobett.com</Text>
                    </View>
                </View>

                <Text style={styles.title}>REPORTE DE VENTAS POR PRODUCTO</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Productos</Text>
                        <Text style={styles.statValue}>{totalProducts}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Cantidad</Text>
                        <Text style={styles.statValue}>{totalQuantity.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Ingresos</Text>
                        <Text style={styles.statValue}>Bs. {totalRevenue.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Producto</Text>
                        <Text style={styles.col2}>Código</Text>
                        <Text style={styles.col3}>Cantidad</Text>
                        <Text style={styles.col4}>Precio Promedio</Text>
                        <Text style={styles.col5}>Total</Text>
                    </View>

                    {sortedProducts.map((product, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={styles.mainRow}>
                                <Text style={styles.col1}>{product.name}</Text>
                                <Text style={styles.col2}>{product.code}</Text>
                                <Text style={styles.col3}>{product.quantity.toFixed(2)}</Text>
                                <Text style={styles.col4}>
                                    Bs. {product.averagePrice.toFixed(2)}
                                </Text>
                                <Text style={styles.col5}>
                                    Bs. {product.total.toFixed(2)}
                                </Text>
                            </View>
                            
                            <View style={styles.colorsContainer}>
                                <View style={styles.colorDivider} />
                                <Text style={[styles.colorName, { fontWeight: 'bold', marginBottom: 4 }]}>
                                    Detalle de colores:
                                </Text>
                                {product.colors
                                    .sort((a, b) => b.quantity - a.quantity) // Ordenar por cantidad
                                    .map((colorData, idx) => (
                                        <View key={idx} style={styles.colorRow}>
                                            <Text style={styles.colorName}>
                                                • {colorData.color}
                                            </Text>
                                            <Text style={styles.colorQuantity}>
                                                {colorData.quantity.toFixed(2)} metros
                                            </Text>
                                        </View>
                                    ))}
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>GOBETT MODAS</Text>
                    <Text style={styles.footerText}>Av. América #xxx - La Paz, Bolivia</Text>
                    <Text style={styles.footerText}>Teléfono: +591 2 XXXXXX</Text>
                    <Text style={styles.footerText}>NIT: XXXXXXXXX</Text>
                    <Text style={styles.footerText}>Email: ventas@gobett.com</Text>
                </View>
            </Page>
        </Document>
    );
};

export default generatePeriodProductsReport; 