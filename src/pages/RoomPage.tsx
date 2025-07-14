import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  ShoppingCart, 
  Share2, 
  Copy, 
  UserPlus, 
  ArrowLeft,
  Send,
  Minus,
  Plus,
  X,
  Package,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const RoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToCart } = useCart();
  
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

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
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    setParticipants(prev => [...prev, { userId: data.userId, username: data.username }]);
  };

  const handleUserLeft = (data: any) => {
    toast.info(`User left the room`);
    setParticipants(prev => prev.filter(p => p.userId !== data.userId));
  };

  const handleCartUpdated = (data: any) => {
    if (room) {
      setRoom({ ...room, sharedCart: data.cart });
      toast.success('Shared cart updated');
    }
  };

  const handleNewMessage = (data: any) => {
    setMessages(prev => [...prev, data]);
    if (!showChatPopup) {
      setUnreadMessages(prev => prev + 1);
    }
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

  const updateSharedCartQuantity = async (productId: string, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/rooms/${id}/cart`, {
        productId,
        quantity,
        action: 'update'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const removeFromSharedCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/rooms/${id}/cart`, {
        productId,
        action: 'remove'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const addToSharedCart = async (product: any, quantity: number = 1) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/rooms/${id}/cart`, {
        productId: product._id || product.id,
        quantity,
        action: 'add',
        productData: {
          name: product.name,
          price: product.price,
          images: product.images || [product.imageUrl],
          description: product.description
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Item added to shared cart');
    } catch (error) {
      console.error('Error adding to shared cart:', error);
      toast.error('Failed to add item to shared cart');
    }
  };

  const proceedToSplitCheckout = () => {
    if (!room?.sharedCart || room.sharedCart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    navigate(`/checkout/split/${id}`);
  };

  const proceedToFullCheckout = async () => {
    if (!room?.sharedCart || room.sharedCart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001/api/rooms/${id}/checkout`, {
        shippingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'United States'
        },
        paymentSplits: [{
          user: user._id,
          amount: getSharedCartTotal() + (getSharedCartTotal() * 0.08) + (getSharedCartTotal() > 35 ? 0 : 5.99),
          status: 'pending'
        }]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Order created successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  const addToPersonalCart = (item: any) => {
    addToCart(item.product, item.quantity);
    toast.success('Added to your personal cart');
  };

  const getSharedCartTotal = () => {
    if (!room?.sharedCart || !Array.isArray(room.sharedCart)) return 0;
    return room.sharedCart.reduce((total: number, item: any) => {
      const price = item.product?.price || item.productData?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
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
        {/* Back Button */}
        <button
          onClick={() => navigate('/rooms')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Rooms</span>
        </button>

        {/* Room Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>{participants.length} active participants</span>
                  </span>
                  <span>•</span>
                  <span>Room Code: <span className="font-mono font-semibold text-blue-600">#{room.code}</span></span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Participants Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Participants ({participants.length})</h2>
              </div>
              <div className="space-y-3">
                {participants.map((participant: any, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {participant.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{participant.username}</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => navigate(`/products?roomId=${id}`)}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <Package className="h-4 w-4" />
                <span>Browse Products</span>
              </button>
            </motion.div>
          </div>

          {/* Main Content - Shared Cart */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold">Shared Shopping Cart</h2>
                  </div>
                  {room.sharedCart && room.sharedCart.length > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Items: {room.sharedCart.length}</p>
                      <p className="text-lg font-bold text-gray-900">${getSharedCartTotal().toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {room.sharedCart && room.sharedCart.length > 0 ? (
                  <div className="space-y-4">
                    {room.sharedCart.map((item: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <img
                          src={item.product?.images?.[0] || item.product?.imageUrl || item.productData?.images?.[0] || '/placeholder.jpg'}
                          alt={item.product?.name || item.productData?.name || 'Product'}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.product?.name || item.productData?.name || 'Unknown Product'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            ${(item.product?.price || item.productData?.price || 0).toFixed(2)} each
                          </p>
                          <p className="text-xs text-gray-500">Added by: {item.addedBy?.username || 'Unknown'}</p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateSharedCartQuantity(item.product?._id || item.externalProductId, item.quantity - 1)}
                              className="p-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 border border-gray-300 rounded-md min-w-[50px] text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateSharedCartQuantity(item.product?._id || item.externalProductId, item.quantity + 1)}
                              className="p-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${((item.product?.price || item.productData?.price || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => addToPersonalCart(item)}
                              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                              Add to My Cart
                            </button>
                            <button
                              onClick={() => removeFromSharedCart(item.product?._id || item.externalProductId)}
                              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-900">Total: ${getSharedCartTotal().toFixed(2)}</span>
                        <div className="flex space-x-3">
                          <button 
                            onClick={proceedToSplitCheckout}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                          >
                            Split Payment
                          </button>
                          <button 
                            onClick={proceedToFullCheckout}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                          >
                            Full Checkout
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No items in shared cart yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start adding products to shop together with your friends
                    </p>
                    <button
                      onClick={() => navigate(`/products?roomId=${id}`)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Browse Products
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Chat Popup */}
      <AnimatePresence>
        {showChatPopup && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Room Chat</h3>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                  {participants.length} online
                </span>
              </div>
              <button
                onClick={() => {
                  setShowChatPopup(false);
                  setUnreadMessages(0);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Shared Cart Summary in Chat */}
            {room.sharedCart && room.sharedCart.length > 0 && (
              <div className="p-3 bg-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Shared Cart ({room.sharedCart.length} items)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-blue-900">
                    ${getSharedCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {room.sharedCart.slice(0, 2).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs text-blue-800">
                      <span>{item.product?.name || item.productData?.name || 'Unknown Product'} x{item.quantity}</span>
                      <span>${((item.product?.price || item.productData?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {room.sharedCart.length > 2 && (
                    <div className="text-xs text-blue-600">
                      +{room.sharedCart.length - 2} more items...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((message: any, index) => (
                <div
                  key={index}
                  className={`flex ${message.userId === user._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.userId === user._id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.userId !== user._id && (
                      <p className="text-xs font-medium mb-1 opacity-75">{message.username}</p>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {typingUsers.length > 0 && (
                <div className="text-xs text-gray-500 italic">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onFocus={() => handleTyping(true)}
                  onBlur={() => handleTyping(false)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setShowChatPopup(!showChatPopup);
          if (!showChatPopup) setUnreadMessages(0);
        }}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadMessages > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {unreadMessages}
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default RoomPage;