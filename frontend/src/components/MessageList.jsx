import Message from './Message';

const MessageList = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900">
      {messages.map(msg => (
        <Message key={msg._id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
