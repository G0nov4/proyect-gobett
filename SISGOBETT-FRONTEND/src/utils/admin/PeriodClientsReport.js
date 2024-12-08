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
    summarySection: {
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
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#cccccc',
        padding: 8,
        backgroundColor: '#ffffff',
    },
    col1: { width: '35%' },  // Cliente
    col2: { width: '15%' },  // Tipo
    col3: { width: '15%' },  // Compras
    col4: { width: '35%', textAlign: 'right' },  // Total Gastado
    
    clientTypeTag: {
        padding: 4,
        borderRadius: 4,
        fontSize: 8,
        textAlign: 'center',
    },
    normalType: {
        backgroundColor: '#e6f7ff',
        color: '#1890ff',
    },
    mayorType: {
        backgroundColor: '#f6ffed',
        color: '#52c41a',
    },
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
    }
});

const generatePeriodClientsReport = ({ sales }) => {
    // Procesar datos y calcular estadísticas
    const clientStats = sales.reduce((acc, sale) => {
        const clientName = sale.attributes.client?.data?.attributes?.name || 'Cliente General';
        const clientType = sale.attributes.client?.data?.attributes?.kind_of_client || 'NORMAL';
        const total = sale.attributes.detail.reduce((sum, item) => 
            sum + (item.quantity_meterage * item.unit_price), 0);

        if (!acc[clientName]) {
            acc[clientName] = {
                purchases: 0,
                totalSpent: 0,
                type: clientType
            };
        }

        acc[clientName].purchases++;
        acc[clientName].totalSpent += total;

        return acc;
    }, {});

    const sortedClients = Object.entries(clientStats)
        .map(([name, stats]) => ({
            name,
            ...stats
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent);

    const totalClients = sortedClients.length;
    const totalPurchases = sortedClients.reduce((sum, client) => sum + client.purchases, 0);
    const totalRevenue = sortedClients.reduce((sum, client) => sum + client.totalSpent, 0);

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

                <Text style={styles.title}>REPORTE DE CLIENTES FRECUENTES</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Clientes</Text>
                        <Text style={styles.statValue}>{totalClients}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Compras</Text>
                        <Text style={styles.statValue}>{totalPurchases}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Ingresos</Text>
                        <Text style={styles.statValue}>Bs. {totalRevenue.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Cliente</Text>
                        <Text style={styles.col2}>Tipo</Text>
                        <Text style={styles.col3}>Compras</Text>
                        <Text style={styles.col4}>Total Gastado</Text>
                    </View>

                    {sortedClients.map((client, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.col1}>{client.name}</Text>
                            <View style={styles.col2}>
                                <View style={[
                                    styles.clientTypeTag,
                                    client.type === 'MAYOR' ? styles.mayorType : styles.normalType
                                ]}>
                                    <Text>{client.type}</Text>
                                </View>
                            </View>
                            <Text style={styles.col3}>{client.purchases}</Text>
                            <Text style={styles.col4}>
                                Bs. {client.totalSpent.toFixed(2)}
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

export { generatePeriodClientsReport }; 