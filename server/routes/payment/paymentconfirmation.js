const express = require("express");
const router = express.Router();
const controller = require("../../controller/payments/paymentconfirmation");
const upload = require("../../middleware/fileHandler"); // multer - already in your project
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authorizeRole");

router.get("/getpaymentconfirmations",verifyToken, controller.getAllConfirmations);
router.get("/getpaymentconfirmation/:id",verifyToken, controller.getConfirmationById);
router.get("/getConfirmationByPaymentId/:payment_id",verifyToken, controller.getConfirmationByPaymentId);

// create with optional signature file (field name: "signature")
router.post(
  "/addpaymentconfirmation",
  verifyToken,
  upload.single("signature"),
  controller.createConfirmation
);


// update with optional signature file
router.put("/updatepaymentconfirmation/:id",verifyToken, upload.single("signature"), controller.updateConfirmation);

router.delete("/deletepaymentconfirmation/:id", verifyToken, authorizeRole("admin"), controller.deleteConfirmation);

module.exports = router;
