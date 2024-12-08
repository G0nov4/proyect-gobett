import dayjs from 'dayjs';

export const generatePaymentsReport = (payments, dateRange) => {
  if (!payments?.length) return '';

  const [startDate, endDate] = dateRange;
  const filteredPayments = payments.filter(payment => {
    const paymentDate = dayjs(payment.attributes.payment_date);
    return paymentDate.isAfter(startDate) && paymentDate.isBefore(endDate);
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => 
    sum + (payment.attributes.amount || 0), 0
  );

  return `
    <html>
      <head>
        <title>Reporte de Pagos</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 20px; }
          .summary { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Pagos</h1>
          <p>Período: ${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}</p>
        </div>
        
        <div class="summary">
          <h3>Resumen</h3>
          <p>Total de Pagos: ${filteredPayments.length}</p>
          <p>Total Ganancias: Bs. ${totalAmount.toFixed(2)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPayments.map(payment => `
              <tr>
                <td>${dayjs(payment.attributes.payment_date).format('DD/MM/YYYY HH:mm')}</td>
                <td>${payment.attributes.payment_type}</td>
                <td>${payment.attributes.client?.data?.attributes?.name || 'Cliente General'}</td>
                <td>Bs. ${payment.attributes.amount?.toFixed(2)}</td>
                <td>${payment.attributes.status ? 'Completado' : 'Pendiente'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

export const printReport = (reportContent) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(reportContent);
  printWindow.document.close();

  return new Promise((resolve) => {
    printWindow.onload = function() {
      printWindow.print();
      resolve();
    };
  });
}; 