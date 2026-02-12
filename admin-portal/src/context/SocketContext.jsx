import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth(); // Assuming useAuth provides current user and token

  useEffect(() => {
    // Only connect if user is authenticated
    if (user && token) {
        // Use the origin of the API URL for the socket connection
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const socketUrl = new URL(apiUrl).origin;

        const newSocket = io(socketUrl, {
            auth: {
                token: token
            }
        });

        newSocket.on('connect', () => {
            // Join hospital room if user has a hospital ID associated
            // user.hospital could be an ID string or an object depending on auth data structure
            const hospitalId = typeof user.hospital === 'object' ? user.hospital?._id : user.hospital;
            
            if (hospitalId) {
                newSocket.emit('join_hospital', hospitalId);
            }
        });

        newSocket.on('disconnect', () => {
            // Socket disconnected - can add reconnect logic here
        });

        newSocket.on('error', (err) => {
            console.error('Socket error:', err);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    } else {
        // If logged out, close socket
        if(socket) {
            socket.disconnect();
            setSocket(null);
        }
    }
  }, [user, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
