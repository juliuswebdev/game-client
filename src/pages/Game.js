import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Users from '../components/Users';
import Track from '../components/Track';

const Game = ({ username, room, socket }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if(username === ''){
      navigate('/', { replace: true });
    }
  }, []);

  return (
    <div className="game">
      <div className="hide">
        <Users socket={socket} />
      </div>
      <Track socket={socket} room={room} />
    </div>
  );
};

export default Game;