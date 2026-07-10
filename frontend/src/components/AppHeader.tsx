import { AppBar, Toolbar, Typography } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';

function AppHeader() {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <AgricultureIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AgriIntel
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Phase 1 Scaffold
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
