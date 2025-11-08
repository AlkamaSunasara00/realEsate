const express = require("express");
const router = express.Router();
const assigned = require("../../controller/properties/assignproperty");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authorizeRole");

// admins can manage, clients can view their own
router.get("/getassignedproperties", verifyToken, authorizeRole("admin"), assigned.getAssignedProperties);
router.get("/getassignedproperties/:id", verifyToken, authorizeRole("admin"), assigned.getAssignedPropertyById);
router.get("/getAssignedPropertyByClientId/:id", verifyToken, authorizeRole("admin", "client"), assigned.getAssignedPropertyByClientId);

router.post("/addassignedproperty", verifyToken, authorizeRole("admin"), assigned.addAssignedProperty);
router.put("/updateassignedproperty/:id", verifyToken, authorizeRole("admin"), assigned.updateAssignedProperty);
router.delete("/deleteassignedproperty/:id", verifyToken, authorizeRole("admin"), assigned.deleteAssignedProperty);

module.exports = router;
