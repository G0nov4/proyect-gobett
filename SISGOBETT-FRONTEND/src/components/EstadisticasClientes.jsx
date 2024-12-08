import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { ventasService } from '../services/ventasService';
import './EstadisticasClientes.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EstadisticasClientes = () => {
  const [estadisticas, setEstadisticas] = useState({
    clientesFrecuentes: [],
    comprasMensuales: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarYProcesarDatos = async () => {
      try {
        const ventas = await ventasService.getVentas();
        const estadisticasProcesadas = procesarDatos(ventas);
        setEstadisticas(estadisticasProcesadas);
      } catch (error) {
        console.error('Error al cargar ventas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarYProcesarDatos();
  }, []);

  const procesarDatos = (ventas) => {
    // Procesar clientes frecuentes
    const clientesMap = new Map();
    ventas.forEach(venta => {
      const { clienteId, clienteNombre } = venta;
      if (!clientesMap.has(clienteId)) {
        clientesMap.set(clienteId, { nombre: clienteNombre, compras: 0 });
      }
      clientesMap.get(clienteId).compras += 1;
    });

    const clientesFrecuentes = Array.from(clientesMap.values())
      .sort((a, b) => b.compras - a.compras)
      .slice(0, 5); // Top 5 clientes

    // Procesar compras mensuales
    const comprasPorMes = ventas.reduce((acc, venta) => {
      const fecha = new Date(venta.fecha);
      const mes = fecha.toLocaleString('es-ES', { month: 'long' });
      if (!acc[mes]) {
        acc[mes] = 0;
      }
      acc[mes] += venta.total;
      return acc;
    }, {});

    // Convertir a array y ordenar por mes
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const comprasMensuales = Object.entries(comprasPorMes)
      .sort((a, b) => meses.indexOf(a[0]) - meses.indexOf(b[0]))
      .map(mes => ({ mes: meses[meses.indexOf(mes[0])], total: mes[1] }));

    return {
      clientesFrecuentes,
      comprasMensuales
    };
  };

  return (
    <div className="estadisticas-clientes">
      {/* Renderizar los gráficos aquí */}
    </div>
  );
};

export default EstadisticasClientes; 