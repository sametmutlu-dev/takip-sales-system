// Basit ve çalışan PDF export fonksiyonu
export const exportSalesToPDF = async (sales, filters = {}) => {
  try {
    console.log('PDF oluşturma başladı...');
    
    // jsPDF'i import et
    const jsPDF = (await import('jspdf')).default;
    console.log('jsPDF yüklendi');
    
    // autotable'ı import et
    await import('jspdf-autotable');
    console.log('autotable yüklendi');
    
    const doc = new jsPDF('landscape', 'mm', 'a4');
    console.log('PDF dokümanı oluşturuldu');
    
    // Başlık
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SATIS RAPORU', 14, 20);
    
    // Tarih
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 28);
    
    // Filtre bilgileri
    if (Object.keys(filters).length > 0) {
      doc.setFontSize(8);
      let filterText = 'Filtreler: ';
      const filterArray = [];
      
      if (filters.seller) filterArray.push(`Satici: ${filters.seller}`);
      if (filters.buyer) filterArray.push(`Alici: ${filters.buyer}`);
      if (filters.city) filterArray.push(`Sehir: ${filters.city}`);
      if (filters.startDate) filterArray.push(`Baslangic: ${filters.startDate}`);
      if (filters.endDate) filterArray.push(`Bitis: ${filters.endDate}`);
      
      filterText += filterArray.join(', ');
      doc.text(filterText, 14, 34);
    }
    
    // Tablo başlıkları
    const columns = [
      'Satici',
      'Alici', 
      'Urun',
      'Miktar',
      'Fiyat',
      'Sehir',
      'Durum',
      'Gonderi',
      'Tarih'
    ];
    
    // Tablo verileri
    const rows = sales.map(sale => [
      sale.seller.name || '',
      sale.buyer.name || '',
      sale.product.name || '',
      `${sale.product.quantity || 0} adet`,
      `${(sale.price.amount || 0).toLocaleString('tr-TR')} ${sale.price.currency || 'TRY'}`,
      sale.address.city || '',
      getStatusText(sale.status),
      getDeliveryTypeText(sale.deliveryType),
      new Date(sale.saleDate).toLocaleDateString('tr-TR')
    ]);
    
    console.log('Tablo verileri hazırlandı');
    
    // Tablo oluştur
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Satici
        1: { cellWidth: 25 }, // Alici
        2: { cellWidth: 20 }, // Urun
        3: { cellWidth: 15, halign: 'center' }, // Miktar
        4: { cellWidth: 20, halign: 'right' }, // Fiyat
        5: { cellWidth: 20 }, // Sehir
        6: { cellWidth: 15, halign: 'center' }, // Durum
        7: { cellWidth: 18 }, // Gonderi
        8: { cellWidth: 15, halign: 'center' } // Tarih
      },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
      showHead: 'everyPage',
      pageBreak: 'auto'
    });
    
    console.log('Tablo oluşturuldu');
    
    // İstatistikler
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ISTATISTIKLER', 14, finalY);
    
    const totalSales = sales.reduce((sum, sale) => sum + (sale.price.amount || 0), 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + (sale.product.quantity || 0), 0);
    const averagePrice = totalSales / sales.length || 0;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Toplam Satis: ${totalSales.toLocaleString('tr-TR')} TRY`, 14, finalY + 8);
    doc.text(`Toplam Miktar: ${totalQuantity} adet`, 14, finalY + 16);
    doc.text(`Ortalama Fiyat: ${averagePrice.toLocaleString('tr-TR')} TRY`, 14, finalY + 24);
    doc.text(`Toplam Islem: ${sales.length}`, 14, finalY + 32);
    
    // Sayfa numarası
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Sayfa ${i} / ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    console.log('PDF hazır, indiriliyor...');
    
    // PDF'i indir
    const fileName = `satis-raporu-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('PDF başarıyla indirildi');
    
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    console.log('CSV olarak indiriliyor...');
    // Fallback: CSV olarak indir
    exportToCSV(sales, filters);
  }
};

