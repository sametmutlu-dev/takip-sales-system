const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  // Satıcı bilgileri
  seller: {
    name: {
      type: String,
      required: [true, 'Satıcı adı gerekli'],
      trim: true,
      maxlength: [100, 'Satıcı adı 100 karakterden fazla olamaz']
    }
  },
  
  // Alıcı bilgileri
  buyer: {
    name: {
      type: String,
      required: [true, 'Alıcı adı gerekli'],
      trim: true,
      maxlength: [100, 'Alıcı adı 100 karakterden fazla olamaz']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Telefon numarası 20 karakterden fazla olamaz']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email 100 karakterden fazla olamaz']
    }
  },
  
  // Adres bilgileri
  address: {
    street: {
      type: String,
      required: [true, 'Açık adres gerekli'],
      trim: true,
      maxlength: [500, 'Açık adres 500 karakterden fazla olamaz']
    },
    city: {
      type: String,
      required: [true, 'Şehir gerekli'],
      trim: true,
      maxlength: [50, 'Şehir adı 50 karakterden fazla olamaz']
    },
    district: {
      type: String,
      trim: true,
      maxlength: [50, 'İlçe adı 50 karakterden fazla olamaz']
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [10, 'Posta kodu 10 karakterden fazla olamaz']
    },
    country: {
      type: String,
      default: 'Türkiye',
      trim: true,
      maxlength: [50, 'Ülke adı 50 karakterden fazla olamaz']
    }
  },
  
  // Ürün bilgileri
  product: {
    name: {
      type: String,
      required: [true, 'Ürün adı gerekli'],
      trim: true,
      maxlength: [200, 'Ürün adı 200 karakterden fazla olamaz']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Ürün açıklaması 500 karakterden fazla olamaz']
    },
    quantity: {
      type: Number,
      required: [true, 'Miktar gerekli'],
      min: [1, 'Miktar en az 1 olmalı']
    },
    unit: {
      type: String,
      default: 'adet',
      trim: true,
      maxlength: [20, 'Birim 20 karakterden fazla olamaz']
    }
  },
  
  // Fiyat bilgileri
  price: {
    amount: {
      type: Number,
      required: [true, 'Fiyat gerekli'],
      min: [0, 'Fiyat negatif olamaz']
    },
    currency: {
      type: String,
      default: 'TRY',
      trim: true,
      maxlength: [3, 'Para birimi 3 karakterden fazla olamaz']
    }
  },
  
  // Tarih bilgileri
  saleDate: {
    type: Date,
    required: [true, 'Satış tarihi gerekli'],
    default: Date.now
  },
  
  // Durum bilgileri
  status: {
    type: String,
    enum: ['pending', 'completed', 'shipped', 'cancelled', 'refunded'],
    default: 'completed'
  },
  
  // Teslimat bilgileri
  deliveryType: {
    type: String,
    enum: ['kargo', 'elden', 'bayi'],
    default: 'kargo'
  },
  
  // Notlar
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notlar 1000 karakterden fazla olamaz']
  },
  
  // Sistem bilgileri
  createdBy: {
    type: String,
    default: 'system'
  },
  
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index'ler
salesSchema.index({ 'seller.name': 1 });
salesSchema.index({ 'buyer.name': 1 });
salesSchema.index({ 'address.city': 1 });
salesSchema.index({ saleDate: -1 });
salesSchema.index({ status: 1 });
salesSchema.index({ deliveryType: 1 });

// Virtual alanlar
salesSchema.virtual('totalAmount').get(function() {
  return this.price.amount;
});

salesSchema.virtual('formattedAddress').get(function() {
  const { street, district, city, postalCode, country } = this.address;
  return `${street}, ${district ? district + ', ' : ''}${city} ${postalCode ? postalCode : ''}, ${country}`.trim();
});

// Pre-save middleware
salesSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Sales', salesSchema);
