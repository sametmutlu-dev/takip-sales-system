const ipWhitelist = (req, res, next) => {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  // IPv6 localhost'u IPv4'e çevir
  const normalizedIP = clientIP === '::1' ? '127.0.0.1' : clientIP;
  
  // Development modunda localhost'a izin ver
  if (process.env.NODE_ENV === 'development') {
    if (normalizedIP === '127.0.0.1' || normalizedIP === '::1') {
      return next();
    }
  }
  
  // IP whitelist kontrolü
  if (allowedIPs.includes(normalizedIP) || allowedIPs.includes(clientIP)) {
    next();
  } else {
    console.log(`🚫 Erişim engellendi - IP: ${clientIP}`);
    res.status(403).json({
      error: 'Erişim engellendi',
      message: 'IP adresiniz sistemde kayıtlı değil'
    });
  }
};

module.exports = ipWhitelist;
