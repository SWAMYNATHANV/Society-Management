// backend/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. IMPORT ALL ROUTES HERE
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 2. INITIALIZE THE EXPRESS APP
const app = express();

// 3. SETUP MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. MOUNT THE ROUTES (This must come AFTER 'const app = express();')
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);

// Health check route just to verify it's working
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running smoothly' });
});

// 5. START THE SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));