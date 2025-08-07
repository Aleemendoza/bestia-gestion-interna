const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/personal - Obtener todo el personal
router.get('/', async (req, res) => {
  try {
    const personalQuery = `
      SELECT 
        id, nombre, apellido, dni, telefono, email, rol, activo, created_at
      FROM personal
      ORDER BY apellido, nombre
    `;

    const result = await query(personalQuery);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/personal/pagos - Registrar pago al personal
router.post('/pagos', async (req, res) => {
  try {
    const { personal_id, fecha, concepto, monto, horas_trabajadas, observaciones } = req.body;

    if (!personal_id || !fecha || !monto) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    const insertQuery = `
      INSERT INTO pagos_personal (personal_id, fecha, concepto, monto, horas_trabajadas, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const result = await query(insertQuery, [personal_id, fecha, concepto, monto, horas_trabajadas, observaciones]);

    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Error registrando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;