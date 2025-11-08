const express = require("express");
const router = express.Router();
const payments = require("../../controller/payments/payments");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authorizeRole");

router.get("/getpayments", verifyToken, authorizeRole("admin"), payments.getPayments);
router.get("/getpayments/:id", verifyToken, authorizeRole("admin"), payments.getPaymentById);

// clients can only view their own payments
router.get("/getPaymentsByClientId/:clientId", verifyToken, authorizeRole("admin", "client"), payments.getPaymentsByClient);

router.get("/getpayments/property/:propertyId", verifyToken, authorizeRole("admin"), payments.getPaymentsByProperty);

router.post("/addpayment", verifyToken, authorizeRole("admin"), payments.addPayment);
router.put("/updatepayment/:id", verifyToken, authorizeRole("admin"), payments.updatePayment);
router.delete("/deletepayment/:id", verifyToken, authorizeRole("admin"), payments.deletePayment);

module.exports = router;
