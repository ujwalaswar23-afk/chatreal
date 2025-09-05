import useChatStore from '../store/useChatStore';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const RoomList = ({ rooms, onSelectRoom }) => {
  const { activeRoom } = useChatStore();
  const { user } = useAuth();

  const getRoomDisplayInfo = (room) => {
    if (room.isPrivate) {
      const otherParticipant = room.participants.find(p => p._id !== user._id);
      return {
        name: otherParticipant?.username || 'Unknown User',
        avatar: otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.username}&background=random`,
      };
    }
    return {
      name: room.name,
      avatar: `https://ui-avatars.com/api/?name=${room.name}&background=random`,
    };
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {rooms.map(room => {
        const { name, avatar } = getRoomDisplayInfo(room);
        const isActive = activeRoom?._id === room._id;

        return (
          <div
            key={room._id}
            onClick={() => onSelectRoom(room)}
            className={`p-4 flex items-center cursor-pointer ${isActive ? 'bg-primary-50 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
          >
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full mr-4" />
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-semibold">{name}</h3>
                {room.lastActivity && (
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(room.lastActivity), { addSuffix: true })}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {room.lastMessage
                  ? room.lastMessage.type === 'text'
                    ? room.lastMessage.content
                    : room.lastMessage.type === 'image'
                      ? '[Image]'
                      : '[Video]'
                  : 'No messages yet'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoomList;
