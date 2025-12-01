// src/utils/pdfExporter.js
/**
 * Utilidad para exportar reportes del chatbot a PDF
 * Genera PDFs con análisis y estadísticas
 */

/**
 * Genera un PDF simple con el contenido del análisis
 * @param {string} content - Contenido del reporte
 * @param {object} data - Datos adicionales (ventas, productos, etc.)
 * @param {string} storeName - Nombre de la tienda
 */
export function generatePDFReport(content, data = {}, storeName = 'Mi Tienda') {
  // Crear contenido HTML para el PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Análisis - ${storeName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #4F46E5;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #4F46E5;
          margin: 0 0 10px 0;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .content {
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .section {
          margin: 30px 0;
          padding: 20px;
          background: #f9fafb;
          border-left: 4px solid #4F46E5;
          border-radius: 4px;
        }
        .section h2 {
          margin-top: 0;
          color: #1f2937;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .stat-card {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .stat-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #4F46E5;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #9ca3af;
          font-size: 12px;
        }
        ul {
          list-style: none;
          padding-left: 0;
        }
        li {
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        li:last-child {
          border-bottom: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Reporte de Análisis</h1>
        <p><strong>${storeName}</strong></p>
        <p>Fecha: ${new Date().toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      ${data.summary ? `
      <div class="section">
        <h2>Resumen Ejecutivo</h2>
        <div class="stats">
          ${data.summary.totalRevenue !== undefined ? `
          <div class="stat-card">
            <div class="stat-label">Ingresos Totales</div>
            <div class="stat-value">$${data.summary.totalRevenue.toLocaleString()}</div>
          </div>
          ` : ''}
          ${data.summary.totalOrders !== undefined ? `
          <div class="stat-card">
            <div class="stat-label">Total Órdenes</div>
            <div class="stat-value">${data.summary.totalOrders}</div>
          </div>
          ` : ''}
          ${data.summary.totalProducts !== undefined ? `
          <div class="stat-card">
            <div class="stat-label">Total Productos</div>
            <div class="stat-value">${data.summary.totalProducts}</div>
          </div>
          ` : ''}
          ${data.summary.avgOrderValue !== undefined ? `
          <div class="stat-card">
            <div class="stat-label">Ticket Promedio</div>
            <div class="stat-value">$${Math.round(data.summary.avgOrderValue).toLocaleString()}</div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h2>Análisis Detallado</h2>
        <div class="content">${formatContentForPDF(content)}</div>
      </div>

      ${data.topProducts && data.topProducts.length > 0 ? `
      <div class="section">
        <h2>Top 5 Productos</h2>
        <ul>
          ${data.topProducts.map(p => `
            <li>
              <strong>${p.name}</strong> - 
              ${p.unitsSold} unidades - 
              $${p.revenue.toLocaleString()}
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      ${data.alerts && data.alerts.length > 0 ? `
      <div class="section">
        <h2>⚠️ Alertas Importantes</h2>
        <ul>
          ${data.alerts.map(alert => `<li>${alert}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <div class="footer">
        <p>Reporte generado por Vitrinex - Sistema de Gestión Empresarial</p>
        <p>© ${new Date().getFullYear()} Vitrinex. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `;

  // Crear un Blob con el contenido HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Abrir en nueva ventana para imprimir/guardar como PDF
  const printWindow = window.open(url, '_blank');
  
  if (printWindow) {
    printWindow.onload = () => {
      // Esperar a que cargue y luego mostrar el diálogo de impresión
      setTimeout(() => {
        printWindow.print();
        // Limpiar el URL después de un tiempo
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 250);
    };
  } else {
    alert('Por favor, permite ventanas emergentes para generar el PDF');
  }
}

/**
 * Formatea el contenido del chatbot para el PDF
 */
function formatContentForPDF(content) {
  // Limpiar y formatear el contenido
  return content
    .replace(/\*\*/g, '') // Quitar negritas markdown
    .replace(/\*/g, '•') // Convertir asteriscos en viñetas
    .replace(/\n\n/g, '</p><p>') // Párrafos
    .replace(/\n/g, '<br>'); // Saltos de línea
}

/**
 * Exporta datos a CSV
 */
export function exportToCSV(data, filename = 'reporte') {
  let csv = '';
  
  // Encabezados
  if (data.length > 0) {
    csv = Object.keys(data[0]).join(',') + '\n';
  }
  
  // Datos
  data.forEach(row => {
    csv += Object.values(row).map(val => {
      // Escapar comas y comillas
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',') + '\n';
  });
  
  // Descargar archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Prepara datos para exportación desde respuesta del chatbot
 */
export function prepareExportData(message, contextData) {
  const exportData = {
    content: message,
    summary: {},
    topProducts: [],
    alerts: [],
  };

  // Extraer resumen si hay datos de contexto
  if (contextData) {
    if (contextData.orders) {
      exportData.summary.totalRevenue = contextData.orders.totalRevenue || 0;
      exportData.summary.totalOrders = contextData.orders.total || 0;
      exportData.summary.avgOrderValue = contextData.orders.averageOrderValue || 0;
    }
    if (contextData.products) {
      exportData.summary.totalProducts = contextData.products.total || 0;
      if (contextData.products.topSelling) {
        exportData.topProducts = contextData.products.topSelling.slice(0, 5);
      }
    }
  }

  // Extraer alertas del mensaje
  const alertPatterns = [
    /⚠️[^\n]+/g,
    /CRÍTICO:[^\n]+/gi,
    /URGENTE:[^\n]+/gi,
    /Alerta:[^\n]+/gi,
  ];

  alertPatterns.forEach(pattern => {
    const matches = message.match(pattern);
    if (matches) {
      exportData.alerts.push(...matches);
    }
  });

  return exportData;
}
