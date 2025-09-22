const express = require('express');
const Sales = require('../models/Sales');
const router = express.Router();

// Tüm satışları getir (filtreleme ile)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      seller,
      buyer,
      city,
      category,
      status,
      startDate,
      endDate,
      sortBy = 'saleDate',
      sortOrder = 'desc'
    } = req.query;

    // Filtreleme objesi
    const filter = {};
    
    if (seller) {
      filter['seller.name'] = { $regex: seller, $options: 'i' };
    }
    
    if (buyer) {
      filter['buyer.name'] = { $regex: buyer, $options: 'i' };
    }
    
    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (category) {
      filter['product.category'] = { $regex: category, $options: 'i' };
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    // Sıralama
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verileri getir
    const sales = await Sales.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Toplam sayı
    const total = await Sales.countDocuments(filter);

    // İstatistikler
    const stats = await Sales.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$price.amount' },
          totalQuantity: { $sum: '$product.quantity' },
          averagePrice: { $avg: '$price.amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      stats: stats[0] || {
        totalSales: 0,
        totalQuantity: 0,
        averagePrice: 0,
        count: 0
      }
    });

  } catch (error) {
    console.error('Satış listesi hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Satış listesi alınamadı',
      message: error.message
    });
  }
});

// Tek satış getir
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Satış bulunamadı'
      });
    }

    res.json({
      success: true,
      data: sale
    });

  } catch (error) {
    console.error('Satış getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Satış alınamadı',
      message: error.message
    });
  }
});

// Yeni satış oluştur
router.post('/', async (req, res) => {
  try {
    const saleData = req.body;
    
    // Gerekli alanları kontrol et
    const requiredFields = [
      'seller.name',
      'buyer.name',
      'address.street',
      'address.city',
      'product.name',
      'product.quantity',
      'price.amount'
    ];

    for (const field of requiredFields) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], saleData);
      if (!value) {
        return res.status(400).json({
          success: false,
          error: 'Eksik alan',
          message: `${field} alanı gerekli`
        });
      }
    }

    const sale = new Sales(saleData);
    await sale.save();

    res.status(201).json({
      success: true,
      data: sale,
      message: 'Satış başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('Satış oluşturma hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Doğrulama hatası',
        messages: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Satış oluşturulamadı',
      message: error.message
    });
  }
});

// Satış güncelle
router.put('/:id', async (req, res) => {
  try {
    const sale = await Sales.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Satış bulunamadı'
      });
    }

    res.json({
      success: true,
      data: sale,
      message: 'Satış başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Satış güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Doğrulama hatası',
        messages: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Satış güncellenemedi',
      message: error.message
    });
  }
});

// Satış sil
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sales.findByIdAndDelete(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Satış bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Satış başarıyla silindi'
    });

  } catch (error) {
    console.error('Satış silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Satış silinemedi',
      message: error.message
    });
  }
});

// İstatistikler endpoint'i
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchFilter = {};
    if (startDate || endDate) {
      matchFilter.saleDate = {};
      if (startDate) matchFilter.saleDate.$gte = new Date(startDate);
      if (endDate) matchFilter.saleDate.$lte = new Date(endDate);
    }

    const stats = await Sales.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$price.amount' },
          totalQuantity: { $sum: '$product.quantity' },
          averagePrice: { $avg: '$price.amount' },
          count: { $sum: 1 },
          minPrice: { $min: '$price.amount' },
          maxPrice: { $max: '$price.amount' }
        }
      }
    ]);

    // Şehir bazında istatistikler
    const cityStats = await Sales.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$address.city',
          totalSales: { $sum: '$price.amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }
    ]);

    // Kategori bazında istatistikler
    const categoryStats = await Sales.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: '$price.amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalSales: 0,
          totalQuantity: 0,
          averagePrice: 0,
          count: 0,
          minPrice: 0,
          maxPrice: 0
        },
        topCities: cityStats,
        topCategories: categoryStats
      }
    });

  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler alınamadı',
      message: error.message
    });
  }
});

module.exports = router;
