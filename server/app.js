const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db'); // DB connection

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.send('API is working!');
});

// Yaha aur routes link karenge
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/events', require('./routes/eventRoutes'));

module.exports = app;
