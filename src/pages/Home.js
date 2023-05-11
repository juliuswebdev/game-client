import { useNavigate } from 'react-router-dom';

const Home = ({ username, setUsername, room, socket }) => {
  const navigate = useNavigate();
  
  const joinRoom = () => {
    if (username !== '') {
      socket.emit('join_room', { username, room, role: 'player' });
      navigate('/game', { replace: true });
    } else {
      console.log('Please enter username')
    }
  };
  
  return (
    <div className="home">
      <input onChange={(e) => setUsername(e.target.value)} placeholder='Enter name...' />
      <button onClick={()=> joinRoom()}>Join Race</button>
    </div>
  );
};

export default Home;