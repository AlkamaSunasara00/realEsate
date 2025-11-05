const express = require("express");
const router = express.Router();
const properties = require("../../controller/properties/property"); // adjust path to where you save controller
const upload = require("../../middleware/fileHandler"); // your multer middleware like in users example

// list all
router.get("/getproperties", properties.getProperties);

// get by id
router.get("/getproperties/:id", properties.getPropertyById);

// add (multipart for image)
router.post("/addproperty", upload.single("image"), properties.addProperty);

// update (multipart if image might be changed)
router.put("/updateproperty/:id", upload.single("image"), properties.updateProperty);

// delete
router.delete("/deleteproperty/:id", properties.deleteProperty);

module.exports = router;
