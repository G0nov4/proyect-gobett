import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import logo from '../../assets/Logo Gobett.png';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#fff'
  },
  coverHeader: {
    alignItems: 'center',
    marginBottom: 60
  },
  coverLogo: {
    width: 150,
    marginBottom: 20
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  coverContent: {
    alignItems: 'center'
  },
  reportTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a73e8'
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: '2pt solid #1a73e8',
    paddingBottom: 20
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginRight: 20
  },
  headerText: {
    flex: 1
  },
  headerTitle: {
    fontSize: 16,
    color: '#666'
  },
  headerSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  headerDetails: {
    fontSize: 12,
    color: '#666'
  },
  tableContainer: {
    marginTop: 20
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a73e8'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a73e8',
    padding: 10,
    marginBottom: 1
  },
  headerCell: {
    flex: 1,
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottom: '1pt solid #dee2e6',
    padding: 8
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
    color: '#2c3e50'
  },
  colorRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 20
  },
  colorCell: {
    flex: 1,
    fontSize: 9,
    color: '#666',
    textAlign: 'center'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1pt solid #dee2e6',
    paddingTop: 10
  },
  footerText: {
    fontSize: 8,
    color: '#666'
  }
});

const SupplierReport = ({ suppliers }) => {
  return (
    <Document>

      {/* Páginas de proveedores */}
      {suppliers.map((supplier, index) => (
        <Page key={supplier.id} size="LETTER" style={styles.page}>
          {/* Encabezado de página */}
          <View style={styles.pageHeader}>
            <Image src={supplier.logo || logo} style={styles.headerLogo} />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Reporte de proovedor</Text>
              <Text style={styles.headerSubtitle}>{supplier.name}</Text>
              <Text style={styles.headerDetails}>
                {supplier.city}, {supplier.country} | {supplier.phone}
              </Text>
            </View>
          </View>

          {/* Tabla de Inventario */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Inventario de Telas</Text>
            
            {/* Cabecera de la tabla */}
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Tela</Text>
              <Text style={styles.headerCell}>Código</Text>
              <Text style={styles.headerCell}>Metros</Text>
              <Text style={styles.headerCell}>Costo/m</Text>
              <Text style={styles.headerCell}>Total USD</Text>
            </View>

            {/* Filas de telas */}
            {supplier.fabrics.map((fabric) => {
              const totalMeters = fabric.rolls.data.reduce(
                (acc, roll) => acc + roll.attributes.roll_footage, 
                0
              );
              
              return (
                <View key={fabric.id}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{fabric.name}</Text>
                    <Text style={styles.tableCell}>{fabric.code}</Text>
                    <Text style={styles.tableCell}>{totalMeters}</Text>
                    <Text style={styles.tableCell}>${fabric.cost}</Text>
                    <Text style={styles.tableCell}>${(totalMeters * fabric.cost).toFixed(2)}</Text>
                  </View>
                  
                  {/* Subfilas de colores */}
                  {Object.entries(fabric.rolls.data.reduce((colors, roll) => {
                    const colorName = roll.attributes.color.data.attributes.name;
                    if (!colors[colorName]) {
                      colors[colorName] = {
                        rolls: 0,
                        meters: 0
                      };
                    }
                    colors[colorName].rolls++;
                    colors[colorName].meters += roll.attributes.roll_footage;
                    return colors;
                  }, {})).map(([color, stats]) => (
                    <View key={color} style={styles.colorRow}>
                      <Text style={styles.colorCell}>{color}</Text>
                      <Text style={styles.colorCell}>{stats.rolls} rollos</Text>
                      <Text style={styles.colorCell}>{stats.meters} metros</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>

          {/* Pie de página */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Página {index + 1} de {suppliers.length}</Text>
            <Text style={styles.footerText}>Generado el {new Date().toLocaleDateString()}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export const generateAndPrintSupplierReport = async (suppliers) => {
  try {
    const blob = await pdf(<SupplierReport suppliers={suppliers} />).toBlob();
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

export default SupplierReport;
