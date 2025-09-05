import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-200">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login to RealChat</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600">
            Login
          </button>
        </form>
        <p className="text-center mt-4">
          Don't have an account? <a href="/register" className="text-primary-500">Register</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
