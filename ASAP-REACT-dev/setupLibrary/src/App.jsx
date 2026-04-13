import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import HorizontalLinearStepper from './Wizard'

export default function App() {
  
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box variant="plain">
          <Typography variant="subtitle">
            Auto Suggest a Purchase
          </Typography>
          <Typography variant="h4">
            Configure for your Library
          </Typography>
        </Box>
        <Box>
          <HorizontalLinearStepper></HorizontalLinearStepper>
        </Box>
      </Container>
    </>
  );
}