const express = require("express");
const router = express.Router();
const payments = require("../../controller/payments/payments");

// list all payments
router.get("/getpayments", payments.getPayments);

// get payment by id
router.get("/getpayments/:id", payments.getPaymentById);

// get payments by client (client dashboard)
router.get("/getpayments/client/:clientId", payments.getPaymentsByClient);

// get payments by property
router.get("/getpayments/property/:propertyId", payments.getPaymentsByProperty);

// add payment
router.post("/addpayment", payments.addPayment);

// update payment
router.put("/updatepayment/:id", payments.updatePayment);

// delete payment
router.delete("/deletepayment/:id", payments.deletePayment);

module.exports = router;
