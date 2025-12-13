import { useEffect, useState } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Search, ShoppingBag, Plus, User, Filter, TrendingUp, 
  Package, DollarSign, Loader, AlertCircle, ShoppingCart, Star, 
  ChevronRight, CheckCircle, X, Trash2 
} from 'lucide-react';
import AddSweetModal from '../components/AddSweetModal';

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

export default function Dashboard() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notification, setNotification] = useState<Notification | null>(null);
  
  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    totalValue: 0
  });
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchSweets();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const totalItems = sweets.length;
    const inStock = sweets.filter(s => s.quantity > 0).length;
    const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0);
    setStats({ totalItems, inStock, totalValue });
  }, [sweets]);

  const fetchSweets = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `/sweets/search?q=${query}` : '/sweets';
      const res = await client.get(url);
      setSweets(res.data);
    } catch (error) {
      console.error("Failed to fetch sweets", error);
      showNotification("Failed to load inventory", 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSweets(search);
  };

  const handlePurchase = async (id: number, name: string) => {
    try {
      const res = await client.post(`/sweets/${id}/purchase`);
      setSweets(sweets.map(sweet => 
        sweet.id === id ? { ...sweet, quantity: res.data.remainingQuantity } : sweet
      ));
      showNotification(`Successfully bought ${name}!`, 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Purchase failed";
      showNotification(errorMessage, 'error');
    }
  };

  // NEW: Handle Delete
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await client.delete(`/sweets/${id}`);
      setSweets(prev => prev.filter(sweet => sweet.id !== id));
      showNotification(`${name} removed from inventory`, 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Delete failed", 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const filteredSweets = selectedCategory === 'all' 
    ? sweets 
    : sweets.filter(sweet => sweet.category.toLowerCase() === selectedCategory);

  const categories = ['all', ...new Set(sweets.map(sweet => sweet.category.toLowerCase()))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {notification && (
          <div className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 ease-out animate-blob ${
            notification.type === 'success' 
              ? 'bg-white border-l-4 border-green-500 text-gray-800' 
              : 'bg-white border-l-4 border-red-500 text-gray-800'
          }`}>
            <div className={`p-2 rounded-full ${
              notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {notification.type === 'success' ? 'Success' : 'Error'}
              </h4>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sweet Shop
                </h1>
                <p className="text-xs text-gray-500">Delicious treats await!</p>
              </div>
            </div>

            <div className="hidden md:block flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search for sweets..." 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
            </div>

            <div className="flex items-center space-x-4">
              {isAdmin && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Plus size={18} /> 
                  <span className="hidden sm:inline">Add Sweet</span>
                </button>
              )}

              <div className="flex items-center space-x-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-700">
                    {user.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isAdmin ? 'Administrator' : 'Premium Member'}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    <User size={20} />
                  </div>
                  {isAdmin && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Star className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Sweets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
                <p className="text-xs text-gray-400 mt-1">Available varieties</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-green-50 rounded-2xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">In Stock</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inStock}</p>
                <p className="text-xs text-gray-400 mt-1">Ready for purchase</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-purple-50 rounded-2xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Inventory Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalValue.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">Total worth</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sweet Collection</h2>
              <p className="text-gray-500">Discover our delicious selection of treats</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter size={18} />
                <span className="text-sm font-medium">Filter by:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 text-lg">Loading delicious sweets...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSweets.map((sweet) => (
                <div 
                  key={sweet.id} 
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden flex flex-col relative"
                >
                  {/* Delete Button (Only for Admins) */}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(sweet.id, sweet.name);
                      }}
                      className="absolute top-2 left-2 z-20 bg-white/90 p-2 rounded-full text-red-500 shadow-md hover:bg-red-500 hover:text-white transition-all duration-200"
                      title="Delete Sweet"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className="h-48 bg-gradient-to-br from-pink-100 to-orange-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-r from-pink-300 to-orange-300 rounded-full opacity-20 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        sweet.quantity > 10 
                          ? 'bg-green-100 text-green-800' 
                          : sweet.quantity > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sweet.quantity > 10 ? 'In Stock' : sweet.quantity > 0 ? 'Low Stock' : 'Sold Out'}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm capitalize">
                        {sweet.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {sweet.name}
                      </h3>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${sweet.price}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">Stock:</span>
                        <span className={`ml-2 font-semibold ${
                          sweet.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sweet.quantity}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handlePurchase(sweet.id, sweet.name)}
                        disabled={sweet.quantity === 0}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 transform active:scale-95 ${
                          sweet.quantity > 0 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {sweet.quantity > 0 ? (
                          <>
                            <ShoppingCart size={18} />
                            Buy
                          </>
                        ) : (
                          <>
                            <AlertCircle size={18} />
                            Out
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSweets.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No sweets found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                   We couldn't find anything matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                    fetchSweets();
                  }}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all sweets
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Sweet Shop. All rights reserved.</p>
        </div>
      </footer>

      {isAdmin && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 md:hidden w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50"
        >
          <Plus size={24} />
        </button>
      )}

      {showAddModal && (
        <AddSweetModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            fetchSweets(search);
            showNotification("New sweet added to inventory!", 'success');
          }} 
        />
      )}
    </div>
  );
}