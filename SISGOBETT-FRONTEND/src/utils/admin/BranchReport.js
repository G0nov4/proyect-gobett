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
    branchSection: {
        marginBottom: 30,
        borderBottom: 1,
        borderColor: '#cccccc',
        paddingBottom: 20,
    },
    branchHeader: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        marginBottom: 10,
    },
    branchName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#262626',
    },
    branchInfo: {
        marginLeft: 20,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: '30%',
        color: '#595959',
    },
    value: {
        width: '70%',
        color: '#262626',
    },
    inventoryTable: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#cccccc',
    },
    col1: { width: '20%' },
    col2: { width: '30%' },
    col3: { width: '25%' },
    col4: { width: '25%' },
    fabricSection: {
        marginTop: 15,
        marginBottom: 10,
    },
    fabricHeader: {
        backgroundColor: '#f8f9fa',
        padding: 8,
        marginBottom: 5,
    },
    fabricName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#262626',
    },
    fabricTotals: {
        fontSize: 9,
        color: '#595959',
        marginTop: 4,
    },
    disponible: {
        color: '#52c41a',
    },
    reservado: {
        color: '#faad14',
    },
    'no disponible': {
        color: '#ff4d4f',
    },
    summarySection: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#f8f9fa',
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    statsSection: {
        marginVertical: 20,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#262626',
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statBox: {
        width: '30%',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    statLabel: {
        fontSize: 8,
        color: '#8c8c8c',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#262626',
    },
    topProducts: {
        marginTop: 15,
    },
    subsectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#595959',
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        paddingVertical: 3,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e8e8e8',
    },
    productName: {
        fontSize: 9,
        color: '#262626',
        width: '60%',
    },
    productStats: {
        fontSize: 9,
        color: '#595959',
        width: '40%',
        textAlign: 'right',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 9,
        color: '#8c8c8c',
    },
});

