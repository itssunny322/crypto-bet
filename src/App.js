import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/home';
import Nav from './components/Nav';
import Wallet from './components/Wallet';
import MatchDetail from './components/MatchDetail';
import Bet from './components/Bet';
import Store from './components/Store';
import AdminPage from './components/AdminPage';



function App() {
  return (
    <div className="App">
    
      <Router>
      <Nav/>
        <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/wallet" element={<Wallet/>} />
        <Route path="/match/:id" element={<MatchDetail/>} />
        <Route path="/bet/:id" element={<Bet/>} />
        <Route path="/detail/:id" element={<MatchDetail/>} />
        <Route path="/store" element={<Store/>} />
        <Route path="/admin" element={<AdminPage/>} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
