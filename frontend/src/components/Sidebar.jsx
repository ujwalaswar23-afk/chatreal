import { useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useChatStore from '../store/useChatStore';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import RoomList from './RoomList';
import UserSearch from './UserSearch';
import { FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const { rooms, setRooms, addRoom, setActiveRoom } = useChatStore();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get('/api/rooms');
        setRooms(data);
      } catch (error) {
        toast.error('Failed to fetch rooms');
      }
    };
    fetchRooms();
  }, [setRooms]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // This could be enhanced to update last message in room list
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket]);

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
  };

  const handleCreateRoom = (newRoom) => {
    addRoom(newRoom);
    setActiveRoom(newRoom);
  };

  return (
    <aside className="w-1/3 md:w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">{user?.username}</h2>
        <button onClick={logout} className="text-gray-500 hover:text-red-500">
          <FiLogOut size={20} />
        </button>
      </header>
      <div className="p-4">
        <UserSearch onRoomCreated={handleCreateRoom} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <RoomList rooms={rooms} onSelectRoom={handleSelectRoom} />
      </div>
    </aside>
  );
};

export default Sidebar;
