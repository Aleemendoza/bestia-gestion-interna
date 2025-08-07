const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/dashboard - Obtener datos del dashboard
router.get('/', async (req, res) => {
  try {
    // Obtener ventas del día actual
    const ventasHoyQuery = `
      SELECT COALESCE(SUM(total), 0) as total
      FROM ventas 
      WHERE fecha = CURRENT_DATE
    `;
    const ventasHoy = await query(ventasHoyQuery);

    // Obtener ventas de la semana actual
    const ventasSemanaQuery = `
      SELECT COALESCE(SUM(total), 0) as total
      FROM ventas 
      WHERE fecha >= DATE_TRUNC('week', CURRENT_DATE)
    `;
    const ventasSemana = await query(ventasSemanaQuery);

    // Obtener gastos del mes actual
    const gastosMesQuery = `
      SELECT COALESCE(SUM(monto), 0) as total
      FROM gastos 
      WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
    `;
    const gastosMes = await query(gastosMesQuery);

    // Obtener producto más vendido del mes
    const productoMasVendidoQuery = `
      SELECT p.nombre, SUM(vd.cantidad) as total_vendido
      FROM productos p
      JOIN ventas_detalle vd ON p.id = vd.producto_id
      JOIN ventas v ON vd.venta_id = v.id
      WHERE DATE_TRUNC('month', v.fecha) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY p.id, p.nombre
      ORDER BY total_vendido DESC
      LIMIT 1
    `;
    const productoMasVendido = await query(productoMasVendidoQuery);

    // Obtener cantidad de personal activo
    const personalActivoQuery = `
      SELECT COUNT(*) as total
      FROM personal 
      WHERE activo = true
    `;
    const personalActivo = await query(personalActivoQuery);

    // Obtener ventas por día de la semana (últimas 4 semanas)
    const ventasPorDiaQuery = `
      SELECT 
        EXTRACT(DOW FROM fecha) as dia_semana,
        TO_CHAR(fecha, 'Day') as nombre_dia,
        AVG(total) as promedio_ventas
      FROM ventas 
      WHERE fecha >= CURRENT_DATE - INTERVAL '4 weeks'
      GROUP BY EXTRACT(DOW FROM fecha), TO_CHAR(fecha, 'Day')
      ORDER BY dia_semana
    `;
    const ventasPorDia = await query(ventasPorDiaQuery);

    // Obtener canal más utilizado
    const canalMasUsadoQuery = `
      SELECT cv.nombre, COUNT(*) as total_ventas
      FROM ventas v
      JOIN canales_venta cv ON v.canal_venta_id = cv.id
      WHERE DATE_TRUNC('month', v.fecha) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY cv.id, cv.nombre
      ORDER BY total_ventas DESC
      LIMIT 1
    `;
    const canalMasUsado = await query(canalMasUsadoQuery);

    // Preparar respuesta
    const dashboard = {
      ventasHoy: parseFloat(ventasHoy.rows[0].total) || 0,
      ventasSemana: parseFloat(ventasSemana.rows[0].total) || 0,
      gastosDelMes: parseFloat(gastosMes.rows[0].total) || 0,
      productoMasVendido: productoMasVendido.rows[0]?.nombre || 'Sin datos',
      cantidadVendidaProductoTop: parseInt(productoMasVendido.rows[0]?.total_vendido) || 0,
      equipoTrabajando: parseInt(personalActivo.rows[0].total) || 0,
      mejorDia: ventasPorDia.rows.length > 0 
        ? ventasPorDia.rows.reduce((max, current) => 
            parseFloat(current.promedio_ventas) > parseFloat(max.promedio_ventas) ? current : max
          ).nombre_dia.trim()
        : 'Sin datos',
      canalPrincipal: canalMasUsado.rows[0]?.nombre || 'Sin datos',
      margenEstimado: 54 // Esto se puede calcular más adelante con costos reales
    };

    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo datos del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/dashboard/ventas-ultimos-dias - Ventas de los últimos 7 días
router.get('/ventas-ultimos-dias', async (req, res) => {
  try {
    const ventasQuery = `
      SELECT 
        fecha,
        SUM(total) as total_dia,
        COUNT(*) as cantidad_ventas
      FROM ventas 
      WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY fecha
      ORDER BY fecha DESC
    `;
    
    const result = await query(ventasQuery);
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        fecha: row.fecha,
        totalDia: parseFloat(row.total_dia),
        cantidadVentas: parseInt(row.cantidad_ventas)
      }))
    });

  } catch (error) {
    console.error('Error obteniendo ventas de últimos días:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;