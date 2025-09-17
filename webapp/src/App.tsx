import './App.css'
import AppRouter from './AppRouter'
import { AppBar, Container, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaTrophy } from "react-icons/fa";
import { getSessionUserId } from './services/user_service';
import { FaMagnifyingGlass } from "react-icons/fa6";

function App() {
  const location = useLocation();
  // Determine which tab is selected
  let value = 0;
  if (location.pathname.startsWith('/home') || location.pathname === '/') value = 0;
  else if (location.pathname.startsWith('/browse')) value = 1;
  else if (location.pathname.startsWith('/career')) value = 2;
  else if (location.pathname.startsWith('/profile')) value = 3;



  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#383838', padding: 2, width: '100vw', left: 0, top: 0, position: 'fixed', zIndex: 1100 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/home">
            <Typography component="h1" variant="h5" sx={{ color: '#fff' }}>Kickoff</Typography>
          </Link>          
          
        </Container>
      </AppBar>

      {/* Add padding to the main content to avoid overlap with the fixed AppBar */}      <div style={{ paddingTop: '0px' }}>
        <AppRouter />
      </div>

      {getSessionUserId() !== -1 && (
        <BottomNavigation
          sx={{ width: '100%', position: 'fixed', bottom: 0, left: 0, backgroundColor: '#383838', zIndex: 1100 }}
          showLabels
          value={value}
        >
          <BottomNavigationAction label="Inicio" icon={<FaHome />} component={Link} to="/home" />
          {/*<BottomNavigationAction label="Ligas" icon={<GiLaurelsTrophy />} component={Link} to="/leagues" />*/}
          <BottomNavigationAction label="Buscar" icon={<FaMagnifyingGlass />} component={Link} to="/browse" />
          <BottomNavigationAction label="Carrera" icon={<FaTrophy />} component={Link} to="/career" />
          <BottomNavigationAction label="Perfil" icon={<FaUser />} component={Link} to="/profile" />
        </BottomNavigation>
      )}
    </>
  );
}

export default App
