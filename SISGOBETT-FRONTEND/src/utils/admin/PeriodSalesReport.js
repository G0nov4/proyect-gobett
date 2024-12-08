import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../assets/Logo Gobett.png';

const styles = StyleSheet.create({
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
    periodInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        fontSize: 9,
    },
    summarySection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
        padding: 5,
        marginVertical: 10,
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
        padding: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        padding: 6,
        alignItems: 'center',
    },
    statusCell: {
        width: '15%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    completedIndicator: {
        backgroundColor: '#4caf50',
    },
    pendingIndicator: {
        backgroundColor: '#ff9800',
    },
    canceledIndicator: {
        backgroundColor: '#f44336',
    },
    col1: { width: '10%' },
    col2: { width: '12%' },
    col3: { width: '20%' },
    col4: { width: '15%' },
    col5: { width: '12%' },
    col6: { width: '13%' },
    col7: { width: '18%', textAlign: 'right' },
    statusTag: {
        padding: 4,
        borderRadius: 4,
        fontSize: 8,
        textAlign: 'center',
        color: 'white',
    },
    statusCompleted: {
        backgroundColor: '#4caf50',
    },
    statusPending: {
        backgroundColor: '#ff9800',
    },
    statusCanceled: {
        backgroundColor: '#f44336',
    },
    totalNormal: {
        color: '#2c3e50',
    },
    totalCanceled: {
        color: '#f44336',
        fontWeight: 'bold',
    },
    branchSummary: {
        marginTop: 30,
        marginBottom: 20,
        borderTop: 1,
        borderColor: '#e8e8e8',
        paddingTop: 15,
    },
    branchSectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#262626',
        marginBottom: 15,
        paddingBottom: 8,
        borderBottom: 0.5,
        borderColor: '#d9d9d9',
    },
    branchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
        marginBottom: 4,
    },
    branchInfo: {
        flex: 1,
    },
    branchName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#262626',
        marginBottom: 4,
    },
    branchStats: {
        flexDirection: 'column',
        gap: 4,
    },
    branchCount: {
        fontSize: 9,
        color: '#595959',
    },
    branchPercentage: {
        fontSize: 9,
        color: '#595959',
        fontStyle: 'italic',
    },
    branchTotal: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#262626',
        textAlign: 'right',
        minWidth: 100,
    },
    footer: {
        marginTop: 40,
        paddingTop: 15
    },
    footerText: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
    },
    saleTypeTag: {
        padding: 3,
        borderRadius: 3,
        fontSize: 8,
        textAlign: 'center',
        backgroundColor: '#e8e8e8',
        color: '#262626',
    },
    pedidoType: {
        backgroundColor: '#e6f7ff',
        color: '#1890ff',
    },
    ventaType: {
        backgroundColor: '#f6ffed',
        color: '#52c41a',
    },
    typeStats: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
});

const calculateTotals = (sales) => {
    return sales.reduce((acc, sale) => {
        const saleTotal = sale.attributes.detail.reduce((sum, item) => 
            sum + (item.quantity_meterage * item.unit_price), 0
        );

        if (sale.attributes.status === 'COMPLETADO') {
            acc.completed += saleTotal;
        } else if (sale.attributes.status === 'CANCELADO') {
            acc.canceled += saleTotal;
        }

        return acc;
    }, { completed: 0, canceled: 0 });
};

// Función para procesar los datos de ventas
const processSalesData = (sales) => {
    return sales.map(sale => ({
        id: sale.id,
        clientInfo: {
            name: sale.attributes?.client?.data?.attributes?.name || 'Cliente General',
            type: sale.attributes?.client?.data?.attributes?.kind_of_client || 'NORMAL',
        },
        saleInfo: {
            status: sale.attributes?.status || 'PENDIENTE',
            delivery: sale.attributes?.delivery || 'EN TIENDA',
            date: sale.attributes?.createdAt,
            type: sale.attributes?.sales_type || 'VENTA',
            branch: sale.attributes?.branch?.data?.attributes?.name || 'Principal'
        },
        products: (sale.attributes?.detail || []).map(item => ({
            fabric: item.fabric?.data?.attributes?.name || 'Producto sin nombre',
            code: item.fabric?.data?.attributes?.code || 'S/C',
            color: item.color?.data?.attributes?.name || 'Sin color',
            quantity: item.quantity_meterage || 0,
            unit_price: item.unit_price || 0,
            total: (item.quantity_meterage || 0) * (item.unit_price || 0),
            sales_unit: item.sales_unit || 'UNIDAD'
        })),
        totalAmount: (sale.attributes?.detail || []).reduce((sum, item) => 
            sum + ((item.quantity_meterage || 0) * (item.unit_price || 0)), 0)
    }));
};

// Función para generar resumen de ventas
const generateSalesSummary = (processedSales) => {
    return {
        totalSales: processedSales.length,
        completedSales: processedSales.filter(s => s.saleInfo.status === "COMPLETADO").length,
        pendingSales: processedSales.filter(s => s.saleInfo.status === "PENDIENTE").length,
        ventasDirectas: processedSales.filter(s => s.saleInfo.type === "VENTA").length,
        pedidos: processedSales.filter(s => s.saleInfo.type === "PEDIDO").length,
        totalRevenue: processedSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        salesByBranch: processedSales.reduce((acc, sale) => {
            const branch = sale.saleInfo.branch;
            if (!acc[branch]) {
                acc[branch] = {
                    count: 0,
                    total: 0,
                    ventas: 0,
                    pedidos: 0
                };
            }
            acc[branch].count++;
            acc[branch].total += sale.totalAmount;
            if (sale.saleInfo.type === "PEDIDO") {
                acc[branch].pedidos++;
            } else {
                acc[branch].ventas++;
            }
            return acc;
        }, {})
    };
};

