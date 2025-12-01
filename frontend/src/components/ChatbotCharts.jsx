// src/components/ChatbotCharts.jsx
/**
 * ChatbotCharts - Componentes de gráficos para el chatbot
 * Muestra visualizaciones de datos cuando el chatbot devuelve información estructurada
 */

import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Colores consistentes para los gráficos
const COLORS = {
  primary: 'rgba(79, 70, 229, 0.8)',
  primaryLight: 'rgba(79, 70, 229, 0.2)',
  success: 'rgba(34, 197, 94, 0.8)',
  warning: 'rgba(251, 146, 60, 0.8)',
  danger: 'rgba(239, 68, 68, 0.8)',
  info: 'rgba(59, 130, 246, 0.8)',
  purple: 'rgba(168, 85, 247, 0.8)',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.purple,
  'rgba(236, 72, 153, 0.8)',
  'rgba(14, 165, 233, 0.8)',
];

// Opciones por defecto para todos los gráficos
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        font: {
          size: 12,
        },
      },
    },
  },
};

/**
 * Gráfico de línea para tendencias temporales (ventas por mes, etc.)
 */
export function LineChart({ data, title }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.label || 'Datos',
        data: data.values,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      },
    },
  };

  return (
    <div style={{ height: '300px', marginTop: '15px', marginBottom: '15px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

/**
 * Gráfico de barras para comparaciones (productos más vendidos, etc.)
 */
export function BarChart({ data, title, horizontal = false }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.label || 'Datos',
        data: data.values,
        backgroundColor: data.values.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderRadius: 5,
      },
    ],
  };

  const options = {
    ...defaultOptions,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      ...defaultOptions.plugins,
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      [horizontal ? 'x' : 'y']: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return data.format === 'currency' ? '$' + value.toLocaleString() : value;
          }
        }
      },
    },
  };

  return (
    <div style={{ height: '300px', marginTop: '15px', marginBottom: '15px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

/**
 * Gráfico de pie/torta para distribuciones (categorías, estado de órdenes, etc.)
 */
export function PieChart({ data, title }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: data.labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${data.format === 'currency' ? '$' + value.toLocaleString() : value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: '300px', marginTop: '15px', marginBottom: '15px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}

/**
 * Componente principal que detecta el tipo de gráfico a mostrar
 */
export function ChatbotChart({ chartData }) {
  if (!chartData || !chartData.type) {
    return null;
  }

  switch (chartData.type) {
    case 'line':
      return <LineChart data={chartData.data} title={chartData.title} />;
    case 'bar':
      return <BarChart data={chartData.data} title={chartData.title} horizontal={chartData.horizontal} />;
    case 'pie':
      return <PieChart data={chartData.data} title={chartData.title} />;
    default:
      return null;
  }
}

/**
 * Función helper para detectar si una respuesta del chatbot contiene datos visualizables
 * Busca patrones en el texto como listas de productos, ventas por mes, etc.
 */
export function extractChartableData(message) {
  // Buscar patrones de datos que puedan graficarse
  const patterns = {
    // "Producto: X unidades, $Y" o "Mes: $X"
    salesByProduct: /•\s*([^:]+):\s*(\d+)\s*unidades.*?\$([0-9,]+)/gi,
    monthlyRevenue: /([A-Za-z]+\s+\d{4}):\s*\$([0-9,]+)/gi,
    orderStatus: /(completadas?|pendientes?|canceladas?):\s*(\d+)/gi,
  };

  // Intentar extraer ventas por producto
  const productMatches = [...message.matchAll(patterns.salesByProduct)];
  if (productMatches.length >= 3) {
    return {
      type: 'bar',
      title: 'Productos más vendidos',
      data: {
        labels: productMatches.map(m => m[1].trim()),
        values: productMatches.map(m => parseInt(m[3].replace(/,/g, ''))),
        label: 'Ingresos',
        format: 'currency',
      },
    };
  }

  // Intentar extraer ingresos mensuales
  const monthMatches = [...message.matchAll(patterns.monthlyRevenue)];
  if (monthMatches.length >= 2) {
    return {
      type: 'line',
      title: 'Ingresos por mes',
      data: {
        labels: monthMatches.map(m => m[1]),
        values: monthMatches.map(m => parseInt(m[2].replace(/,/g, ''))),
        label: 'Ingresos ($)',
      },
    };
  }

  // Intentar extraer estado de órdenes
  const statusMatches = [...message.matchAll(patterns.orderStatus)];
  if (statusMatches.length >= 2) {
    return {
      type: 'pie',
      title: 'Estado de órdenes',
      data: {
        labels: statusMatches.map(m => m[1].charAt(0).toUpperCase() + m[1].slice(1)),
        values: statusMatches.map(m => parseInt(m[2])),
        format: 'number',
      },
    };
  }

  return null;
}
