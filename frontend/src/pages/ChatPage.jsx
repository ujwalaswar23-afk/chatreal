import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import useChatStore from '../store/useChatStore';

const ChatPage = () => {
  const { activeRoom } = useChatStore();

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {activeRoom ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