// CSV olarak indirme (fallback)
const exportToCSV = (sales, filters) => {
  const headers = ['Satici', 'Alici', 'Urun', 'Miktar', 'Fiyat', 'Sehir', 'Durum', 'Gonderi Tipi', 'Tarih'];
  const csvContent = [
    headers.join(','),
    ...sales.map(sale => [
      `"${sale.seller.name || ''}"`,
      `"${sale.buyer.name || ''}"`,
      `"${sale.product.name || ''}"`,
      sale.product.quantity || 0,
      sale.price.amount || 0,
      `"${sale.address.city || ''}"`,
      `"${getStatusText(sale.status)}"`,
      `"${getDeliveryTypeText(sale.deliveryType)}"`,
      `"${new Date(sale.saleDate).toLocaleDateString('tr-TR')}"`
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `satis-raporu-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'Tamamlandi';
    case 'pending': return 'Beklemede';
    case 'shipped': return 'Kargoda';
    case 'cancelled': return 'Iptal';
    case 'refunded': return 'Iade';
    default: return status;
  }
};

const getDeliveryTypeText = (deliveryType) => {
  switch (deliveryType) {
    case 'kargo': return 'Kargo';
    case 'elden': return 'Elden Teslim';
    case 'bayi': return 'Bayi';
    default: return deliveryType;
  }
};

export const exportSingleSaleToPDF = async (sale) => {
  try {
    console.log('Tekil PDF oluşturma başladı...');
    
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Başlık
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SATIS DETAY RAPORU', 14, 22);
    
    // Satış bilgileri
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Satis ID: ${sale._id}`, 14, 35);
    doc.text(`Tarih: ${new Date(sale.saleDate).toLocaleDateString('tr-TR')}`, 14, 45);
    
    // Satıcı bilgileri
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SATICI BILGILERI', 14, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ad: ${sale.seller.name}`, 14, 70);
    
    // Alıcı bilgileri
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ALICI BILGILERI', 14, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ad: ${sale.buyer.name}`, 14, 95);
    if (sale.buyer.phone) doc.text(`Telefon: ${sale.buyer.phone}`, 14, 105);
    if (sale.buyer.email) doc.text(`Email: ${sale.buyer.email}`, 14, 115);
    
    // Adres bilgileri
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ADRES BILGILERI', 14, 130);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(sale.address.street, 14, 140);
    doc.text(`${sale.address.district ? sale.address.district + ', ' : ''}${sale.address.city}`, 14, 150);
    doc.text(`${sale.address.postalCode ? sale.address.postalCode + ' ' : ''}${sale.address.country}`, 14, 160);
    
    // Ürün bilgileri
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('URUN BILGILERI', 14, 175);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Urun: ${sale.product.name}`, 14, 185);
    doc.text(`Miktar: ${sale.product.quantity} adet`, 14, 195);
    if (sale.product.description) doc.text(`Aciklama: ${sale.product.description}`, 14, 205);
    
    // Fiyat bilgileri
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FIYAT VE TESLIMAT', 14, 220);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fiyat: ${sale.price.amount.toLocaleString('tr-TR')} ${sale.price.currency}`, 14, 230);
    doc.text(`Durum: ${getStatusText(sale.status)}`, 14, 240);
    doc.text(`Gonderi Tipi: ${getDeliveryTypeText(sale.deliveryType)}`, 14, 250);
    
    if (sale.notes) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTLAR', 14, 265);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(sale.notes, 14, 275);
    }
    
    // PDF'i indir
    const fileName = `satis-detay-${sale._id}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('Tekil PDF başarıyla indirildi');
    
  } catch (error) {
    console.error('Tekil PDF oluşturma hatası:', error);
    // Fallback: CSV olarak indir
    exportSingleToCSV(sale);
  }
};

// Tekil satış CSV export
const exportSingleToCSV = (sale) => {
  const csvContent = [
    'Alan,Deger',
    `Satis ID,${sale._id}`,
    `Tarih,${new Date(sale.saleDate).toLocaleDateString('tr-TR')}`,
    `Satici,${sale.seller.name}`,
    `Alici,${sale.buyer.name}`,
    `Alici Telefon,${sale.buyer.phone || ''}`,
    `Alici Email,${sale.buyer.email || ''}`,
    `Acik Adres,${sale.address.street}`,
    `Sehir,${sale.address.city}`,
    `Ilce,${sale.address.district || ''}`,
    `Posta Kodu,${sale.address.postalCode || ''}`,
    `Ulke,${sale.address.country}`,
    `Urun,${sale.product.name}`,
    `Miktar,${sale.product.quantity}`,
    `Aciklama,${sale.product.description || ''}`,
    `Fiyat,${sale.price.amount}`,
    `Para Birimi,${sale.price.currency}`,
    `Durum,${getStatusText(sale.status)}`,
    `Gonderi Tipi,${getDeliveryTypeText(sale.deliveryType)}`,
    `Notlar,${sale.notes || ''}`
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `satis-detay-${sale._id}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
