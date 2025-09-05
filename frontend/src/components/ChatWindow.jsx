import { useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useChatStore from '../store/useChatStore';
import { useSocket } from '../context/SocketContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = () => {
  const socket = useSocket();
  const { activeRoom, messages, setMessages, addMessage, addTypingUser, removeTypingUser } = useChatStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/messages/room/${activeRoom._id}`);
        setMessages(data);
      } catch (error) {
        toast.error('Failed to fetch messages');
      }
    };
    fetchMessages();
  }, [activeRoom, setMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.room === activeRoom?._id) {
        addMessage(message);
      }
    };

    const handleUserTyping = (data) => {
      if (data.isTyping) {
        addTypingUser(data);
      } else {
        removeTypingUser(data);
      }
    };

    // Join the active room to receive events
    if (activeRoom?._id) {
      socket.emit('joinRoom', activeRoom._id);
    }

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleUserTyping);

    return () => {
      if (activeRoom?._id) {
        socket.emit('leaveRoom', activeRoom._id);
      }
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
    };
  }, [socket, activeRoom, addMessage, addTypingUser, removeTypingUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeRoom) return null;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageList messages={messages} messagesEndRef={messagesEndRef} />
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
