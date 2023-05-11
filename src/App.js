import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Home from './pages/Home';
import Game from './pages/Game';
import Admin from './pages/Admin';

const socket = io.connect('http://localhost:4000');

function App() {
  const [username, setUsername] = useState('');
  const room = 'crescendoRace';

  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/' element={
              <Home
                username={username}
                setUsername={setUsername}
                room={room}
                socket={socket}
              />
            }
          />
          <Route path='/game' element={
              <Game
                username={username}
                room={room}
                socket={socket}
              />
            }
          />
          <Route path='/admin' element={
              <Admin room={room} socket={socket} />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
