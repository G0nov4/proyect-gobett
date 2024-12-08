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
    saleInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        fontSize: 9,
    },
    saleNumber: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
        padding: 5,
        marginVertical: 0,
    },
    clientInfo: {
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        marginVertical: 2,
    },
    label: {
        width: '25%',
        fontWeight: 'bold',
    },
    value: {
        width: '75%',
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
    },
    col1: { width: '30%' },
    col2: { width: '20%' },
    col3: { width: '25%' },
    col4: { width: '25%' },
    paymentSection: {
        marginVertical: 10,
    },
    paymentRow: {
        flexDirection: 'row',
        marginVertical: 3,
        fontSize: 9,
    },
    totals: {
        marginLeft: 'auto',
        width: '40%',
        marginVertical: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2,
    },
    boldTotal: {
        fontWeight: 'bold',
    },
    signatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 50,
    },
    signatureLine: {
        width: '40%',
        borderTopWidth: 1,
        paddingTop: 5,
        textAlign: 'center',
        fontSize: 9,
    },
    terms: {
        fontSize: 8,
        marginTop: 30,
        color: '#666',
    }
});

const calculateTotal = (details) => {
    return details.reduce((sum, item) => 
        sum + (item.quantity_meterage * item.unit_price), 0
    );
};

export const generateSaleReport = (sale) => {
    const total = calculateTotal(sale.attributes.detail);
    const payments = sale.attributes.payments?.data || [];
    const totalPagado = payments.reduce((sum, payment) => 
        sum + (payment.attributes?.amount || 0), 0);

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Encabezado */}
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

                <Text style={styles.title}>REPORTE DE VENTA</Text>

                {/* Información de la Venta */}
                <View style={styles.saleInfo}>
                    <Text style={styles.saleNumber}>VENTA #{sale.id}</Text>
                    <Text>Fecha: {new Date(sale.attributes.createdAt).toLocaleDateString()}</Text>
                    <Text>Estado: {sale.attributes.status ? 'COMPLETADO' : 'PENDIENTE'}</Text>
                </View>

                {/* Información del Cliente */}
                <Text style={styles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>
                <View style={styles.clientInfo}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Cliente:</Text>
                        <Text style={styles.value}>{sale.attributes?.client?.data?.attributes?.name || 'Cliente Natural'}</Text>
                    </View>
                   
                    <View style={styles.row}>
                        <Text style={styles.label}>Teléfono:</Text>
                        <Text style={styles.value}>{sale.attributes?.client?.data?.attributes?.phone_1}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tipo de Entrega:</Text>
                        <Text style={styles.value}>{sale.attributes?.delivery}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha de Entrega:</Text>
                        <Text style={styles.value}>
                            {sale.attributes?.delivery_date ? 
                                new Date(sale.attributes.delivery_date).toLocaleDateString() : 
                                'Inmediata'}
                        </Text>
                    </View>
                    {sale.attributes.address && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Dirección:</Text>
                            <Text style={styles.value}>{sale.attributes.address}</Text>
                        </View>
                    )}
                </View>

                {/* Detalle de Productos */}
                <Text style={styles.sectionTitle}>DETALLE DE PRODUCTOS</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Producto</Text>
                        <Text style={styles.col2}>Color</Text>
                        <Text style={styles.col3}>Cantidad</Text>
                        <Text style={styles.col4}>Precio Unit.</Text>
                        <Text style={styles.col5}>Total</Text>
                    </View>
                    {sale.attributes.detail.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.col1}>
                                {item.fabric?.data?.attributes?.name}
                                {item.roll_code && ' (ROLLO)'}
                            </Text>
                            <Text style={styles.col2}>
                                {item.color?.data?.attributes?.name}
                            </Text>
                            <Text style={styles.col3}>
                                {item.quantity_meterage} mts
                            </Text>
                            <Text style={styles.col4}>
                                Bs. {item.unit_price.toFixed(2)}
                            </Text>
                            <Text style={styles.col5}>
                                Bs. {(item.quantity_meterage * item.unit_price).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Historial de Pagos */}
                <Text style={styles.sectionTitle}>HISTORIAL DE PAGOS</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Fecha</Text>
                        <Text style={styles.col3}>Monto</Text>
                        <Text style={styles.col4}>Nota</Text>
                    </View>
                    {payments.length > 0 ? (
                        payments.map((payment, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.col1}>
                                    {new Date(payment.attributes.createdAt).toLocaleDateString()}
                                </Text>
                                <Text style={styles.col3}>
                                    Bs. {payment.attributes.amount.toFixed(2)}
                                </Text>
                                <Text style={styles.col4}>
                                    {payment.attributes.note || '-'}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.tableRow}>
                            <Text style={{ ...styles.col1, fontStyle: 'italic', color: '#666' }}>
                                No se han registrado pagos
                            </Text>
                        </View>
                    )}
                    
                    {/* Resumen de Pagos */}
                    <View style={[styles.tableRow, { borderTopWidth: 2, marginTop: 5 }]}>
                        <Text style={[styles.col1, styles.boldTotal]}>Total Pagado:</Text>
                        <Text style={[styles.col2, styles.boldTotal]}></Text>
                        <Text style={[styles.col3, styles.boldTotal]}>
                            Bs. {totalPagado.toFixed(2)}
                        </Text>
                        <Text style={styles.col4}></Text>
                    </View>
                </View>

                {/* Totales */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text>Subtotal:</Text>
                        <Text>Bs. {total.toFixed(2)}</Text>
                    </View>
                    {sale.attributes.promo?.data && (
                        <View style={styles.totalRow}>
                            <Text>Descuento:</Text>
                            <Text>Bs. {sale.attributes.promo.data.attributes.discount}</Text>
                        </View>
                    )}
                    <View style={[styles.totalRow, styles.boldTotal]}>
                        <Text>TOTAL:</Text>
                        <Text>Bs. {total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text>Total Pagado:</Text>
                        <Text>Bs. {totalPagado.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.boldTotal]}>
                        <Text>Saldo Pendiente:</Text>
                        <Text>Bs. {(total - totalPagado).toFixed(2)}</Text>
                    </View>
                </View>

                {/* Firmas */}
                <View style={styles.signatures}>
                    <View style={styles.signatureLine}>
                        <Text>Firma Cliente</Text>
                    </View>
                    <View style={styles.signatureLine}>
                        <Text>Autorizado por</Text>
                    </View>
                </View>

                {/* Términos y Condiciones */}
                <View style={styles.terms}>
                    <Text>TÉRMINOS Y CONDICIONES:</Text>
                    <Text>1. Los precios incluyen impuestos según normativa vigente.</Text>
                    <Text>2. No se aceptan devoluciones después de 30 días de la compra.</Text>
                    <Text>3. Este documento es válido para fines administrativos y contables.</Text>
                    <Text>4. Documento generado el {new Date().toLocaleString()}</Text>
                </View>
            </Page>
        </Document>
    );
}; 