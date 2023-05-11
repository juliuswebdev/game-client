import React, { useState, useEffect, useCallback } from 'react';
import { obstaclePattern, obstaclePatternTrial } from '../helpers/constants';

const Track = ({ socket, room }) => {
  const [carSpeed, setCarSpeed] = useState(3);
  const [carPosition, setCarPosition] = useState('middle');
  const [isStarted, setIsStarted] = useState(false);
  const [startedTime, setStartedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const isClickedLeft = useKeyPress("a");
  const isClickedRight = useKeyPress("d");
  const [notAllowedLeft, setNotAllowedLeft] = useState(false);
  const [notAllowedMiddle, setNotAllowedMiddle] = useState(false);
  const [notAllowedRight, setNotAllowedRight] = useState(false);
  const [isGameOver, setGameOver] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [obstaclesPatternIndex, setObstaclesPatternIndex] = useState(0);
  const [adminMessageBoard, setAdminMessageBoard] = useState('');
  const [trackPattern, setTrackPattern] = useState([]);

  useEffect(()=>{
    if(distance > 0 && !isGameOver && !isFinished){
      distanceInterval();
      setObstableFromPattern(trackPattern);
    }
  },[distance])

  useEffect(() => {
    socket.on('user_start', (data) => {
      if(data === 'trial'){
        setTrackPattern(obstaclePatternTrial);
      } else {
        setTrackPattern(obstaclePattern);
      }
      
      setGameOver(false);
      setIsFinished(false);
      setObstacles([]);
      setIsStarted(true);
      setStartedTime(Date.now());
      setDistance(1);
      setCarSpeed(3);
      setObstaclesPatternIndex(0);
      setAdminMessageBoard('');
    });

    return () => socket.off('user_start');
  }, [socket]);

  useEffect(() => {
    if(isClickedLeft && !isGameOver && !isFinished){
      switch(carPosition){
        case 'right':
          setCarPosition('middle');
          validateCarCashed('middle');
          break;
        case 'middle':
          setCarPosition('left');
          validateCarCashed('left');
          break;
        default:
          break;
      }
    }
  }, [isClickedLeft]);

  useEffect(() => {
    if(isClickedRight && !isGameOver && !isFinished){
      switch(carPosition){
        case 'left':
          setCarPosition('middle');
          validateCarCashed('middle');
          break;
        case 'middle':
          setCarPosition('right');
          validateCarCashed('right');
          break;
        default:
          break;
      }
    }
  }, [isClickedRight]);

  useEffect(() => {
    validateCarCashed(carPosition);
  }, [notAllowedLeft, notAllowedMiddle, notAllowedRight])

  const distanceInterval = () => {
    setTimeout(()=>{
      if(!isGameOver && !isFinished){
        const newDistance = distance + 1;
        setDistance(newDistance);
        const newTime = Date.now() - startedTime;
        socket.emit('set_player_distance', { room, distance: newDistance, time: newTime });
      }
    }, carSpeed *1000);
  }

  const getLimit = (speed) => {
    switch(speed){
      case 1:
        return {
          limit: 0.6,
          clear: 0.20
        };
      case 1.5:
        return {
          limit: 0.9,
          clear: 0.32
        };
      case 2:
        return {
          limit: 1.1,
          clear: 0.55
        };
      case 3:
        return {
          limit: 1.65,
          clear: 0.80
        };
      case 4:
        return {
          limit: 2.15,
          clear: 1.20
        };
      case 5:
        return {
          limit: 2.7,
          clear: 1.52
        };
      case 6:
        return {
          limit: 3.25,
          clear: 1.76
        };
      case 7:
        return {
          limit: 3.72,
          clear: 1.8
        };
      case 8:
        return {
          limit: 4.25,
          clear: 2.3
        };
    }
  }

  const setObstaclesNotAllowed = useCallback((obstacles) => {
    obstacles.forEach((obstacle) => {
      let setNotAllowed;
      switch(obstacle.lane){
        case 'left':
          setNotAllowed = setNotAllowedLeft;
          break;
        case 'middle':
          setNotAllowed = setNotAllowedMiddle;
          break;
        case 'right':
          setNotAllowed = setNotAllowedRight;
          break;
      }
  
      setTimeout(() => {
        setNotAllowed(true);
        setTimeout(() => {
          setNotAllowed(false);
          
        }, obstacle.clear * 1000);
      }, obstacle.limit * 1000);
    })
    
  }, [setNotAllowedLeft, setNotAllowedMiddle, setNotAllowedRight]);


  const randomColor = () => {
    const colorNum = Math.floor(Math.random() * 4);
    switch(colorNum){
      case 0:
        return 'yellow';
      case 1:
        return 'blue';
      case 2:
        return 'green';
      default:
        return 'white';
    }
  }

  const handleAddObstacle = useCallback((lane) => {
    if(isStarted && !isGameOver && !isFinished){
      const obstacle = lane.map(l => {
        const id = Date.now() + Math.random();
        const speed =  l.speed == 'random' ? Math.floor(Math.random() * 5) + 4 : l.speed;
        const allowed = getLimit(speed);
        return {
          id,
          lane: l.lane,
          color: randomColor(),
          speed,
          limit: allowed.limit,
          clear: allowed.clear,
        }
      });
      setObstacles([...obstacles, ...obstacle]);
      setObstaclesNotAllowed(obstacle);
    }
  }, [obstacles, setObstacles, setObstaclesNotAllowed, randomColor]);

  const setObstableFromPattern = useCallback((pattern) => {
    if(pattern.length > obstaclesPatternIndex){
      const { onDistance, obstableDrop ,adminMessage, carSpeed, finished} = pattern[obstaclesPatternIndex];
      if(distance === onDistance){
        let obstaclesList = [];
        (obstableDrop).forEach((car) => {
            obstaclesList.push({
              lane: car.lane,
              speed: car.speed
            });
        });
        handleAddObstacle(obstaclesList);
        setObstaclesPatternIndex(obstaclesPatternIndex + 1);

        if(adminMessageBoard){
          setAdminMessageBoard('');
        }

        if(adminMessage){
          setAdminMessageBoard(adminMessage);
        }

        if(carSpeed){
          setCarSpeed(carSpeed);
        }

        if(finished){
          const newTime = Date.now() - startedTime;
          setIsFinished(true);
          socket.emit('finished', { room, time: newTime });
        }
      }
    }
  }, [obstaclesPatternIndex, setObstaclesPatternIndex, handleAddObstacle]);
  
  const validateCarCashed = (currentPosition) => {

    switch(currentPosition){
      case 'left':
        if(notAllowedLeft){
          const newTime = Date.now() - startedTime;
          setGameOver(true);
          socket.emit('game_over', { room, time: newTime });
          setAdminMessageBoard('Game Over!');
        }
        break;
      case 'middle':
        if(notAllowedMiddle){
          const newTime = Date.now() - startedTime;
          setGameOver(true);
          socket.emit('game_over', { room, time: newTime });
          setAdminMessageBoard('Game Over!');
        }
        break;
      case 'right':
        if(notAllowedRight){
          const newTime = Date.now() - startedTime;
          setGameOver(true);
          socket.emit('game_over', { room, time: newTime });
          setAdminMessageBoard('Game Over!');
        }
        break;
    }

  }

  const handleMobileButton = (isClicked) => {
    if(isClicked == 'right' && !isGameOver && !isFinished){
      switch(carPosition){
        case 'left':
          setCarPosition('middle');
          validateCarCashed('middle');
          break;
        case 'middle':
          setCarPosition('right');
          validateCarCashed('right');
          break;
        default:
          break;
      }
    }
    if(isClicked == 'left' && !isGameOver && !isFinished){
      switch(carPosition){
        case 'right':
          setCarPosition('middle');
          validateCarCashed('middle');
          break;
        case 'middle':
          setCarPosition('left');
          validateCarCashed('left');
          break;
        default:
          break;
      }
    }
  }

  const developerLine = (lane) => {
    switch(lane){
      case 'left':
        return notAllowedLeft ? 'tempBorder' : null;
      case 'middle':
        return notAllowedMiddle ? 'tempBorder' : null;
      case 'right':
        return notAllowedRight ? 'tempBorder' : null;
    }
  }

  return (
    <div className="track">
      <div
        className={`road ${isGameOver ? 'paused' : null}`}
        style={isStarted ? { animation: `animatedBackground ${carSpeed}s linear infinite`} : null}
      >
        { !isStarted ? <div className='instructions'></div> : null }
        { adminMessageBoard ? <div className="adminMessage">{ adminMessageBoard }</div> : null }
        <div className={`player car ${carPosition} ${isGameOver ? 'crashed' : null}`}></div>
        {
          obstacles.map((obstacle) => {
            return <div
              key={'obstacle' + obstacle.id}
              className={`lane ${obstacle.lane} ${obstacle.color}`}
              style={{ animation: `animatedObstacle ${obstacle.speed}s linear`}}
            >
          
            </div>
          })
        }
        <span className='distance'>distance: {distance / 4} KM</span>

        <div className="mobile-buttons">
          <div className="left" onClick={() => handleMobileButton('left')}></div>
          <div className="right" onClick={() => handleMobileButton('right')}></div>
        </div>
      </div>
    </div>
  );
};


// Hook
function useKeyPress(targetKey) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState(false);
  // If pressed key is our target key then set to true
  function downHandler({ key }) {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }
  // If released key is our target key then set to false
  const upHandler = ({ key }) => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };
  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount
  return keyPressed;
}

export default Track;