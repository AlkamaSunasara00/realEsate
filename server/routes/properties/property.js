const express = require("express");
const router = express.Router();
const properties = require("../../controller/properties/property");
const upload = require("../../middleware/fileHandler");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authorizeRole");

// 🟢 anyone logged in can view properties
router.get("/getproperties", verifyToken, authorizeRole("admin"), properties.getProperties);
router.get("/getproperties/:id", verifyToken, authorizeRole("admin", "client"), properties.getPropertyById);

// 🟣 admin-only mutations
router.post("/addproperty", verifyToken, authorizeRole("admin"), upload.single("image"), properties.addProperty);
router.put("/updateproperty/:id", verifyToken, authorizeRole("admin"), upload.single("image"), properties.updateProperty);
router.delete("/deleteproperty/:id", verifyToken, authorizeRole("admin"), properties.deleteProperty);

module.exports = router;
