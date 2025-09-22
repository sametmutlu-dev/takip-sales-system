const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const validApiKey = process.env.API_KEY;
  
  // Health check endpoint'i için API key kontrolü yapma
  if (req.path === '/health') {
    return next();
  }
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API Key gerekli',
      message: 'İstek header\'ında x-api-key veya Authorization Bearer token gerekli'
    });
  }
  
  if (apiKey !== validApiKey) {
    console.log(`🚫 Geçersiz API Key - IP: ${req.ip}`);
    return res.status(401).json({
      error: 'Geçersiz API Key',
      message: 'Sağlanan API key geçersiz'
    });
  }
  
  next();
};

module.exports = apiKeyAuth;
