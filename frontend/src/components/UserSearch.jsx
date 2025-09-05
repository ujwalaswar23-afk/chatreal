import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserSearch = ({ onRoomCreated }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    if (e.target.value.length > 2) {
      try {
        const { data } = await axios.get(`/api/users?search=${e.target.value}`);
        setResults(data);
      } catch (error) {
        toast.error('Failed to search users');
      }
    } else {
      setResults([]);
    }
  };

  const handleSelectUser = async (userId) => {
    try {
      const { data } = await axios.get(`/api/rooms/private/${userId}`);
      onRoomCreated(data);
      setSearch('');
      setResults([]);
    } catch (error) {
      toast.error('Failed to create or get room');
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={handleSearch}
        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
      />
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
          {results.map(user => (
            <div
              key={user._id}
              onClick={() => handleSelectUser(user._id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
            >
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt={user.username} className="w-8 h-8 rounded-full mr-2" />
              <span>{user.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
