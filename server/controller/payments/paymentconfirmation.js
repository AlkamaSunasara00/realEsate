const connection = require("../../connection/connection");

// Get all confirmations (most recent first)
const getAllConfirmations = (req, res) => {
  const sql = `
    SELECT * FROM payment_confirmations
  `;

  connection.query(sql, (err, rows) => {
    if (err) {
      console.error("getAllConfirmations error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.status(200).json(rows);
  });
};

// Get single confirmation by id
const getConfirmationById = (req, res) => {
  const id = req.params.id;
  const sql = `
   SELECT * FROM payment_confirmations WHERE id = ? ;

  `;
  connection.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("getConfirmationById error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!rows.length) return res.status(404).json({ error: "Confirmation not found" });
    return res.status(200).json(rows[0]);
  });
};

// Create new confirmation
// Accepts multipart/form-data (field "signature" for file)
// Create new confirmation (no file upload)
const createConfirmation = (req, res) => {
  const {
    payment_id,
    sent_by,
    confirmed_by,
    status,
    confirmed_at,
    reject_reason,
  } = req.body;

  if (!payment_id || !status) {
    return res.status(400).json({ error: "payment_id and status are required" });
  }

  const insertSQL = `
    INSERT INTO payment_confirmations
      (payment_id, sent_by, confirmed_by, status, confirmed_at, reject_reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const insertParams = [
    payment_id,
    sent_by || null,
    confirmed_by || null,
    status,
    confirmed_at || null,
    reject_reason || null,
  ];

  connection.query(insertSQL, insertParams, (err, result) => {
    if (err) {
      console.error("createConfirmation error:", err);
      return res.status(500).json({ error: "Insert failed", details: err });
    }

    const updateSQL = `
      UPDATE payments
      SET status = ?, paid_at = ?
      WHERE id = ?
    `;
    connection.query(updateSQL, [status, confirmed_at || new Date(), payment_id], (updateErr) => {
      if (updateErr) {
        console.error("update payments error:", updateErr);
        return res.status(500).json({ error: "Failed to update payment status", details: updateErr });
      }

      return res.status(201).json({
        message: status === "rejected" ? "Payment rejected successfully" : "Payment confirmed successfully",
        confirmation_id: result.insertId,
        payment_id,
      });
    });
  });
};

// Update confirmation (no signature)
const updateConfirmation = (req, res) => {
  const id = req.params.id;
  const {
    payment_id,
    sent_by,
    confirmed_by,
    status,
    confirmed_at,
    reject_reason,
  } = req.body;

  const sql = `
    UPDATE payment_confirmations
    SET
      payment_id    = COALESCE(?, payment_id),
      sent_by       = COALESCE(?, sent_by),
      confirmed_by  = COALESCE(?, confirmed_by),
      status        = COALESCE(?, status),
      confirmed_at  = COALESCE(?, confirmed_at),
      reject_reason = COALESCE(?, reject_reason),
      updated_at    = NOW()
    WHERE id = ?
  `;
  const params = [
    payment_id || null,
    sent_by || null,
    confirmed_by || null,
    status || null,
    confirmed_at || null,
    reject_reason || null,
    id,
  ];

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateConfirmation error:", err);
      return res.status(500).json({ error: "Update failed", details: err });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Confirmation not found" });
    return res.status(200).json({ message: "Confirmation updated" });
  });
};


// Delete confirmation
const deleteConfirmation = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM payment_confirmations WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("deleteConfirmation error:", err);
      return res.status(500).json({ error: "Delete failed" });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "Confirmation not found" });
    return res.status(200).json({ message: "Confirmation deleted" });
  });
};

const getConfirmationByPaymentId = (req, res) => {
  const { payment_id } = req.params;
  const query="SELECT * FROM payment_confirmations WHERE payment_id= ?"
  connection.query(query,[payment_id],(err,result)=>{
    if (err) {
      return res.status(500);
    } else {
      return res.json(result)
    }
  })
}

module.exports = {
  getAllConfirmations,
  getConfirmationById,
  createConfirmation,
  updateConfirmation,
  deleteConfirmation,
  getConfirmationByPaymentId
};
