import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MessageCircle, ShoppingCart, Share2, Copy, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const RoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (id && user) {
      fetchRoom();
      joinRoom();
    }
  }, [id, user]);

  useEffect(() => {
    if (socket) {
      socket.on('user-joined', handleUserJoined);
      socket.on('user-left', handleUserLeft);
      socket.on('cart-updated', handleCartUpdated);
      socket.on('new-message', handleNewMessage);
      socket.on('user-typing', handleUserTyping);
      socket.on('room-participants', handleRoomParticipants);

      return () => {
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('cart-updated');
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('room-participants');
      };
    }
  }, [socket]);

  const fetchRoom = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/rooms/${id}`);
      setRoom(response.data);
      setMessages(response.data.chatHistory || []);
    } catch (error) {
      console.error('Error fetching room:', error);
      toast.error('Room not found');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    if (socket && user && id) {
      socket.emit('join-room', {
        roomId: id,
        userId: user._id,
        username: user.username
      });
    }
  };

  const handleUserJoined = (data: any) => {
    toast.success(`${data.username} joined the room`);
  };

  const handleUserLeft = (data: any) => {
    toast.info(`User left the room`);
  };

  const handleCartUpdated = (data: any) => {
    if (room) {
      setRoom({ ...room, sharedCart: data.cart });
    }
  };

  const handleNewMessage = (data: any) => {
    setMessages(prev => [...prev, data]);
  };

  const handleUserTyping = (data: any) => {
    if (data.isTyping) {
      setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
    } else {
      setTypingUsers(prev => prev.filter(u => u !== data.username));
    }
  };

  const handleRoomParticipants = (data: any) => {
    setParticipants(data);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user) {
      socket.emit('chat-message', {
        roomId: id,
        message: newMessage,
        userId: user._id,
        username: user.username,
        timestamp: new Date()
      });
      setNewMessage('');
    }
  };

  const handleTyping = (typing: boolean) => {
    if (socket && user) {
      socket.emit('typing', {
        roomId: id,
        userId: user._id,
        username: user.username,
        isTyping: typing
      });
    }
  };

  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      toast.success('Room code copied to clipboard');
    }
  };

  const shareRoom = async () => {
    try {
      await navigator.share({
        title: `Join my shopping room: ${room.name}`,
        text: `Use code: ${room.code}`,
        url: window.location.href,
      });
    } catch (error) {
      copyRoomCode();
    }
  };

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

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h1>
          <button
            onClick={() => navigate('/rooms')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Room Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
              <p className="text-gray-600">Room Code: {room.code}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={copyRoomCode}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Code</span>
              </button>
              <button
                onClick={shareRoom}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Room</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Participants Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Participants ({participants.length})</h2>
              </div>
              <div className="space-y-2">
                {participants.map((participant: any, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {participant.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">{participant.username}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shared Cart */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Shared Cart</h2>
              </div>
              {room.sharedCart && room.sharedCart.length > 0 ? (
                <div className="space-y-4">
                  {room.sharedCart.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.product.images[0]?.url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Added by: {item.addedBy.username}</p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No items in shared cart yet</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 h-96 flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Chat</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {messages.map((message: any, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-blue-600">{message.username}: </span>
                    <span className="text-gray-900">{message.message}</span>
                  </div>
                ))}
                {typingUsers.length > 0 && (
                  <div className="text-sm text-gray-500 italic">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onFocus={() => handleTyping(true)}
                  onBlur={() => handleTyping(false)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;