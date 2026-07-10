import { Typography, Box, Paper, Grid } from '@mui/material';

const modules = [
  {
    title: 'Crop Disease Detection',
    description: 'TensorFlow CNN — classify apple leaf diseases from images.',
  },
  {
    title: 'Crop Yield Prediction',
    description: 'Scikit-learn ensemble — predict yield from agricultural data.',
  },
  {
    title: 'Soil Health Advisor',
    description: 'Rules + RF + LLM — multilingual farmer advisory.',
  },
];

function HomePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI-Powered Agricultural Decision Support
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        AgriIntel integrates three independent AI modules into a unified platform.
        Frontend pages will be implemented in Phase 4.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {modules.map((mod) => (
          <Grid item xs={12} md={4} key={mod.title}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {mod.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mod.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HomePage;
