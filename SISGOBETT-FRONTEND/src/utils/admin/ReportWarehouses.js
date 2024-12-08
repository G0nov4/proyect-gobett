import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import logo from '../../assets/Logo Gobett.png';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: '0.5in',
        size: 'LETTER'
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        borderBottom: 2,
        borderBottomColor: '#2c5282',
        paddingBottom: 15
    },
    logoSection: {
        width: 120,
        height: 40,
        objectFit: 'contain'
    },
    companyInfo: {
        fontSize: 8,
        textAlign: 'right'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2c5282',
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    subtitle: {
        fontSize: 10,
        color: '#4a5568',
        marginBottom: 15,
        textAlign: 'center'
    },
    reportInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        fontSize: 8,
        backgroundColor: '#f7fafc',
        padding: 8,
        borderRadius: 4
    },
    table: {
        display: 'table',
        width: 'auto',
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#bfbfbf'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#bfbfbf',
        minHeight: 25,
        alignItems: 'center'
    },
    tableHeader: {
        backgroundColor: '#f0f0f0'
    },
    tableCell: {
        padding: 5,
        fontSize: 8
    },
    summarySection: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f8f9fa'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: 'grey'
    },
    rollsSection: {
        marginTop: 20,
        borderTop: 1,
        borderColor: '#e2e8f0',
    },
    fabricGroup: {
        marginTop: 10,
        marginBottom: 15,
    },
    fabricHeader: {
        backgroundColor: '#f8fafc',
        padding: 8,
        marginBottom: 5,
    },
    fabricTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#2d3748',
    },
    rollsTable: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 5,
    },
    rollRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        minHeight: 20,
        alignItems: 'center',
    },
    rollCell: {
        fontSize: 8,
        padding: 4,
    },
    statusTag: {
        padding: '2 6',
        borderRadius: 4,
        fontSize: 8,
    },
    statusActive: {
        backgroundColor: '#C6F6D5',
        color: '#22543D',
    },
    statusInactive: {
        backgroundColor: '#FED7D7',
        color: '#822727',
    },
    statusPending: {
        backgroundColor: '#FEEBC8',
        color: '#744210',
    }
});

