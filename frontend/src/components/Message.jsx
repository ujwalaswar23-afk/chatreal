import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const Message = ({ message }) => {
  const { user } = useAuth();
  const isSender = message.sender._id === user._id;

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return <p>{message.content}</p>;
      case 'image':
        return <img src={message.mediaUrl} alt={message.fileName} className="max-w-xs rounded-lg" />;
      case 'video':
        return <video src={message.mediaUrl} controls className="max-w-xs rounded-lg" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}>
      {!isSender && (
        <img
          src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.username}&background=random`}
          alt={message.sender.username}
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <div className={`max-w-md p-3 rounded-lg ${isSender ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700'}`}>
        {!isSender && <p className="text-xs font-bold mb-1">{message.sender.username}</p>}
        {renderContent()}
        <p className={`text-xs mt-1 ${isSender ? 'text-gray-300' : 'text-gray-500'}`}>
          {format(new Date(message.createdAt), 'p')}
        </p>
      </div>
    </div>
  );
};

export default Message;
