import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  Add as AddIcon
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Satışlar', path: '/sales', icon: <ListIcon /> },
    { label: 'Yeni Satış', path: '/sales/new', icon: <AddIcon /> },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <AppBar 
      position="fixed"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 25%, #66bb6a 50%, #4caf50 75%, #2e7d32 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
        boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          animation: 'shimmer 3s ease-in-out infinite',
          pointerEvents: 'none'
        },
        '@keyframes gradientShift': {
          '0%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          },
          '100%': {
            backgroundPosition: '0% 50%'
          }
        },
        '@keyframes shimmer': {
          '0%': {
            transform: 'translateX(-100%)'
          },
          '100%': {
            transform: 'translateX(100%)'
          }
        }
      }}
    >
      <Toolbar sx={{ 
        minHeight: isMobile ? 56 : 64,
        px: isMobile ? 1 : 3,
        gap: isMobile ? 1 : 2,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo */}
        <Box
          onClick={handleLogoClick}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mr: 2,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              filter: 'brightness(1.1) drop-shadow(0 0 10px rgba(255,255,255,0.3))',
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          }}
        >
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{
              height: isMobile ? 45 : 55,
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
              transition: 'all 0.3s ease-in-out'
            }}
            onError={(e) => {
              // Logo yüklenemezse fallback ikon göster
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <Box
            sx={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? 45 : 55,
              height: isMobile ? 45 : 55,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)',
                boxShadow: '0 0 20px rgba(255,255,255,0.3)',
              }
            }}
          >
            <DashboardIcon sx={{ 
              color: 'white',
              fontSize: isMobile ? 28 : 35
            }} />
          </Box>
        </Box>
        
        {/* Logo Text */}
        <Typography
          variant={isMobile ? "h6" : "h5"}
          component="div"
          onClick={handleLogoClick}
          sx={{ 
            fontWeight: 'bold',
            cursor: 'pointer',
            flexGrow: 1,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              textShadow: '0 4px 8px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.2)',
            }
          }}
        >
          {isMobile ? 'Satış Takip' : 'Satış Takip Sistemi'}
        </Typography>
        
        {/* Menu Items */}
        <Box sx={{ 
          display: 'flex', 
          gap: isMobile ? 0.5 : 1,
          flexWrap: 'nowrap'
        }}>
          {menuItems.map((item) => (
            <Tooltip key={item.path} title={item.label}>
              <Button
                color="inherit"
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                size={isMobile ? "small" : "medium"}
                sx={{
                  backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                  },
                  minWidth: isMobile ? 'auto' : 120,
                  px: isMobile ? 1 : 2,
                  whiteSpace: 'nowrap',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(5px)',
                }}
              >
                {isMobile ? item.icon : item.label}
              </Button>
            </Tooltip>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
