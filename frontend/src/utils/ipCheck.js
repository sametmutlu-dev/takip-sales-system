// IP kontrolü için utility
export const checkIPAccess = async () => {
  try {
    // IP adresini öğren
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const userIP = data.ip;
    
    // İzin verilen IP'ler
    const allowedIPs = [
      '91.239.204.165', // Sizin IP'niz
      '95.70.128.173',  // Yeni IP
      '31.142.178.216', // Yeni IP
      '212.156.83.162', // Yeni IP
      '127.0.0.1',      // Localhost
      '::1'             // IPv6 localhost
    ];
    
    // IP kontrolü - Geçici olarak devre dışı
    // if (!allowedIPs.includes(userIP)) {
    //   return {
    //     allowed: false,
    //     ip: userIP,
    //     message: 'Bu IP adresinden erişim izni yok'
    //   };
    // }
    
    return {
      allowed: true,
      ip: userIP
    };
    
  } catch (error) {
    console.error('IP kontrol hatası:', error);
    return {
      allowed: false,
      error: 'IP kontrol edilemedi'
    };
  }
};
