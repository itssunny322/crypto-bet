import { BrowserRouter, Routes ,Route} from 'react-router-dom';
import './App.css';
import Home from './components/home';
import Nav from './components/Nav';
import Wallet from './components/Wallet';
import MatchDetail from './components/MatchDetail';
import Bet from './components/Bet';
import Store from './components/Store';


function App() {
  return (
    <div className="App">
      <Nav/>
    <BrowserRouter>
    <Routes >
      <Route path="/" element={<Home />}></Route>
      <Route path="/wallet" element ={<Wallet/>}></Route>
      <Route path="/detail/:id" element={<MatchDetail/>}></Route>
      <Route path="/bet/:id" element={<Bet/>}></Route>
      <Route path="/store" element={<Store/>}></Route>
    </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
