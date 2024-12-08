import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../assets/Logo Gobett.png';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
    },
    thermalPage: {
        width: '80mm',
        padding: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 100,
        height: 80,
        marginBottom: 5,
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    companyInfo: {
        fontSize: 8,
        color: '#444',
        marginBottom: 2,
    },
    divider: {
        borderBottom: '1 dotted #000',
        marginVertical: 8,
    },
    ticketType: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 5,
        textTransform: 'uppercase',
    },
    clientInfo: {
        fontSize: 9,
        marginVertical: 5,
    },
    productContainer: {
        marginVertical: 4,
    },
    fabricName: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    colorInfo: {
        fontSize: 8,
        marginLeft: 10,
        color: '#444',
    },
    rollInfo: {
        fontSize: 8,
        marginLeft: 10,
        fontStyle: 'italic',
        color: '#666',
    },
    meterage: {
        fontSize: 9,
        textAlign: 'right',
        marginTop: 2,
    },
    totalsSection: {
        marginVertical: 5,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 9,
        marginVertical: 2,
    },
    boldTotal: {
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 10,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 8,
        textAlign: 'center',
        marginBottom: 2,
        color: '#444',
    },
    slogans: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        color: '#1a1a1a',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 9,
        marginBottom: 2,
    },
    clientName: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    clientPhone: {
        fontSize: 8,
        color: '#666',
    },
    totals: {
        marginTop: 5,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 9,
        marginBottom: 2,
    },
    footer: {
        marginTop: 10,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 8,
        textAlign: 'center',
        marginBottom: 2,
        color: '#666',
    },
    slogans: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        color: '#1a1a1a',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 9,
        marginBottom: 2,
    },
    clientInfo: {
        marginVertical: 8,
    },
    clientName: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    clientPhone: {
        fontSize: 8,
        color: '#666',
    },
    totalsSection: {
        marginTop: 5,
    },
    clientSection: {
        marginVertical: 3,
    },
    clientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
    },
    clientLabel: {
        color: '#666',
        width: '30%',
    },
    clientValue: {
        width: '70%',
        textAlign: 'right',
    },
    productContainer: {
        marginVertical: 2,
    },
    softDivider: {
        borderBottom: '0.5 dotted #ccc',
        marginVertical: 2,
    },
    fabricName: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    colorInfo: {
        fontSize: 8,
        color: '#444',
        marginTop: 1,
    },
    rollInfo: {
        fontSize: 8,
        fontStyle: 'italic',
        color: '#666',
        marginTop: 1,
    },
    meterage: {
        fontSize: 9,
        textAlign: 'right',
        marginTop: 1,
    },
    saleHeader: {
        alignItems: 'center',
        marginBottom: 5,
    },
    saleInfo: {
        fontSize: 9,
        textAlign: 'center',
        marginTop: 2,
    },
    clientSection: {
        marginVertical: 3,
    },
    clientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        marginVertical: 1,
    },
});

const calculateTotal = (details) => {
    return details.reduce((sum, item) => 
        sum + (item.quantity_meterage * item.unit_price), 0
    );
};

export const generateSaleTicket = (sale, format = 'thermal') => {
    const total = calculateTotal(sale.attributes.detail);
    const payments = sale.attributes.payments?.data || [];
    const totalPagado = payments.reduce((sum, payment) => 
        sum + (payment.attributes?.amount || 0), 0);

    const TicketContent = ({ isCopy }) => (
        <>
            <View style={styles.header}>
                <Image src={logo} style={styles.logo} />
                <Text style={styles.companyName}>GOBETT MODAS</Text>
                <Text style={styles.companyInfo}>Av. América #xxx - La Paz, Bolivia</Text>
                <Text style={styles.companyInfo}>Teléfono: +591 2 XXXXXX</Text>
                <Text style={styles.companyInfo}>NIT: XXXXXXXXX</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.saleHeader}>
                <Text style={styles.ticketType}>
                    {isCopy ? 'COPIA CLIENTE' : 'ORIGINAL'}
                </Text>
                <Text style={styles.saleInfo}>
                    Venta #{sale.id}
                </Text>
                <Text style={styles.saleInfo}>
                    Fecha: {new Date(sale.attributes.createdAt).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.clientSection}>
                <View style={styles.clientRow}>
                    <Text style={styles.clientLabel}>Cliente:</Text>
                    <Text style={styles.clientValue}>
                        {sale.attributes.client?.data?.attributes?.name || 'S/N'}
                    </Text>
                </View>
                <View style={styles.clientRow}>
                    <Text style={styles.clientLabel}>Tipo Entrega:</Text>
                    <Text style={styles.clientValue}>
                        {sale.attributes.delivery}
                    </Text>
                </View>
                <View style={styles.clientRow}>
                    <Text style={styles.clientLabel}>Fecha Entrega:</Text>
                    <Text style={styles.clientValue}>
                        {sale.attributes.delivery_date ? 
                            new Date(sale.attributes.delivery_date).toLocaleDateString() : 
                            'hoy'}
                    </Text>
                </View>
                {sale.attributes.address && (
                    <View style={styles.clientRow}>
                        <Text style={styles.clientLabel}>Dirección:</Text>
                        <Text style={styles.clientValue}>
                            {sale.attributes.address}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            {sale.attributes.detail.map((item, index) => (
                <View key={index}>
                    <View style={styles.productContainer}>
                        <Text style={styles.fabricName}>
                            {item.fabric.data.attributes.name}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.colorInfo}>
                                #{item.color.data.attributes.code} - {item.color.data.attributes.name}
                                {item.is_roll && ' (ROLLO)'}
                            </Text>
                            <Text style={styles.meterage}>
                                {item.quantity_meterage} mts
                            </Text>
                        </View>
                    </View>
                    {index < sale.attributes.detail.length - 1 && (
                        <View style={styles.softDivider} />
                    )}
                </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                    <Text>Subtotal:</Text>
                    <Text>Bs. {total.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.boldTotal]}>
                    <Text>TOTAL:</Text>
                    <Text>Bs. {total.toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                    <Text>Pagado:</Text>
                    <Text>Bs. {totalPagado.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.boldTotal]}>
                    <Text>Saldo:</Text>
                    <Text>Bs. {(total - totalPagado).toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
                <Text style={styles.footerText}>¡Gracias por su preferencia!</Text>
                <Text style={styles.footerText}>
                    {isCopy ? 
                        'Documento válido para reclamos por 30 días' : 
                        'Documento interno - No válido para reclamos'}
                </Text>
                <Text style={styles.footerText}>
                    GOBETT MODAS - Calidad y Estilo
                </Text>
                <Text style={styles.footerText}>
                    {new Date().toLocaleString()}
                </Text>
            </View>
        </>
    );

    return (
        <Document>
            <Page size={format === 'thermal' ? [226, 'auto'] : 'LETTER'} 
                  style={format === 'thermal' ? styles.thermalPage : styles.page}>
                <TicketContent isCopy={false} />
            </Page>
            <Page size={format === 'thermal' ? [226, 'auto'] : 'LETTER'} 
                  style={format === 'thermal' ? styles.thermalPage : styles.page}>
                <TicketContent isCopy={true} />
            </Page>
        </Document>
    );
}; 