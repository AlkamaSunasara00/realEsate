const express = require("express");
const router = express.Router();
const controller = require("../../controller/payments/paymentconfirmation");
const upload = require("../../middleware/fileHandler"); // multer - already in your project

router.get("/getpaymentconfirmations", controller.getAllConfirmations);
router.get("/getpaymentconfirmation/:id", controller.getConfirmationById);
router.get("/getConfirmationByPaymentId/:payment_id", controller.getConfirmationByPaymentId);

// create with optional signature file (field name: "signature")
router.post("/addpaymentconfirmation", upload.single("signature"), controller.createConfirmation);

// update with optional signature file
router.put("/updatepaymentconfirmation/:id", upload.single("signature"), controller.updateConfirmation);

router.delete("/deletepaymentconfirmation/:id", controller.deleteConfirmation);

module.exports = router;
