require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB bağlantısı başarılı');
})
.catch((error) => {
  console.error('❌ MongoDB bağlantı hatası:', error);
  process.exit(1);
});

// Server başlatma
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📊 Satış takip sistemi aktif`);
});
