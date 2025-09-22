import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import SalesList from './pages/SalesList';
import SalesForm from './pages/SalesForm';
import Dashboard from './pages/Dashboard';

// Theme - Temel yapı aynı kalacak
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 44,
          minWidth: 44,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 44,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          minWidth: 44,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            '& .MuiToolbar-root': {
              minHeight: 56,
              paddingLeft: 8,
              paddingRight: 8,
            },
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});


function App() {
  const [ipAccess, setIpAccess] = useState({ allowed: null, loading: true });

  useEffect(() => {
    const checkAccess = async () => {
      const result = await checkIPAccess();
      setIpAccess(result);
    };
    
    checkAccess();
  }, []);

  // IP kontrolü yükleniyor
  if (ipAccess.loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h6">Erişim kontrol ediliyor...</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  // IP erişimi reddedildi
  if (!ipAccess.allowed) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">Erişim Engellendi</Typography>
            <Typography variant="body2">
              IP adresiniz ({ipAccess.ip}) bu sisteme erişim için yetkili değil.
            </Typography>
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflowX: 'hidden'
        }}>
          <Navbar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              pt: { xs: '56px', sm: '64px' },
              px: { xs: 2, md: 3 },
              pb: 3,
              // Bu satırı ekleyerek içeriği genel olarak ortalamayı hedefliyoruz
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // Yatay eksende ortalamak için
              '& > *': { // Route içindeki ana bileşeni (örneğin Container) hedef alır
                width: '100%', // İç bileşenin tam genişlikte olmasını sağlar
                maxWidth: theme.breakpoints.values.lg, // En fazla lg breakpoint'ine kadar genişler
              }
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales" element={<SalesList />} />
              <Route path="/sales/new" element={<SalesForm />} />
              <Route path="/sales/edit/:id" element={<SalesForm />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;