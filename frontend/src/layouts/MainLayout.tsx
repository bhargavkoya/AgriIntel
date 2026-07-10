import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import AppHeader from '../components/AppHeader';

function MainLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Container component="main" maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default MainLayout;
