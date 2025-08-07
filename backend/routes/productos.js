const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/productos - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productosQuery = `
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.descripcion,
        p.activo,
        c.nombre as categoria,
        p.created_at,
        p.updated_at
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      ORDER BY c.nombre, p.nombre
    `;

    const result = await query(productosQuery);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        precio: parseFloat(row.precio),
        descripcion: row.descripcion,
        categoria: row.categoria,
        activo: row.activo,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/productos - Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, categoria_id, descripcion } = req.body;

    if (!nombre || !precio || !categoria_id) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    const insertQuery = `
      INSERT INTO productos (nombre, precio, categoria_id, descripcion)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const result = await query(insertQuery, [nombre, precio, categoria_id, descripcion]);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;