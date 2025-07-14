import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, Eye, Users, CreditCard, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setOrders([]);
        return;
      }
      
      console.log('Fetching orders with token');
      const response = await axios.get('http://localhost:3001/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Orders response:', response.data);
      setOrders(response.data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please log in to view orders');
        // Don't navigate here, just show empty state
      } else if (error.response?.status === 404) {
        console.log('Orders endpoint not found, showing empty state');
        // Don't show error for 404, just show empty state
      } else {
        toast.error('Failed to load orders');
      }
      
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper functions to safely access product data
  const getProductImage = (item: any) => {
    return item.product?.images?.[0]?.url || 
           item.product?.images?.[0] || 
           item.productData?.images?.[0] || 
           '/placeholder.jpg';
  };

  const getProductName = (item: any) => {
    return item.product?.name || 
           item.productData?.name || 
           'Unknown Product';
  };

  const getProductPrice = (item: any) => {
    return item.price || 
           item.product?.price || 
           item.productData?.price || 
           0;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your orders</h1>
        </div>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                When you place your first order, it will appear here.
              </p>
              <a
                href="/products"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any, orderIndex: number) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: orderIndex * 0.1 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {order.isRoomOrder && (
                          <div className="flex items-center space-x-1 bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                            <Users className="h-3 w-3" />
                            <span>Room Order</span>
                          </div>
                        )}
                        {order.paymentSplits && order.paymentSplits.length > 1 && (
                          <div className="flex items-center space-x-1 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                            <CreditCard className="h-3 w-3" />
                            <span>Split Payment</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.items && order.items.length > 0 ? (
                          order.items.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="flex items-center space-x-3">
                              <img
                                src={getProductImage(item)}
                                alt={getProductName(item)}
                                className="w-12 h-12 object-cover rounded-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {getProductName(item)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity || 0} × ${getProductPrice(item).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No items found</div>
                        )}
                        {order.items && order.items.length > 3 && (
                          <div className="flex items-center justify-center text-sm text-gray-600">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Split Payment Info */}
                    {order.paymentSplits && order.paymentSplits.length > 1 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Payment Split</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {order.paymentSplits.map((split: any, splitIndex: number) => (
                            <div key={splitIndex} className="flex justify-between text-sm">
                              <span className="text-blue-800">
                                {split.user?.username || 'Unknown User'}:
                              </span>
                              <span className="font-medium text-blue-900">
                                ${split.amount?.toFixed(2) || '0.00'} ({split.status || 'pending'})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </div>
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium">
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
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

export default OrdersPage;