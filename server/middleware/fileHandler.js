const multer=require("multer");
const path=require("path");
const express=require('express')

const app=express();
app.use("/uploads", express.static("uploads"));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../client/public/uploads"))
        console.log(req.file);
        console.log(req.body);
        
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
   
    
});


const location = multer({ storage: storage });

module.exports = location;