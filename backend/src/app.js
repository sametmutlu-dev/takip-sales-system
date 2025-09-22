const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Middleware imports
const ipWhitelist = require('./middleware/ipWhitelist');
const apiKeyAuth = require('./middleware/apiKeyAuth');
const domainCheck = require('./middleware/domainCheck');

// Route imports
const salesRoutes = require('./routes/sales');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için maksimum 100 istek
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.'
  }
});
app.use(limiter);

// CORS configuration - Development için esnek
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware - Devre dışı
// app.use(ipWhitelist);
// app.use(domainCheck);
// app.use(apiKeyAuth);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Satış takip sistemi çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/sales', salesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.message === 'CORS policy tarafından engellendi') {
    return res.status(403).json({
      error: 'Erişim engellendi',
      message: 'Bu domain\'den erişim izni yok'
    });
  }
  
  res.status(500).json({
    error: 'Sunucu hatası',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Bir hata oluştu'
  });
});

module.exports = app;
