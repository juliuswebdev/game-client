import { useState, useEffect } from 'react';

const Users = ({ socket }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on('room_users', (data) => {
      const sortedData = data.sort((a, b) => parseFloat(b.time) - parseFloat(a.time));
      setUsers(sortedData);
    });

    return () => socket.off('room_users');
  }, [socket]);

  return (
    <div className="users">
      <table>
        <thead>
          <tr>
            <td className="users-no">RANK</td>
            <td className="users-username">NAME</td>
            <td className="users-distance">DISTANCE</td>
            <td className="users-time">TIME</td>
            <td className="users-time">POINTS</td>
          </tr>
        </thead>
        <tbody>
          { users.map((user, index) => {

            const sec = user.time / 1000;
            var minutes = Math.floor((sec)/60);
            
            return <tr key={user.id}>
              <td className="users-no">{index + 1}</td>
              <td className="users-username">{user.username} <span className={user.status}>{user.status}</span></td>
              <td className="users-distance">{user.distance / 4} km</td>
              <td className="users-time">{minutes}:{Math.floor(sec)}</td>
              <td className="users-time">{user.time}</td>
            </tr>}
          ) }
        </tbody>
      </table>
    </div>
  );
};

export default Users;