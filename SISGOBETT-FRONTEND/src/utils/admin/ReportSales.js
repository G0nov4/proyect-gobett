import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Chart as ChartJS } from 'chart.js/auto';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  chart: {
    width: '100%',
    height: 200,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    width: '25%',
    padding: 5,
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
});

const SalesReport = ({ salesData }) => {
  // Función para generar la imagen de la gráfica
  const generateChartImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Configuración de la gráfica
    const chart = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: salesData?.data?.map(sale => 
          new Date(sale.attributes.createdAt).toLocaleDateString('es-ES')
        ) || [],
        datasets: [{
          label: 'Ventas Diarias',
          data: salesData?.data?.map(sale => sale.attributes.total_sale) || [],
          borderColor: '#8884d8',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        animation: false // Importante: deshabilitar animaciones
      }
    });

    // Convertir a imagen base64
    return canvas.toDataURL();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Reporte de Ventas</Text>
          
          {/* Gráfica */}
          <Image 
            style={styles.chart} 
            src={generateChartImage()} 
          />

          {/* Tabla de ventas */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}>
                <Text>Fecha</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>Cliente</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>Total</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>Estado</Text>
              </View>
            </View>
            
            {salesData?.data?.map((sale, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>
                    {new Date(sale.attributes.createdAt).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>
                    {sale.attributes.client?.data?.attributes?.name || 'Cliente General'}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>
                    Bs. {Number(sale.attributes.total_sale).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>
                    {sale.attributes.status ? 'Completado' : 'Pendiente'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SalesReport; 