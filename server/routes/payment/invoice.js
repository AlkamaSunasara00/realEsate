const express = require("express");
const router = express.Router();
const invoiceController = require("../../controller/payments/invoice");
const authorizeRole = require("../../middleware/authorizeRole");
const verifyToken = require("../../middleware/verifyToken");

// 🧾 Routes
router.post("/generateInvoicePdf",verifyToken, authorizeRole("admin","client"), invoiceController.generateInvoicePdf);
router.get("/getInvoicePath/:id", invoiceController.getInvoicePath);
router.get("/downloadInvoice/:id",verifyToken, authorizeRole("admin","client"), invoiceController.downloadInvoice);

module.exports = router;
