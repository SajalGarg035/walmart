"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
  Users,
  MapPin,
  ChevronDown,
  Heart,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()
  const { getCartCount, getCartTotal } = useCart()
  const navigate = useNavigate()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const departmentMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (departmentMenuRef.current && !departmentMenuRef.current.contains(event.target as Node)) {
        setIsDepartmentMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate("/")
  }

  const categories = [
    { name: "Electronics", href: "/products?category=electronics" },
    { name: "Clothing", href: "/products?category=clothing" },
    { name: "Home & Kitchen", href: "/products?category=home" },
    { name: "Sports & Outdoors", href: "/products?category=sports" },
    { name: "Beauty", href: "/products?category=beauty" },
    { name: "Toys & Games", href: "/products?category=toys" },
  ]

  const departments = [
    { name: "Grocery & Essentials", href: "/products?category=grocery" },
    { name: "Electronics", href: "/products?category=electronics" },
    { name: "Home", href: "/products?category=home" },
    { name: "Fashion", href: "/products?category=clothing" },
    { name: "Sports & Recreation", href: "/products?category=sports" },
    { name: "Beauty & Personal Care", href: "/products?category=beauty" },
    { name: "Toys", href: "/products?category=toys" },
    { name: "Auto & Tires", href: "/products?category=auto" },
  ]

  return (
    <nav className="bg-blue-600 text-white sticky top-0 z-50 w-full">
      {/* Top Header Bar */}
      <div className="bg-blue-700 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 cursor-pointer hover:text-yellow-300 transition-colors">
                <MapPin className="h-4 w-4" />
                <span>Pickup or delivery?</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/orders" className="hover:text-yellow-300 transition-colors hidden sm:inline">
                Reorder My Items
              </Link>
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 hover:text-yellow-300 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Hi, {user.firstName}</span>
                    <span className="sm:hidden">Account</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                ) : (
                  <Link to="/login" className="flex items-center space-x-2 hover:text-yellow-300 transition-colors">
                    <User className="h-4 w-4" />
                    <span>Sign In Account</span>
                  </Link>
                )}
                <AnimatePresence>
                  {isUserMenuOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 border"
                    >
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">Hello, {user.firstName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Account Settings
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="h-4 w-4 mr-3" />
                        Purchase History
                      </Link>
                      <Link
                        to="/rooms"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Users className="h-4 w-4 mr-3" />
                        Shopping Rooms
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4 mr-3" />
                        Lists
                      </Link>
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link to="/cart" className="flex items-center space-x-2 hover:text-yellow-300 transition-colors relative">
                <ShoppingCart className="h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span className="text-xs leading-none">
                    ${getCartTotal ? getCartTotal().toFixed(2) : "0.00"}
                  </span>
                  <span className="text-xs leading-none opacity-75">
                    {getCartCount ? getCartCount() : 0} {(getCartCount ? getCartCount() : 0) === 1 ? "item" : "items"}
                  </span>
                </div>
                {(getCartCount ? getCartCount() : 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-blue-900 text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {getCartCount ? getCartCount() : 0}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8 w-full">
              <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
  <img
    src="https://th.bing.com/th/id/R.cba9989d9a166fd0b5d6ccc2c6e1e0f4?rik=uszVEE8zXTWMiw&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f05%2fEmblem-Walmart.jpg&ehk=uYehZzXhw1a4kdy%2budI%2f8jlOhYVTg7BvqpZMdsw%2fRAo%3d&risl=&pid=ImgRaw&r=0"
    alt="Walmart spark icon"
    className="h-20 w-40"
  />
  
</Link>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search everything at Walmart online and in store"
                    className="w-full px-4 py-3 text-gray-900 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <button
                      type="submit"
                      className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-4 py-2 rounded-full font-semibold transition-colors flex items-center"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Mobile Menu Button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white flex-shrink-0">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-3 text-sm">
            {/* Departments Dropdown */}
            <div className="relative" ref={departmentMenuRef}>
              <button
                onClick={() => setIsDepartmentMenuOpen(!isDepartmentMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                <Menu className="h-4 w-4" />
                <span>Departments</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {isDepartmentMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50 border"
                  >
                    {departments.map((dept) => (
                      <Link
                        key={dept.name}
                        to={dept.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDepartmentMenuOpen(false)}
                      >
                        {dept.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/products?category=grocery"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Grocery & Essentials
              </Link>
              <Link
                to="/products?featured=true"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Get It Fast
              </Link>
              <Link to="/products?new=true" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                New Arrivals
              </Link>
              <Link
                to="/products?deals=true"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Deals
              </Link>
              <Link
                to="/products?category=electronics"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Electronics
              </Link>
              <Link
                to="/products?category=home"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/products?category=clothing"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Fashion
              </Link>
              {user && (
                <Link
                  to="/rooms"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1"
                >
                  <Users className="h-4 w-4" />
                  <span>Shopping Rooms</span>
                </Link>
              )}
            </div>

            {/* More Menu */}
            <div className="ml-auto hidden lg:block">
              <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-800 transition-colors">
                More
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="px-4 py-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search everything at Walmart..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </form>

              {/* Mobile Navigation */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Departments</h3>
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <Link
                        key={dept.name}
                        to={dept.href}
                        className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {dept.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
                  <div className="space-y-2">
                    <Link
                      to="/products?deals=true"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Deals
                    </Link>
                    <Link
                      to="/products?new=true"
                      className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      New Arrivals
                    </Link>
                    {user && (
                      <Link
                        to="/rooms"
                        className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Shopping Rooms
                      </Link>
                    )}
                  </div>
                </div>

                {user && (
                  <div className="pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Account</h3>
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Account Settings
                      </Link>
                      <Link
                        to="/orders"
                        className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Purchase History
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsMenuOpen(false)
                        }}
                        className="block w-full text-left py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
