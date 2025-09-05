import { create } from 'zustand';

const useChatStore = create((set) => ({
  rooms: [],
  activeRoom: null,
  messages: [],
  typingUsers: [],

  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [room, ...state.rooms] })),
  
  setActiveRoom: (room) => set({ activeRoom: room, messages: [], typingUsers: [] }),
  
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  
  setTypingUsers: (users) => set({ typingUsers: users }),
  addTypingUser: (user) => set((state) => ({
    typingUsers: state.typingUsers.some(u => u.userId === user.userId)
      ? state.typingUsers
      : [...state.typingUsers, user]
  })),
  removeTypingUser: (user) => set((state) => ({
    typingUsers: state.typingUsers.filter(u => u.userId !== user.userId)
  })),
}));

export default useChatStore;
