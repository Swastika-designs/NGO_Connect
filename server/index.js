const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ngos', require('./routes/ngos'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/', (req, res) => res.json({ message: 'NGO Connect API running ✅' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));