export const generatePeriodSalesReport = ({ sales, startDate, endDate }) => {
    const totals = calculateTotals(sales);
    const processedSales = processSalesData(sales);
    const salesSummary = generateSalesSummary(processedSales);

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

                <Text style={styles.title}>REPORTE DE VENTAS POR PERÍODO</Text>

                <View style={styles.periodInfo}>
                    <Text>Período: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</Text>
                    <Text>Generado: {new Date().toLocaleString()}</Text>
                </View>

                <Text style={styles.sectionTitle}>RESUMEN DE VENTAS</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Ventas</Text>
                        <Text style={styles.statValue}>Bs. {totals.completed.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Ventas Completadas</Text>
                        <Text style={styles.statValue}>{salesSummary.completedSales}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Ventas Pendientes</Text>
                        <Text style={styles.statValue}>{salesSummary.pendingSales}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Ventas Directas</Text>
                        <View style={[styles.saleTypeTag, styles.ventaType]}>
                            <Text style={styles.statValue}>{salesSummary.ventasDirectas || 0}</Text>
                        </View>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Pedidos</Text>
                        <View style={[styles.saleTypeTag, styles.pedidoType]}>
                            <Text style={styles.statValue}>{salesSummary.pedidos || 0}</Text>
                        </View>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Promedio por Venta</Text>
                        <Text style={styles.statValue}>
                            Bs. {(totals.completed / salesSummary.completedSales || 0).toFixed(2)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>DETALLE DE VENTAS</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>ID</Text>
                        <Text style={styles.col2}>Fecha</Text>
                        <Text style={styles.col3}>Cliente</Text>
                        <Text style={styles.col4}>Sucursal</Text>
                        <Text style={styles.col5}>Tipo</Text>
                        <Text style={styles.col6}>Estado</Text>
                        <Text style={styles.col7}>Total</Text>
                    </View>

                    {sales.map((sale, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.col1}>
                                #{sale.id}
                            </Text>
                            <Text style={styles.col2}>
                                {new Date(sale.attributes.createdAt).toLocaleDateString()}
                            </Text>
                            <View style={styles.col3}>
                                <Text>{sale.attributes.client?.data?.attributes?.name}</Text>
                                <Text style={{ fontSize: 8, color: '#666' }}>
                                    {sale.attributes.client?.data?.attributes?.kind_of_client}
                                </Text>
                            </View>
                            <Text style={styles.col4}>
                                {sale.attributes.branch?.data?.attributes?.name || 'Principal'}
                            </Text>
                            <View style={styles.col5}>
                                <View style={[
                                    styles.saleTypeTag,
                                    sale.attributes.sales_type === 'PEDIDO' ? styles.pedidoType : styles.ventaType
                                ]}>
                                    <Text>
                                        {sale.attributes.sales_type || 'VENTA'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.col6}>
                                <View style={[
                                    styles.statusTag,
                                    sale.attributes.status === 'COMPLETADO' ? styles.statusCompleted :
                                    sale.attributes.status === 'PENDIENTE' ? styles.statusPending :
                                    styles.statusCanceled
                                ]}>
                                    <Text style={{ color: 'white' }}>
                                        {sale.attributes.status}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[
                                styles.col7,
                                sale.attributes.status === 'CANCELADO' ? styles.totalCanceled : styles.totalNormal
                            ]}>
                                Bs. {sale.attributes.detail.reduce((sum, item) => 
                                    sum + (item.quantity_meterage * item.unit_price), 0).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.branchSummary}>
                    <Text style={styles.branchSectionTitle}>RESUMEN DE VENTAS POR SUCURSAL</Text>
                    
                    {Object.entries(salesSummary.salesByBranch)
                        .sort(([,a], [,b]) => b.total - a.total)
                        .map(([branch, data], index) => (
                            <View key={index} style={styles.branchRow}>
                                <View style={styles.branchInfo}>
                                    <Text style={styles.branchName}>
                                        {branch.toUpperCase()}
                                    </Text>
                                    <View style={styles.branchStats}>
                                        <Text style={styles.branchCount}>
                                            {data.count} {data.count === 1 ? 'venta' : 'ventas'}
                                        </Text>
                                        <View style={styles.typeStats}>
                                            <View style={[styles.saleTypeTag, styles.ventaType]}>
                                                <Text>{data.ventas} directas</Text>
                                            </View>
                                            <View style={[styles.saleTypeTag, styles.pedidoType]}>
                                                <Text>{data.pedidos} pedidos</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.branchTotal}>
                                    Bs. {data.total.toFixed(2)}
                                </Text>
                            </View>
                        ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Reporte generado por el sistema de GOBETT MODAS
                    </Text>
                    <Text style={styles.footerText}>
                        {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default generatePeriodSalesReport; 