const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/gastos - Obtener gastos con filtros
router.get('/', async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, tipo_id, limit = 50, offset = 0 } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (fecha_desde) {
      paramCount++;
      whereConditions.push(`g.fecha >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      whereConditions.push(`g.fecha <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (tipo_id) {
      paramCount++;
      whereConditions.push(`g.tipo_gasto_id = $${paramCount}`);
      queryParams.push(tipo_id);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const gastosQuery = `
      SELECT 
        g.id,
        g.fecha,
        tg.nombre as tipo_gasto,
        g.descripcion,
        g.monto,
        g.proveedor,
        g.observaciones,
        g.created_at
      FROM gastos g
      JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id
      ${whereClause}
      ORDER BY g.fecha DESC, g.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await query(gastosQuery, queryParams);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        fecha: row.fecha,
        tipoGasto: row.tipo_gasto,
        descripcion: row.descripcion,
        monto: parseFloat(row.monto),
        proveedor: row.proveedor,
        observaciones: row.observaciones,
        createdAt: row.created_at
      }))
    });

  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/gastos - Crear nuevo gasto
router.post('/', async (req, res) => {
  try {
    const { fecha, tipo_gasto_id, descripcion, monto, proveedor, observaciones } = req.body;

    if (!fecha || !tipo_gasto_id || !descripcion || !monto) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    const insertQuery = `
      INSERT INTO gastos (fecha, tipo_gasto_id, descripcion, monto, proveedor, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const result = await query(insertQuery, [fecha, tipo_gasto_id, descripcion, monto, proveedor, observaciones]);

    res.status(201).json({
      success: true,
      message: 'Gasto registrado exitosamente',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Error registrando gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;