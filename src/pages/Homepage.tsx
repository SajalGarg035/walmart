"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Truck, Shield, RefreshCw, Users, Search, ShoppingCart, User, MapPin, Menu } from "lucide-react"
import { getFeaturedProducts } from "../data/products"
import ProductCard from "../components/ProductCard"
import { useAuth } from "../contexts/AuthContext"

const Homepage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState(getFeaturedProducts())
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free shipping on orders over $35",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Your information is protected",
    },
    {
      icon: RefreshCw,
      title: "Easy Returns",
      description: "90-day return policy",
    },
    {
      icon: Users,
      title: "Shop Together",
      description: "Create shopping rooms with friends",
    },
  ]

  const categories = [
    {
      name: "Electronics",
      image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg",
      href: "/products?category=electronics",
    },
    {
      name: "Clothing",
      image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg",
      href: "/products?category=clothing",
    },
    {
      name: "Home & Kitchen",
      image: "https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg",
      href: "/products?category=home",
    },
    {
      name: "Sports",
      image: "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg",
      href: "/products?category=sports",
    },
  ]

  const promoCards = [
    {
      title: "Up to 50% off",
      subtitle: "Electronics",
      image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg",
      link: "/products?category=electronics",
      size: "small",
      bgColor: "bg-sky-300",
    },
    {
      title: "DEALS",
      subtitle: "Save money. Live better.",
      description: "Shop millions of products at everyday low prices. Now with collaborative shopping rooms!",
      image: "/placeholder.svg?height=200&width=400",
      link: "/products",
      size: "large",
      bgColor: "bg-blue-500",
      isMain: true,
    },
    {
      title: "TVs up to 25% off",
      subtitle: "Latest Models",
      image: "https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg",
      link: "/products?category=electronics",
      size: "small",
      bgColor: "bg-sky-300",
    },
    {
      title: "Deals on Apple?",
      subtitle: "Genius!",
      image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg",
      link: "/products?category=electronics",
      size: "small",
      bgColor: "bg-sky-300",
    },
    {
      title: "Cooking & dining up to 40%",
      subtitle: "off",
      image: "https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg",
      link: "/products?category=home",
      size: "small",
      bgColor: "bg-sky-300",
    },
    {
      title: "Up to 30% off all things",
      subtitle: "college",
      image: "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg",
      link: "/products?category=clothing",
      size: "medium",
      bgColor: "bg-sky-400",
    },
    {
      title: "Up to 65% off",
      subtitle: "Outdoor gear",
      image: "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg",
      link: "/products?category=sports",
      size: "medium",
      bgColor: "bg-yellow-400",
    },
    {
      title: "Shop Together",
      subtitle: "Create rooms with friends",
      image: "/placeholder.svg?height=150&width=200",
      link: user ? "/rooms/create" : "/register",
      size: "small",
      bgColor: "bg-sky-300",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Promotional Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {promoCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                ${card.size === "large" ? "lg:col-span-2 lg:row-span-2" : ""}
                ${card.size === "medium" ? "lg:col-span-1" : ""}
                ${card.size === "small" ? "lg:col-span-1" : ""}
                ${card.bgColor} rounded-lg overflow-hidden relative group cursor-pointer hover:shadow-lg transition-shadow
                ${card.isMain ? "min-h-[300px]" : "min-h-[200px]"}
              `}
            >
              <Link to={card.link} className="block h-full">
                <div className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className={`font-bold mb-2 ${card.isMain ? "text-3xl text-white" : "text-xl text-gray-800"}`}>
                      {card.title}
                    </h3>
                    <p className={`${card.isMain ? "text-lg text-white" : "text-gray-700"} mb-2`}>{card.subtitle}</p>
                    {card.description && <p className="text-white text-sm">{card.description}</p>}
                  </div>
                  {card.image && (
                    <div className="mt-4 flex-1 flex items-end">
                      <img
                        src={card.image || "/placeholder.svg"}
                        alt={card.title}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=100&width=200"
                        }}
                      />
                    </div>
                  )}
                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center ${card.isMain ? "text-white bg-white bg-opacity-20 px-3 py-1 rounded-full" : "text-blue-600"} font-medium text-sm`}
                    >
                      Shop Deals
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <section className="py-12 bg-gray-50 rounded-lg mb-8">
          <div className="px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <Link to={category.href} className="block">
                  <div className="relative overflow-hidden rounded-lg shadow-lg">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <h3 className="text-white text-xl font-bold">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center transition-colors"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-black mb-6">Ready to start shopping together?</h2>
          <p className="text-xl text-black mb-8">Create a shopping room and invite friends to shop collaboratively</p>
          {user ? (
            <Link
              to="/rooms/create"
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              Create Your First Room
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </section>
      </main>
    </div>
  )
}

export default Homepage
