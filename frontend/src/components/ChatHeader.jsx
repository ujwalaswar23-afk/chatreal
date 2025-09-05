import useChatStore from '../store/useChatStore';
import { useAuth } from '../context/AuthContext';

const ChatHeader = () => {
  const { activeRoom } = useChatStore();
  const { user } = useAuth();

  if (!activeRoom) return null;

  const getRoomDisplayInfo = () => {
    if (activeRoom.isPrivate) {
      const otherParticipant = activeRoom.participants.find(p => p._id !== user._id);
      return {
        name: otherParticipant?.username || 'Unknown User',
        avatar: otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.username}&background=random`,
        status: otherParticipant?.isOnline ? 'Online' : 'Offline',
      };
    }
    return {
      name: activeRoom.name,
      avatar: `https://ui-avatars.com/api/?name=${activeRoom.name}&background=random`,
      status: `${activeRoom.participants.length} members`,
    };
  };

  const { name, avatar, status } = getRoomDisplayInfo();

  return (
    <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-800">
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full mr-4" />
      <div>
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-gray-500">{status}</p>
      </div>
    </header>
  );
};

export default ChatHeader;
