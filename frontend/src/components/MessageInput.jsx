import { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSend, FiPaperclip } from 'react-icons/fi';
import useChatStore from '../store/useChatStore';
import { useSocket } from '../context/SocketContext';

const MessageInput = () => {
  const [text, setText] = useState('');
  const socket = useSocket();
  const { activeRoom, addMessage } = useChatStore();
  const fileInputRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageData = {
      roomId: activeRoom._id,
      content: text,
      type: 'text'
    };

    // Optimistically add message to UI
    // A more robust solution would include a temp ID
    // addMessage({ ...messageData, sender: user, createdAt: new Date().toISOString() });

    socket.emit('sendMessage', messageData);
    setText('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', activeRoom._id);

    try {
      const { data } = await axios.post('/api/messages/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // The server will create the message and the socket will broadcast it
      // so we don't need to call addMessage here.
      // The 'newMessage' event listener in ChatWindow will handle it.
      
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSendMessage} className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="p-2 text-gray-500 hover:text-primary-500"
        >
          <FiPaperclip size={20} />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 mx-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none"
        />
        <button type="submit" className="p-2 text-white bg-primary-500 rounded-full hover:bg-primary-600">
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