// Componente del reporte PDF
const WarehousesReport = ({ warehouses, title = "Reporte de Almacenes"}) => {
    const totalCapacity = warehouses?.data?.reduce((sum, warehouse) => 
        sum + (warehouse.attributes.capacity || 0), 0);
    const totalStock = warehouses?.data?.reduce((sum, warehouse) => 
        sum + (warehouse.attributes.current_stock || 0), 0);

    // Función para agrupar rollos por tela
    const groupRollsByFabric = (rolls) => {
        return rolls.reduce((acc, roll) => {
            const fabricCode = roll.attributes.code.substring(0, 5);
            if (!acc[fabricCode]) {
                acc[fabricCode] = {
                    fabric: roll.attributes.fabric?.data?.attributes,
                    rolls: []
                };
            }
            acc[fabricCode].rolls.push(roll);
            return acc;
        }, {});
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerSection}>
                    <Image 
                        style={styles.logoSection}
                        src={logo}
                    />
                    <View style={styles.companyInfo}>
                        <Text>GOBETT TEXTILES</Text>
                        <Text>La Paz - Bolivia</Text>
                        <Text>{new Date().toLocaleDateString()}</Text>
                    </View>
                </View>

                <Text style={styles.title}>{title}</Text>

                <View style={styles.reportInfo}>
                    <View>
                        <Text>Total Almacenes: {warehouses?.data?.length || 0}</Text>
                        <Text>Fecha: {new Date().toLocaleDateString()}</Text>
                    </View>
                    
                </View>

                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, { width: '25%' }]}>Nombre</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>Ubicación</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Stock Actual</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Estado</Text>
                        <Text style={[styles.tableCell, { width: '10%' }]}>Rollos</Text>
                        <Text style={[styles.tableCell, { width: '10%' }]}>Telas</Text>
                    </View>

                    {warehouses?.data?.map((warehouse) => {
                        const uniqueFabrics = new Set(
                            warehouse.attributes.rolls.data.map(roll => 
                                roll.attributes.code.substring(0, 5)
                            )
                        );
                        
                        return (
                            <View key={warehouse.id} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '25%' }]}>
                                    {warehouse.attributes.name}
                                </Text>
                                <Text style={[styles.tableCell, { width: '25%' }]}>
                                    {warehouse.attributes.address}
                                </Text>
                                <View style={[styles.tableCell, { width: '15%' }]}>
                                    <Text style={[
                                        styles.statusTag,
                                        warehouse.attributes.status === 'Activo' ? styles.statusActive :
                                        warehouse.attributes.status === 'Inactivo' ? styles.statusInactive :
                                        styles.statusPending
                                    ]}>
                                        {warehouse.attributes.status}
                                    </Text>
                                </View>
                                <Text style={[styles.tableCell, { width: '10%' }]}>
                                    {warehouse.attributes.rolls.data.length}
                                </Text>
                                <Text style={[styles.tableCell, { width: '10%' }]}>
                                    {uniqueFabrics.size}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Sección de Rollos */}
                {warehouses?.data?.map((warehouse) => (
                    <View key={warehouse.id} style={styles.rollsSection}>
                        <Text style={styles.subtitle}>
                            Inventario de Rollos - {warehouse.attributes.name}
                        </Text>

                        {Object.entries(groupRollsByFabric(warehouse.attributes.rolls.data)).map(([fabricCode, { fabric, rolls }]) => (
                            <View key={fabricCode} style={styles.fabricGroup}>
                                <View style={styles.fabricHeader}>
                                    <Text style={styles.fabricTitle}>
                                        {fabric?.name || 'Tela sin nombre'} - Código: {fabricCode}
                                    </Text>
                                    <Text style={{ fontSize: 8 }}>
                                        Total Rollos: {rolls.length}
                                    </Text>
                                </View>

                                <View style={styles.rollsTable}>
                                    <View style={[styles.rollRow, styles.tableHeader]}>
                                        <Text style={[styles.rollCell, { width: '25%' }]}>Código Rollo</Text>
                                        <Text style={[styles.rollCell, { width: '25%' }]}>Estado</Text>
                                        <Text style={[styles.rollCell, { width: '25%' }]}>Metraje</Text>
                                        <Text style={[styles.rollCell, { width: '25%' }]}>Fecha Ingreso</Text>
                                    </View>

                                    {rolls.map((roll) => (
                                        <View key={roll.id} style={styles.rollRow}>
                                            <Text style={[styles.rollCell, { width: '25%' }]}>
                                                {roll.attributes.code}
                                            </Text>
                                            <Text style={[styles.rollCell, { width: '25%' }]}>
                                                {roll.attributes.status}
                                            </Text>
                                            <Text style={[styles.rollCell, { width: '25%' }]}>
                                                {roll.attributes.roll_footage} {roll.attributes.unit}
                                            </Text>
                                            <Text style={[styles.rollCell, { width: '25%' }]}>
                                                {new Date(roll.attributes.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
                    
                <View style={styles.footer}>
                        <Text>Documento generado el {new Date().toLocaleString()}</Text>
                        <Text>GOBETT TEXTILES © {new Date().getFullYear()}</Text>
                    </View>
                </Page>
            </Document>
        );
};

// Componente para visualizar el PDF
export const WarehousesReportViewer = ({ warehouses, title, showSummary }) => (
    <PDFViewer style={{ width: '100%', height: '500px' }}>
        <WarehousesReport 
            warehouses={warehouses} 
            title={title}
            showSummary={showSummary}
        />
    </PDFViewer>
);

// Función para generar y descargar el PDF
export const generateAndDownloadWarehousesReport = async (warehouses, title = "Reporte de Almacenes") => {
    try {
        const blob = await pdf(<WarehousesReport warehouses={warehouses} title={title} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_almacenes_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generando el reporte:', error);
        throw error;
    }
};

// Función para generar e imprimir el PDF
export const generateAndPrintWarehousesReport = async (warehouses, title = "Reporte de Almacenes") => {
    try {
        const blob = await pdf(<WarehousesReport warehouses={warehouses} title={title} />).toBlob();
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
                URL.revokeObjectURL(url);
            };
        }
        return true;
    } catch (error) {
        console.error('Error generando el reporte:', error);
        throw error;
    }
};

export default WarehousesReport; 