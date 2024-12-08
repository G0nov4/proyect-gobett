import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import logo from '../../assets/Logo Gobett.png';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: '0.5in', // Márgenes estándar de carta (0.5 pulgadas)
        size: 'LETTER' // Tamaño carta
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
        width: 120, // Logo más pequeño para carta
        height: 40,
        objectFit: 'contain'
    },
    companyInfo: {
        fontSize: 8, // Texto más pequeño
        textAlign: 'right'
    },
    title: {
        fontSize: 18, // Título más pequeño
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
        marginTop: 8,
        borderRadius: 4,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2c5282',
        color: '#ffffff'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        minHeight: 25, // Altura de fila más pequeña
        alignItems: 'center'
    },
    tableCol: {
        width: '16.66%',
        padding: 4, // Padding más pequeño
        fontSize: 8
    },
    tableCell: {
        fontSize: 8,
        color: '#4a5568'
    },
    headerCell: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#ffffff',
        padding: 4
    },
    footer: {
        position: 'absolute',
        bottom: '0.5in',
        left: '0.5in',
        right: '0.5in',
        fontSize: 7,
        textAlign: 'center',
        color: '#718096',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 8
    },
    pageNumber: {
        position: 'absolute',
        bottom: '0.5in',
        right: '0.5in',
        fontSize: 7,
        color: '#718096'
    }
});

const ClientsPDF = ({ clients }) => {
    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Encabezado con Logo e Información de la Empresa */}
                <View style={styles.headerSection}>
                    <Image style={styles.logoSection} src={logo} />
                    <View style={styles.companyInfo}>
                        <Text>EMPRESA XYZ S.R.L.</Text>
                        <Text>Av. Principal #123</Text>
                        <Text>La Paz, Bolivia</Text>
                        <Text>Tel: +591 2 1234567</Text>
                        <Text>Email: info@empresa.com</Text>
                    </View>
                </View>

                {/* Título del Reporte */}
                <Text style={styles.title}>Reporte de Clientes</Text>
                <Text style={styles.subtitle}>Listado completo de clientes registrados</Text>

                {/* Información del Reporte */}
                <View style={styles.reportInfo}>
                    <Text>Fecha de generación: {today}</Text>
                    <Text>Total de clientes: {clients.data.length}</Text>
                </View>

                {/* Tabla de Clientes */}
                <View style={styles.table}>
                    {/* Encabezados */}
                    <View style={styles.tableHeader}>
                        <View style={styles.tableCol}>
                            <Text style={styles.headerCell}>ID</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.headerCell}>Nombre</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.headerCell}>Apellido</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.headerCell}>Teléfono</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.headerCell}>Ciudad</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.headerCell}>Tipo</Text>
                        </View>
                    </View>

                    {/* Datos */}
                    {clients.data.map((client, index) => (
                        <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#f7fafc' : '#ffffff' }]} key={client.id}>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{client.id}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{client.attributes.name || '-'}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{client.attributes.last_name || '-'}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>
                                    {client.attributes.phone_1}
                                    {client.attributes.phone_2 && `\n${client.attributes.phone_2}`}
                                </Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{client.attributes.city || '-'}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{client.attributes.kind_of_client || '-'}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Pie de Página */}
                <Text style={styles.footer}>
                    Este documento es confidencial y contiene información privada de la empresa.
                    Generado automáticamente por el sistema de gestión.
                </Text>

                {/* Número de Página */}
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `Página ${pageNumber} de ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};

export const generateClientReport = (clients) => {
    return (
        <PDFViewer style={{ width: '100%', height: '100%' }}>
            <ClientsPDF clients={clients} />
        </PDFViewer>
    );
};