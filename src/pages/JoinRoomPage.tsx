import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Hash, Shield, MessageCircle, ShoppingCart, Zap } from 'lucide-react';
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
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/rooms/join', {
        code: roomCode.trim().toUpperCase()
      }, {
        headers: { Authorization: `Bearer ${token}` }
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/rooms')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Rooms</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Shopping Room</h1>
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
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="roomCode"
                      value={roomCode}
                      onChange={handleCodeChange}
                      placeholder="Enter 8-character room code"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono tracking-wider transition-all"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Room codes are 8 characters long and case-insensitive
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-green-900">What you can do in the room:</h3>
                  </div>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>View and contribute to the shared shopping cart</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Chat with other participants in real-time</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>See who's currently active in the room</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Add or remove items collaboratively</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading || roomCode.length !== 8}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Joining Room...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Join Room</span>
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have a room code?{' '}
                  <button
                    onClick={() => navigate('/rooms/create')}
                    className="text-green-600 hover:text-green-800 font-medium transition-colors"
                  >
                    Create your own room
                  </button>
                </p>
              </div>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Join & Collaborate</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Shared Cart Access</h3>
                      <p className="text-sm text-gray-600">
                        View, add, and modify items in the room's shared shopping cart
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Instant Communication</h3>
                      <p className="text-sm text-gray-600">
                        Chat with room members while browsing and shopping together
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Live Collaboration</h3>
                      <p className="text-sm text-gray-600">
                        See who's online and collaborate in real-time on your shopping list
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Private & Secure</h3>
                      <p className="text-sm text-gray-600">
                        Only invited members can access the room with the unique code
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">🎯 Quick Tip</h3>
                <p className="text-sm text-blue-800">
                  Ask the room creator to share the 8-character code via text, email, or any messaging app. 
                  You'll be instantly connected to their shopping session!
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinRoomPage;