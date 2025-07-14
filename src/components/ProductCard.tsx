import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Heart, Users } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleAddToSharedCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentRoomId = new URLSearchParams(window.location.search).get('roomId');
    
    if (currentRoomId) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3001/api/rooms/${currentRoomId}/cart`, {
          productId: product.id,
          quantity: 1,
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
        
        toast.success('Added to shared cart');
      } catch (error) {
        console.error('Error adding to shared cart:', error);
        toast.error('Failed to add to shared cart');
      }
    }
  };

  const isInRoomContext = new URLSearchParams(window.location.search).get('roomId');

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {product.isOnSale && product.originalPrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </div>
          )}
          <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({product.reviewCount})
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add</span>
              </button>
              
              {isInRoomContext && (
                <button
                  onClick={handleAddToSharedCart}
                  disabled={product.stock === 0}
                  className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title="Add to Shared Cart"
                >
                  <Users className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;