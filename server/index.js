const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/login/login');
const property = require("./routes/properties/property");


const app = express();
const port = 4500;

app.use(cors());
app.use(bodyParser.json());
app.use('/admin', authRoutes);
app.use('', property);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

