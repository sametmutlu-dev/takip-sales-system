import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { salesAPI } from '../services/api';
import { exportSalesToPDF } from '../utils/pdfExport';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, salesResponse] = await Promise.all([
        salesAPI.getStats(),
        salesAPI.getAll({ limit: 5, sortBy: 'saleDate', sortOrder: 'desc' })
      ]);

      setStats(statsResponse.data);
      setRecentSales(salesResponse.data);
    } catch (err) {
      console.error('Dashboard veri hatası:', err);
      setError(err.response?.data?.message || 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      exportSalesToPDF(recentSales, {});
    } catch (err) {
      console.error('PDF export hatası:', err);
      setError('PDF oluşturulurken hata oluştu');
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card sx={{
      minHeight: { xs: 120, md: 160 },
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 2,
      borderRadius: 2,
      // Kartı tam ortalamak için
      height: '100%',
      justifyContent: 'center', // İçeriği dikeyde ortalamak için
      alignItems: 'center' // İçeriği yatayda ortalamak için (opsiyonel)
    }}>
      <CardContent sx={{
        p: { xs: 1.5, md: 2 },
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%' // İçeriğin CardContent'i doldurmasını sağlar
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, md: 1 } }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.contrastText`,
              borderRadius: 1.5,
              p: { xs: 0.5, md: 0.8 },
              mr: { xs: 1, md: 1.5 },
              minWidth: { xs: 28, md: 32 },
              minHeight: { xs: 28, md: 32 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="subtitle2"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', width: '100%' }}> {/* Değer ve alt metni ortalar */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              mb: 0.5,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.65rem', md: '0.75rem' },
                lineHeight: 1.2
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMM yyyy', { locale: tr });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ p: { xs: 1, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ p: { xs: 1, md: 3 } }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, md: 3 }, pb: 3, pt: { xs: 2, md: 4 } }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mb: { xs: 1, md: 4 },
        width: '100%'
      }}>
        <Button
          variant="outlined"
          startIcon={<PdfIcon />}
          onClick={handleExportPDF}
          color="error"
          size={isMobile ? "small" : "medium"}
          fullWidth={isMobile}
          sx={{
            maxWidth: isMobile ? '100%' : 200
          }}
        >
          PDF İndir
        </Button>
      </Box>

      <Grid container spacing={isMobile ? 1.5 : 3}>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}> {/* Centering for small screens */}
          <StatCard
            title="Toplam Satış"
            value={formatCurrency(stats?.overview?.totalSales || 0)}
            icon={<MoneyIcon />}
            color="success"
            subtitle={`${stats?.overview?.count || 0} işlem`}
          />
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}> {/* Centering for small screens */}
          <StatCard
            title="Toplam Miktar"
            value={stats?.overview?.totalQuantity || 0}
            icon={<ShoppingCartIcon />}
            color="info"
            subtitle="adet ürün"
          />
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}> {/* Centering for small screens */}
          <StatCard
            title="Ortalama Fiyat"
            value={formatCurrency(stats?.overview?.averagePrice || 0)}
            icon={<TrendingUpIcon />}
            color="warning"
            subtitle="işlem başına"
          />
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}> {/* Centering for small screens */}
          <StatCard
            title="Toplam İşlem"
            value={stats?.overview?.count || 0}
            icon={<TrendingUpIcon />}
            color="primary"
            subtitle="satış kaydı"
          />
        </Grid>
      </Grid>

      <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: 2 }}> {/* Grid'e üstten margin eklendi */}
        {/* Son Satışlar */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card sx={{ flexGrow: 1 }}> {/* Card'ın esnemesini sağla */}
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant={isMobile ? "h6" : "h6"} component="h2" gutterBottom>
                Son Satışlar
              </Typography>
              {recentSales.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentSales.map((sale, index) => (
                    <React.Fragment key={sale._id}>
                      <ListItem sx={{ px: 0, py: { xs: 1, md: 1.5 } }}>
                        <ListItemText
                          primary={
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: { xs: 1, sm: 0 }
                            }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', textAlign: { xs: 'center', sm: 'left' } }}>
                                {sale.product.name}
                              </Typography>
                              <Chip
                                label={formatCurrency(sale.price.amount)}
                                color="success"
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: { xs: 1, md: 1 } }}>
                              <Typography variant="body2" color="text.secondary">
                                Satıcı: {sale.seller.name} → Alıcı: {sale.buyer.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {sale.address.city} • {formatDate(sale.saleDate)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentSales.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Henüz satış kaydı bulunmuyor.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* En Çok Satış Yapılan Şehirler */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card sx={{ flexGrow: 1 }}> {/* Card'ın esnemesini sağla */}
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant={isMobile ? "h6" : "h6"} component="h2" gutterBottom>
                En Çok Satış Yapılan Şehirler
              </Typography>
              {stats?.topCities && stats.topCities.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {stats.topCities.slice(0, 5).map((city, index) => (
                    <React.Fragment key={city._id}>
                      <ListItem sx={{ px: 0, py: { xs: 1, md: 1.5 } }}>
                        <ListItemText
                          primary={
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: { xs: 0.5, sm: 0 }
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {city._id || 'Belirtilmemiş'}
                                </Typography>
                              </Box>
                              <Chip
                                label={city.count}
                                color="primary"
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(city.totalSales)}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < Math.min(stats.topCities.length, 5) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Şehir verisi bulunmuyor.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;