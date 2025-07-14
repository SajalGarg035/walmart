import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, DollarSign, CreditCard, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const SplitCheckoutPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState([]);
  const [splitAmounts, setSplitAmounts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (roomId && user) {
      fetchRoomData();
    }
  }, [roomId, user]);

  const fetchRoomData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(response.data);
      setParticipants(response.data.participants);
      
      // Initialize equal split
      const total = getCartTotal(response.data.sharedCart);
      const perPerson = total / response.data.participants.length;
      const initialSplit = {};
      response.data.participants.forEach((p: any) => {
        initialSplit[p.user._id] = perPerson;
      });
      setSplitAmounts(initialSplit);
    } catch (error) {
      console.error('Error fetching room:', error);
      toast.error('Failed to load room data');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = (cart: any[]) => {
    if (!cart) return 0;
    const subtotal = cart.reduce((total, item) => {
      const price = item.product?.price || item.productData?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 35 ? 0 : 5.99;
    return subtotal + tax + shipping;
  };

  const updateSplitAmount = (userId: string, amount: number) => {
    setSplitAmounts(prev => ({ ...prev, [userId]: amount }));
  };

  const getTotalSplit = () => {
    return Object.values(splitAmounts).reduce((sum, amount) => sum + amount, 0);
  };

  const getCartSubtotal = () => {
    if (!room?.sharedCart) return 0;
    return room.sharedCart.reduce((total: number, item: any) => {
      const price = item.product?.price || item.productData?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const equalSplit = () => {
    const total = getCartTotal(room.sharedCart);
    const perPerson = total / participants.length;
    const newSplit = {};
    participants.forEach((p: any) => {
      newSplit[p.user._id] = perPerson;
    });
    setSplitAmounts(newSplit);
  };

  const handleCheckout = async () => {
    const total = getCartTotal(room.sharedCart);
    const splitTotal = getTotalSplit();
    
    if (Math.abs(total - splitTotal) > 0.01) {
      toast.error('Split amounts must equal the total order amount');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const paymentSplits = Object.entries(splitAmounts).map(([userId, amount]) => ({
        user: userId,
        amount,
        status: 'pending'
      }));

      const response = await axios.post(`http://localhost:3001/api/rooms/${roomId}/checkout`, {
        shippingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'United States'
        },
        paymentSplits
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Split payment order created successfully!');
      navigate(`/orders`);
    } catch (error) {
      console.error('Error creating split order:', error);
      toast.error('Failed to create split payment order');
    } finally {
      setProcessing(false);
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

  const total = getCartTotal(room?.sharedCart || []);
  const splitTotal = getTotalSplit();
  const difference = total - splitTotal;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/rooms/${roomId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Room</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Split Payment Checkout</h1>
          <p className="text-gray-600">Divide the order cost among room participants</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Split Configuration */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Payment Split</h2>
                </div>
                <button
                  onClick={equalSplit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Equal Split
                </button>
              </div>

              <div className="space-y-4">
                {participants.map((participant: any) => (
                  <div key={participant.user._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {participant.user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{participant.user.username}</span>
                        {participant.user._id === user._id && (
                          <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">You</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={splitAmounts[participant.user._id]?.toFixed(2) || '0.00'}
                        onChange={(e) => updateSplitAmount(participant.user._id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {Math.abs(difference) > 0.01 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    Split total (${splitTotal.toFixed(2)}) {difference > 0 ? 'is less than' : 'exceeds'} order total (${total.toFixed(2)}) by ${Math.abs(difference).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCheckout}
                  disabled={processing || Math.abs(difference) > 0.01}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Create Split Payment Order</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-8"
            >
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {room?.sharedCart && room.sharedCart.length > 0 && (
                <div className="space-y-3 mb-6">
                  {room.sharedCart.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img
                        src={item.product?.imageUrl || item.productData?.images?.[0] || '/placeholder.jpg'}
                        alt={item.product?.name || item.productData?.name || 'Product'}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.product?.name || item.productData?.name || 'Unknown Product'}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity} × ${(item.product?.price || item.productData?.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {room.sharedCart.length > 3 && (
                    <p className="text-sm text-gray-500">+{room.sharedCart.length - 3} more items</p>
                  )}
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${getCartSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${getCartSubtotal() > 35 ? '0.00' : '5.99'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(getCartSubtotal() * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Split Summary</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p>Total to split: ${total.toFixed(2)}</p>
                  <p>Currently split: ${splitTotal.toFixed(2)}</p>
                  {Math.abs(difference) <= 0.01 && (
                    <p className="text-green-600 font-medium">✓ Split is balanced</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitCheckoutPage;
