const express = require("express");
const app = express();

const ngoRoutes = require('./routes/ngoRoutes');

// add this with your other app.use() route lines:
app.use('/api/ngo', ngoRoutes);
app.use(express.json({ limit: '10mb' }));
app.listen(5000, () => {
  console.log("Server started on port 5000");
});