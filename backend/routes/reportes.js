const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/reportes/resumen-mensual - Resumen completo del mes
router.get('/resumen-mensual', async (req, res) => {
  try {
    const { año, mes } = req.query;
    
    // Si no se especifica año/mes, usar el actual
    const fechaBase = año && mes 
      ? `${año}-${mes.padStart(2, '0')}-01`
      : new Date().toISOString().split('T')[0];

    // Ventas del mes
    const ventasQuery = `
      SELECT 
        COUNT(*) as total_ventas,
        SUM(total) as ingresos_totales,
        AVG(total) as ticket_promedio
      FROM ventas 
      WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', $1::date)
    `;

    // Gastos del mes
    const gastosQuery = `
      SELECT 
        COUNT(*) as total_gastos,
        SUM(monto) as gastos_totales
      FROM gastos 
      WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', $1::date)
    `;

    // Ventas por canal
    const ventasCanalQuery = `
      SELECT 
        cv.nombre as canal,
        COUNT(v.id) as cantidad,
        SUM(v.total) as total
      FROM ventas v
      JOIN canales_venta cv ON v.canal_venta_id = cv.id
      WHERE DATE_TRUNC('month', v.fecha) = DATE_TRUNC('month', $1::date)
      GROUP BY cv.id, cv.nombre
      ORDER BY total DESC
    `;

    // Productos más vendidos
    const productosQuery = `
      SELECT 
        p.nombre as producto,
        SUM(vd.cantidad) as cantidad_vendida,
        SUM(vd.subtotal) as ingresos_producto
      FROM ventas_detalle vd
      JOIN productos p ON vd.producto_id = p.id
      JOIN ventas v ON vd.venta_id = v.id
      WHERE DATE_TRUNC('month', v.fecha) = DATE_TRUNC('month', $1::date)
      GROUP BY p.id, p.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `;

    // Gastos por tipo
    const gastosTipoQuery = `
      SELECT 
        tg.nombre as tipo,
        COUNT(g.id) as cantidad,
        SUM(g.monto) as total
      FROM gastos g
      JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id
      WHERE DATE_TRUNC('month', g.fecha) = DATE_TRUNC('month', $1::date)
      GROUP BY tg.id, tg.nombre
      ORDER BY total DESC
    `;

    // Pagos al personal
    const pagosPersonalQuery = `
      SELECT 
        SUM(monto) as total_pagos,
        COUNT(DISTINCT personal_id) as personas_pagadas
      FROM pagos_personal 
      WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', $1::date)
    `;

    // Ejecutar todas las consultas
    const [ventas, gastos, ventasCanal, productos, gastosTipo, pagosPersonal] = await Promise.all([
      query(ventasQuery, [fechaBase]),
      query(gastosQuery, [fechaBase]),
      query(ventasCanalQuery, [fechaBase]),
      query(productosQuery, [fechaBase]),
      query(gastosTipoQuery, [fechaBase]),
      query(pagosPersonalQuery, [fechaBase])
    ]);

    const ventasData = ventas.rows[0];
    const gastosData = gastos.rows[0];
    const pagosData = pagosPersonal.rows[0];

    const ingresosTotales = parseFloat(ventasData.ingresos_totales) || 0;
    const gastosTotales = parseFloat(gastosData.gastos_totales) || 0;
    const pagosTotales = parseFloat(pagosData.total_pagos) || 0;

    const resumen = {
      periodo: `${new Date(fechaBase).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      ingresos: {
        total: ingresosTotales,
        cantidadVentas: parseInt(ventasData.total_ventas) || 0,
        ticketPromedio: parseFloat(ventasData.ticket_promedio) || 0
      },
      egresos: {
        gastos: gastosTotales,
        pagosPersonal: pagosTotales,
        total: gastosTotales + pagosTotales
      },
      balance: ingresosTotales - (gastosTotales + pagosTotales),
      margenBruto: ingresosTotales > 0 ? ((ingresosTotales - gastosTotales - pagosTotales) / ingresosTotales * 100) : 0,
      ventasPorCanal: ventasCanal.rows.map(row => ({
        canal: row.canal,
        cantidad: parseInt(row.cantidad),
        total: parseFloat(row.total)
      })),
      productosMasVendidos: productos.rows.map(row => ({
        producto: row.producto,
        cantidadVendida: parseInt(row.cantidad_vendida),
        ingresos: parseFloat(row.ingresos_producto)
      })),
      gastosPorTipo: gastosTipo.rows.map(row => ({
        tipo: row.tipo,
        cantidad: parseInt(row.cantidad),
        total: parseFloat(row.total)
      }))
    };

    res.json({
      success: true,
      data: resumen
    });

  } catch (error) {
    console.error('Error generando resumen mensual:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/reportes/ventas-diarias - Ventas por día en un rango
router.get('/ventas-diarias', async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fecha_desde y fecha_hasta'
      });
    }

    const ventasDiariasQuery = `
      SELECT 
        fecha,
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_dia,
        AVG(total) as promedio_venta
      FROM ventas
      WHERE fecha BETWEEN $1 AND $2
      GROUP BY fecha
      ORDER BY fecha
    `;

    const result = await query(ventasDiariasQuery, [fecha_desde, fecha_hasta]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        fecha: row.fecha,
        cantidadVentas: parseInt(row.cantidad_ventas),
        totalDia: parseFloat(row.total_dia),
        promedioVenta: parseFloat(row.promedio_venta)
      }))
    });

  } catch (error) {
    console.error('Error generando reporte de ventas diarias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/reportes/productos-rentabilidad - Análisis de rentabilidad por producto
router.get('/productos-rentabilidad', async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    // Si no se especifican fechas, usar el último mes
    const fechaDesde = fecha_desde || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fechaHasta = fecha_hasta || new Date().toISOString().split('T')[0];

    const rentabilidadQuery = `
      SELECT 
        p.id,
        p.nombre as producto,
        p.precio as precio_actual,
        COUNT(vd.id) as veces_vendido,
        SUM(vd.cantidad) as total_vendido,
        SUM(vd.subtotal) as ingresos_totales,
        AVG(vd.precio_unitario) as precio_promedio,
        MIN(vd.precio_unitario) as precio_minimo,
        MAX(vd.precio_unitario) as precio_maximo
      FROM productos p
      LEFT JOIN ventas_detalle vd ON p.id = vd.producto_id
      LEFT JOIN ventas v ON vd.venta_id = v.id
      WHERE v.fecha BETWEEN $1 AND $2 OR v.fecha IS NULL
      GROUP BY p.id, p.nombre, p.precio
      ORDER BY ingresos_totales DESC NULLS LAST
    `;

    const result = await query(rentabilidadQuery, [fechaDesde, fechaHasta]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        producto: row.producto,
        precioActual: parseFloat(row.precio_actual),
        vecesVendido: parseInt(row.veces_vendido) || 0,
        totalVendido: parseInt(row.total_vendido) || 0,
        ingresosTotales: parseFloat(row.ingresos_totales) || 0,
        precioPromedio: parseFloat(row.precio_promedio) || 0,
        precioMinimo: parseFloat(row.precio_minimo) || 0,
        precioMaximo: parseFloat(row.precio_maximo) || 0
      })),
      periodo: {
        desde: fechaDesde,
        hasta: fechaHasta
      }
    });

  } catch (error) {
    console.error('Error generando reporte de rentabilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/reportes/personal-productividad - Reporte de productividad del personal
router.get('/personal-productividad', async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    const fechaDesde = fecha_desde || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fechaHasta = fecha_hasta || new Date().toISOString().split('T')[0];

    const productividadQuery = `
      SELECT 
        p.id,
        p.nombre,
        p.apellido,
        p.rol,
        COUNT(pp.id) as turnos_trabajados,
        SUM(pp.monto) as total_pagado,
        SUM(pp.horas_trabajadas) as total_horas,
        AVG(pp.monto) as pago_promedio_turno,
        AVG(pp.horas_trabajadas) as horas_promedio_turno
      FROM personal p
      LEFT JOIN pagos_personal pp ON p.id = pp.personal_id
      WHERE (pp.fecha BETWEEN $1 AND $2) OR pp.fecha IS NULL
      GROUP BY p.id, p.nombre, p.apellido, p.rol
      ORDER BY total_pagado DESC NULLS LAST
    `;

    const result = await query(productividadQuery, [fechaDesde, fechaHasta]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        nombreCompleto: `${row.nombre} ${row.apellido}`,
        rol: row.rol,
        turnosTrabajados: parseInt(row.turnos_trabajados) || 0,
        totalPagado: parseFloat(row.total_pagado) || 0,
        totalHoras: parseFloat(row.total_horas) || 0,
        pagoPromedioTurno: parseFloat(row.pago_promedio_turno) || 0,
        horasPromedioTurno: parseFloat(row.horas_promedio_turno) || 0
      })),
      periodo: {
        desde: fechaDesde,
        hasta: fechaHasta
      }
    });

  } catch (error) {
    console.error('Error generando reporte de productividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;