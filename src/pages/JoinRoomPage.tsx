import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Hash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const JoinRoomPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/rooms/join', {
        code: roomCode.trim().toUpperCase()
      });

      toast.success('Successfully joined the room!');
      navigate(`/rooms/${response.data._id}`);
    } catch (error: any) {
      console.error('Error joining room:', error);
      if (error.response?.status === 404) {
        toast.error('Room not found. Please check the code and try again.');
      } else {
        toast.error('Failed to join room');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit to 8 characters
    const value = e.target.value.toUpperCase().slice(0, 8);
    setRoomCode(value);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/rooms')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Rooms</span>
          </button>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Shopping Room</h1>
              <p className="text-gray-600">
                Enter the room code shared by your friend to join their shopping session
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="roomCode"
                    value={roomCode}
                    onChange={handleCodeChange}
                    placeholder="Enter 8-character room code"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Room codes are 8 characters long and case-insensitive
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-900 mb-2">What you can do in the room:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• View and contribute to the shared shopping cart</li>
                  <li>• Chat with other participants in real-time</li>
                  <li>• See who's currently active in the room</li>
                  <li>• Participate in split payment when checking out</li>
                  <li>• Add or remove items collaboratively</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || roomCode.length !== 8}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining Room...' : 'Join Room'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have a room code?{' '}
                <button
                  onClick={() => navigate('/rooms/create')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create your own room
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinRoomPage;