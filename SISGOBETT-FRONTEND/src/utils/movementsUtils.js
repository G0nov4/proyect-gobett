import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// Extendemos dayjs con los plugins necesarios
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const groupAndSortPayments = (payments) => {
  const grouped = payments.reduce((acc, payment) => {
    const date = dayjs(payment.attributes.payment_date).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(payment);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => dayjs(b).diff(dayjs(a)));

  const result = [];
  sortedDates.forEach(date => {
    result.push({
      id: `header-${date}`,
      isHeader: true,
      date,
      attributes: {
        payment_date: date,
        totalAmount: grouped[date].reduce((sum, payment) => sum + payment.attributes.amount, 0)
      }
    });
    
    const sortedPayments = grouped[date].sort((a, b) => 
      dayjs(b.attributes.createdAt).diff(dayjs(a.attributes.createdAt))
    );
    result.push(...sortedPayments);
  });

  return result;
};

export const calculateTotalEarnings = (paymentsData) => {
  if (!paymentsData?.data) return 0;
  return paymentsData.data.reduce((total, payment) => {
    if (payment.attributes.status) {
      return total + (payment.attributes.amount || 0);
    }
    return total;
  }, 0);
};

export const calculateDailyTotal = (paymentsData) => {
  const today = dayjs().startOf('day');
  return paymentsData?.data?.reduce((total, payment) => {
    const paymentDate = dayjs(payment.attributes.payment_date);
    if (paymentDate.isSame(today, 'day')) {
      return total + (payment.attributes.amount || 0);
    }
    return total;
  }, 0) || 0;
};

export const getDailyTransactionsCount = (paymentsData) => {
  const today = dayjs().startOf('day');
  return paymentsData?.data?.filter(payment => 
    dayjs(payment.attributes.payment_date).isSame(today, 'day')
  ).length || 0;
};

export const calculateAverageTransaction = (paymentsData) => {
  const total = calculateDailyTotal(paymentsData);
  const count = getDailyTransactionsCount(paymentsData);
  return count > 0 ? total / count : 0;
};

export const getDateRange = (filterType) => {
  const now = dayjs();
  switch(filterType) {
    case 'day':
      return [now.startOf('day'), now.endOf('day')];
    case 'week':
      return [now.startOf('week'), now.endOf('week')];
    case 'month':
      return [now.startOf('month'), now.endOf('month')];
    case 'year':
      return [now.startOf('year'), now.endOf('year')];
    default:
      return [now.startOf('day'), now.endOf('day')];
  }
};

export const getFilteredPayments = (payments, dateRange) => {
  if (!dateRange || dateRange.length !== 2) return payments;
  
  const [start, end] = dateRange;
  return payments.filter(payment => {
    const paymentDate = dayjs(payment.attributes.payment_date);
    return paymentDate.isSameOrAfter(start, 'day') && 
           paymentDate.isSameOrBefore(end, 'day');
  });
};

export const calculateStats = (allPayments, dateRange) => {
  const filteredPayments = getFilteredPayments(allPayments, dateRange);
  const total = filteredPayments.reduce((sum, p) => sum + (p.attributes.amount || 0), 0);
  const count = filteredPayments.length;
  const average = count > 0 ? total / count : 0;
  const maxPayment = Math.max(...filteredPayments.map(p => p.attributes.amount || 0));
  
  return { total, count, average, maxPayment };
}; 