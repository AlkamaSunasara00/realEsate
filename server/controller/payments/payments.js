const connection = require("../../connection/connection");

// get all payments
const getPayments = (req, res) => {
  const q = "SELECT * FROM payments ORDER BY created_at DESC";
  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    return res.status(200).json(data);
  });
};

// get single payment by id
const getPaymentById = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM payments WHERE id = ?";
  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (!data || data.length === 0) return res.status(404).json({ error: "payment not found" });
    return res.status(200).json(data[0]);
  });
};

// get payments by client id
const getPaymentsByClient = (req, res) => {
  const { clientId } = req.params;
  const q = "SELECT * FROM payments WHERE client_id = ? ORDER BY paid_at DESC, created_at DESC";
  connection.query(q, [clientId], (err, data) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    return res.status(200).json(data);
  });
};

// get payments by property id
const getPaymentsByProperty = (req, res) => {
  const { propertyId } = req.params;
  const q = "SELECT * FROM payments WHERE property_id = ? ORDER BY paid_at DESC, created_at DESC";
  connection.query(q, [propertyId], (err, data) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    return res.status(200).json(data);
  });
};

// add payment
const addPayment = (req, res) => {
  const {
    property_id,
    client_id,
    amount,
    payment_method = null,
    status = "pending",
    notes = null,
    paid_at = null,
  } = req.body;

  // basic validation
  if (!property_id || !amount) {
    return res.status(400).json({ error: "property_id and amount are required" });
  }

  // allow client_id to be null (in case you want anonymous payment) — but screenshot shows client_id nullable
  const q = `INSERT INTO payments
    (property_id, client_id, amount, payment_method, status, notes, paid_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    property_id,
    client_id || null,
    amount,
    payment_method,
    status,
    notes,
    paid_at || null,
  ];

  connection.query(q, params, (err, result) => {
    if (err) {
      // foreign key or other DB error
      return res.status(500).json({ error: "database error", details: err });
    }
    return res.status(201).json({ message: "payment recorded", insertId: result.insertId });
  });
};

// update payment (partial update allowed)
const updatePayment = (req, res) => {
  const { id } = req.params;
  const {
    property_id,
    client_id,
    amount,
    payment_method,
    status,
    notes,
    paid_at,
  } = req.body;

  const q = `UPDATE payments SET
    property_id = COALESCE(?, property_id),
    client_id = COALESCE(?, client_id),
    amount = COALESCE(?, amount),
    payment_method = COALESCE(?, payment_method),
    status = COALESCE(?, status),
    notes = COALESCE(?, notes),
    paid_at = COALESCE(?, paid_at),
    updated_at = NOW()
    WHERE id = ?`;

  const params = [
    property_id || null,
    client_id || null,
    amount || null,
    payment_method || null,
    status || null,
    notes || null,
    paid_at || null,
    id,
  ];

  connection.query(q, params, (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "payment not found" });
    return res.status(200).json({ message: "payment updated" });
  });
};

// delete payment
const deletePayment = (req, res) => {
  const { id } = req.params;
  const q = "DELETE FROM payments WHERE id = ?";
  connection.query(q, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "payment not found" });
    return res.status(200).json({ message: "payment deleted" });
  });
};

module.exports = {
  getPayments,
  getPaymentById,
  getPaymentsByClient,
  getPaymentsByProperty,
  addPayment,
  updatePayment,
  deletePayment,
};
