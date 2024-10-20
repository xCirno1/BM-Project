import * as React from 'react';
import { alpha, Box, Button, Container, Link, Stack, Typography } from '@mui/material';
import {useTheme} from '@mui/material/styles'
import ImageLight from './assets/demo-light.png'
import ImageDark from './assets/demo-dark.png'
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  return (
    <Box
      sx={{
        width: '100%',
        backgroundImage:
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
            : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 2, sm: 4 },
        }}
      >
        <Stack spacing={2} useFlexGap>
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignSelf: 'center',
              textAlign: 'center',
              fontSize: 'clamp(3.5rem, 10vw, 4rem)',
            }}
          >
            The New&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={{
                fontSize: 'clamp(3rem, 10vw, 4rem)',
                color: theme.palette.mode === 'light' ? 'primary.main' : 'primary.dark',
              }}
            >
              Tutor System
            </Typography>
          </Typography>
          <Typography
            textAlign="center"
            color="text.secondary"
            sx={{ alignSelf: 'center', width: { sm: '100%', md: '80%' } }}
          >
            Check out our new tutor dashboard, where scheduling your study sessions is easier than ever. 
            Unlock awesome features designed to help you succeed and make the most out of your study time.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignSelf="center"
            spacing={1}
            useFlexGap
            sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}
          >
            <Button onClick={() => navigate(`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}/login`)} variant="outlined" color="primary">
              Try now
            </Button>
          </Stack>
        </Stack>
        <Box
          id="image"
          sx={{
            mt: { xs: 8, sm: 10 },
            alignSelf: 'center',
            height: "auto",
            width: '100%',              
            borderRadius: '10px',
            outline: '1px solid',
            outlineColor:
              theme.palette.mode === 'light'
                ? alpha('#BFCCD9', 0.5)
                : alpha('#9CCCFC', 0.1),
            boxShadow:
              theme.palette.mode === 'light'
                ? `0 0 12px 8px ${alpha('#9CCCFC', 0.2)}`
                : `0 0 24px 12px ${alpha('#033363', 0.2)}`,
          }}>
            <img alt="Landing Page" src={theme.palette.mode === 'light' ? ImageLight: ImageDark} width="100%" style={{display: "block", borderRadius: '10px'}}></img>
          </Box>
        <Typography variant="caption" textAlign="center" sx={{ mt: 5, opacity: 0.8 }}>
          Source code is available at&nbsp;
          <Link href="https://github.com/xCirno1/BM-Project" color="primary">
            this GitHub page
          </Link>
          .
        </Typography>
      </Container>
    </Box>
  );
}