const generateBranchReport = ({ branches, rolls, sales, options }) => {
    // Agrupamos rollos por sucursal y tela (productos)
    const groupRollsByBranchAndFabric = (rolls) => {
        return rolls.reduce((acc, roll) => {
            const branchId = roll.attributes.branch?.data?.id;
            const fabricName = roll.attributes.fabric?.data?.attributes?.name || 'Sin Tela';
            
            // Creamos un objeto para la sucursal si no existe
            if (!acc[branchId]) {
                acc[branchId] = {};
            }
            // Creamos un array para la tela (producto) si no existe
            if (!acc[branchId][fabricName]) {
                acc[branchId][fabricName] = [];
            }
            // Agregamos el rollo al array de la tela (producto)
            acc[branchId][fabricName].push(roll);
            return acc;
        }, {});
    };

    // Calcular estadísticas de ventas por sucursal
    const calculateSalesStats = (branchId) => {
        // Filtramos las ventas de la sucursal
        const branchSales = sales.filter(sale => 
            sale.attributes.branch?.data?.id === branchId
        );

        // Agrupamos las ventas por producto
        const salesByProduct = branchSales.reduce((acc, sale) => {
            sale.attributes.detail.forEach(item => {
                const fabricName = item.fabric?.data?.attributes?.name;
                if (fabricName) {
                    if (!acc[fabricName]) {
                        acc[fabricName] = {
                            quantity: 0,
                            revenue: 0,
                            count: 0
                        };
                    }
                    // Sumamos la cantidad de metros y el precio total de la venta
                    acc[fabricName].quantity += item.quantity_meterage || 0;
                    // Sumamos el precio total de la venta
                    acc[fabricName].revenue += (item.quantity_meterage * item.unit_price) || 0;
                    // Sumamos el número de ventas
                    acc[fabricName].count += 1;
                }
            });
            return acc;
        }, {});


        const totalSales = branchSales.length;
        const totalRevenue = branchSales.reduce((sum, sale) => 
            sum + sale.attributes.detail.reduce((detailSum, item) =>
                detailSum + (item.unit_price * item.quantity_meterage), 0
            ), 0
        );
        const averageSale = totalRevenue / totalSales;

        return {
            totalSales,
            totalRevenue,
            averageSale,
            salesByProduct
        };
    };

    const rollsByBranchAndFabric = groupRollsByBranchAndFabric(rolls);

    return (
        <Document>
            {branches.map((branch, index) => {
                const branchStats = calculateSalesStats(branch.id);
                const branchRolls = rollsByBranchAndFabric[branch.id] || {};

                return (
                    <Page key={index} size="A4" style={styles.page}>
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

                        <Text style={styles.title}>
                            REPORTE DE SUCURSAL: {branch.attributes.name.toUpperCase()}
                        </Text>

                        {/* Información básica */}
                        <View style={styles.branchInfo}>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Dirección:</Text>
                                <Text style={styles.value}>{branch.attributes.address}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Teléfono:</Text>
                                <Text style={styles.value}>{branch.attributes.phone}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Estado:</Text>
                                <Text style={styles.value}>{branch.attributes.status}</Text>
                            </View>
                        </View>

                        {/* Estadísticas de Ventas */}
                        {options.showSalesStats && (
                            <View style={styles.statsSection}>
                                <Text style={styles.sectionTitle}>ESTADÍSTICAS DE VENTAS</Text>
                                <View style={styles.statsGrid}>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Total Ventas</Text>
                                        <Text style={styles.statValue}>
                                            {branchStats.totalSales} ventas
                                        </Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Ingresos Totales</Text>
                                        <Text style={styles.statValue}>
                                            Bs. {branchStats.totalRevenue.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statLabel}>Venta Promedio</Text>
                                        <Text style={styles.statValue}>
                                            Bs. {branchStats.averageSale.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.topProducts}>
                                    <Text style={styles.subsectionTitle}>
                                        Productos Más Vendidos
                                    </Text>
                                    {Object.entries(branchStats.salesByProduct)
                                        .sort((a, b) => b[1].revenue - a[1].revenue)
                                        .slice(0, 5)
                                        .map(([product, data], idx) => (
                                            <View key={idx} style={styles.productRow}>
                                                <Text style={styles.productName}>{product}</Text>
                                                <Text style={styles.productStats}>
                                                    {data.quantity.toFixed(2)} metros | 
                                                    {data.count} ventas | 
                                                    Bs. {data.revenue.toFixed(2)}
                                                </Text>
                                            </View>
                                        ))}
                                </View>
                            </View>
                        )}

                        {/* Inventario Actual */}
                        {options.showInventory && (
                            <View style={styles.inventorySection}>
                                <Text style={styles.sectionTitle}>INVENTARIO ACTUAL</Text>
                                {Object.entries(branchRolls).map(([fabricName, fabricRolls], idx) => {
                                    const totals = fabricRolls.reduce((acc, roll) => ({
                                        total: acc.total + (roll.attributes.roll_footage || 0),
                                        available: acc.available + (
                                            roll.attributes.status === 'DISPONIBLE' ? 
                                            (roll.attributes.roll_footage || 0) : 0
                                        )
                                    }), { total: 0, available: 0 });

                                    return (
                                        <View key={idx} style={styles.fabricSection}>
                                            <View style={styles.fabricHeader}>
                                                <Text style={styles.fabricName}>{fabricName}</Text>
                                                <Text style={styles.fabricTotals}>
                                                    Total: {totals.total.toFixed(2)} metros | 
                                                    Disponible: {totals.available.toFixed(2)} metros
                                                </Text>
                                            </View>

                                            <View style={styles.inventoryTable}>
                                                {fabricRolls.map((roll, rollIdx) => (
                                                    <View key={rollIdx} style={styles.tableRow}>
                                                        <Text style={styles.col1}>{roll.attributes.code}</Text>
                                                        <Text style={styles.col2}>
                                                            {roll.attributes.color?.data?.attributes?.name}
                                                        </Text>
                                                        <Text style={styles.col3}>
                                                            {roll.attributes.roll_footage} {roll.attributes.unit}
                                                        </Text>
                                                        <Text style={[
                                                            styles.col4,
                                                            styles[roll.attributes.status.toLowerCase()]
                                                        ]}>
                                                            {roll.attributes.status}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        <Text style={styles.pageNumber}>
                            Página {index + 1} de {branches.length}
                        </Text>
                    </Page>
                );
            })}
        </Document>
    );
};

export { generateBranchReport };
 