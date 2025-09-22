const domainCheck = (req, res, next) => {
  const origin = req.get('origin') || req.get('referer');
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
  
  // Development modunda localhost'a izin ver
  if (process.env.NODE_ENV === 'development') {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return next();
    }
  }
  
  // Origin kontrolü
  if (origin) {
    const originDomain = new URL(origin).host;
    const isAllowed = allowedDomains.some(domain => {
      return originDomain === domain || originDomain.includes(domain);
    });
    
    if (!isAllowed) {
      console.log(`🚫 Domain engellendi - Origin: ${origin}`);
      return res.status(403).json({
        error: 'Domain erişim engellendi',
        message: 'Bu domain\'den erişim izni yok'
      });
    }
  }
  
  next();
};

module.exports = domainCheck;
