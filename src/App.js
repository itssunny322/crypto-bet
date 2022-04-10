import { BrowserRouter, Routes ,Route} from 'react-router-dom';
import './App.css';
import Home from './components/home';
import Nav from './components/Nav';
import Wallet from './components/Wallet';


function App() {
  return (
    <div className="App">
      <Nav/>
    <BrowserRouter>
    <Routes >
      <Route path="/" element={<Home />}></Route>
      <Route path="/wallet" element ={<Wallet/>}></Route>
    </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
