import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Calendar, 
  Share2, 
  Eye, 
  ShoppingCart,
  MessageCircle,
  Clock,
  Star,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const RoomDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, created, joined

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/rooms/user/my-rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(rooms.filter((room: any) => room._id !== roomId));
      toast.success('Room deleted successfully');
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Room code copied to clipboard');
  };

  const filteredRooms = rooms.filter((room: any) => {
    if (filter === 'created') return room.creator._id === user?._id;
    if (filter === 'joined') return room.creator._id !== user?._id;
    return true;
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Rooms</h1>
              <p className="text-gray-600 mt-2">
                Collaborate with friends and family on your shopping adventures
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/rooms/join"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2 shadow-md"
              >
                <Users className="h-5 w-5" />
                <span>Join Room</span>
              </Link>
              <Link
                to="/rooms/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md"
              >
                <Plus className="h-5 w-5" />
                <span>Create Room</span>
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Rooms', count: rooms.length },
              { key: 'created', label: 'Created by Me', count: rooms.filter((r: any) => r.creator._id === user._id).length },
              { key: 'joined', label: 'Joined', count: rooms.filter((r: any) => r.creator._id !== user._id).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Carts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rooms.filter((r: any) => r.sharedCart && Array.isArray(r.sharedCart) && r.sharedCart.length > 0).length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rooms.reduce((total: number, room: any) => total + (room.chatHistory?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100"
            >
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No shopping rooms yet' : `No ${filter} rooms`}
              </h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Create your first shopping room to start collaborating with friends and family.'
                  : `You haven't ${filter === 'created' ? 'created' : 'joined'} any rooms yet.`
                }
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/rooms/create"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Your First Room
                </Link>
                <Link
                  to="/rooms/join"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Join Existing Room
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room: any, index) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 group"
                >
                  {/* Room Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {room.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">#{room.code}</span>
                          <button
                            onClick={() => copyRoomCode(room.code)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Share2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {room.creator._id === user._id && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-xs text-yellow-600 font-medium">Owner</span>
                        </div>
                      )}
                    </div>

                    {/* Room Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{room.participants.length} members</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ShoppingCart className="h-4 w-4" />
                        <span>{room.sharedCart?.length || 0} items</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MessageCircle className="h-4 w-4" />
                        <span>{room.chatHistory?.length || 0} messages</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Shared Cart Preview */}
                    {room.sharedCart && room.sharedCart.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">Shared Cart</span>
                          <span className="text-sm font-bold text-blue-900">
                            ${room.sharedCart.reduce((total: number, item: any) => {
                              const price = item.product?.price || item.productData?.price || 0;
                              const quantity = item.quantity || 0;
                              return total + (price * quantity);
                            }, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {room.sharedCart.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs text-blue-800">
                              <span className="truncate">
                                {item.product?.name || item.productData?.name || 'Unknown Product'}
                              </span>
                              <span>x{item.quantity || 0}</span>
                            </div>
                          ))}
                          {room.sharedCart.length > 2 && (
                            <div className="text-xs text-blue-600">
                              +{room.sharedCart.length - 2} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Room Actions */}
                  <div className="px-6 pb-6">
                    <div className="flex space-x-2">
                      <Link
                        to={`/rooms/${room._id}`}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Enter Room</span>
                      </Link>
                      
                      <Link
                        to={`/products?roomId=${room._id}`}
                        className="bg-green-100 text-green-600 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center"
                        title="Browse Products for this Room"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Link>

                      {room.creator._id === user._id && (
                        <button
                          onClick={() => deleteRoom(room._id)}
                          className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RoomDashboard;