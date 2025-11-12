// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/login/login');
const property = require("./routes/properties/property");
const assignedproperties = require("./routes/properties/assignproperty");
const payments = require("./routes/payment/payments");
const paymentsconfirmation = require("./routes/payment/paymentconfirmation");
const invoice = require("./routes/payment/invoice");

const { cleanUpExpiredToken, blacklistExpiredToken } = require("./utils/tokenCleanup");
const  path  = require('path');

const app = express();
const port = 4500;

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
    next();
  },
  express.static(path.join(__dirname, "../client/public/uploads"))
);

app.use(cors());
app.use(bodyParser.json());
app.use('/admin', authRoutes);
app.use('', property);
app.use('', assignedproperties);
app.use('', payments);
app.use('', paymentsconfirmation);
app.use('', invoice);

blacklistExpiredToken()
cleanUpExpiredToken()

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
