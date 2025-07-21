import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Heart, Star, Filter, Menu, X } from 'lucide-react';

export default function ECommerceApp() {
  const [products] = useState([
    { id: 1, name: 'Wireless Headphones', price: 89.99, category: 'Electronics', image: '🎧', rating: 4.5, reviews: 234 },
    { id: 2, name: 'Smart Watch', price: 199.99, category: 'Electronics', image: '⌚', rating: 4.3, reviews: 156 },
    { id: 3, name: 'Laptop Bag', price: 49.99, category: 'Accessories', image: '💼', rating: 4.7, reviews: 89 },
    { id: 4, name: 'Coffee Maker', price: 79.99, category: 'Home', image: '☕', rating: 4.4, reviews: 127 },
    { id: 5, name: 'Bluetooth Speaker', price: 59.99, category: 'Electronics', image: '🔊', rating: 4.6, reviews: 203 },
    { id: 6, name: 'Running Shoes', price: 129.99, category: 'Sports', image: '👟', rating: 4.8, reviews: 345 }
  ]);
  
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const categories = ['All', 'Electronics', 'Accessories', 'Home', 'Sports'];

  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleLogin = () => {
    setUser({ name: 'John Doe', email: 'john@example.com' });
    setShowLogin(false);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">ShopNow</h1>
            </div>
            
            {/* Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setUser(null)}
                className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600"
              >
                <User className="w-5 h-5" />
                <span>{user ? user.name : 'Login'}</span>
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center space-x-1 text-gray-700 hover:text-indigo-600"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({cart.length})</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setShowMobileMenu(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  setShowLogin(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center space-x-2 w-full text-left"
              >
                <User className="w-5 h-5" />
                <span>{user ? user.name : 'Login'}</span>
              </button>
              <button
                onClick={() => {
                  setShowCart(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center space-x-2 w-full text-left"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({cart.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6 py-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">Categories:</span>
            </div>
            <div className="flex space-x-4 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center text-6xl">
                {product.image}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-1 rounded-full ${
                      wishlist.find(item => item.id === product.id)
                        ? 'text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={wishlist.find(item => item.id === product.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="flex items-center mb-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(product.rating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">({product.reviews})</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">${product.price}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Shopping Cart ({cart.length})</h2>
              <button onClick={() => setShowCart(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="text-2xl">{item.image}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total: ${getTotalPrice()}</span>
                </div>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowLogin(false)} />
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Login</h2>
              <button onClick={() => setShowLogin(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  defaultValue="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  defaultValue="password"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
