import { useState } from 'react';
import client from '../api/client';
import { X, CandyCane, Tag, DollarSign, Package, Sparkles } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSweetModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Updated categories based on your recent screenshot (e.g., Chocolate, Traditional, Cake, Test, Candy)
  const [categories] = useState([
    'Chocolate',
    'Candy',
    'Traditional',
    'Cake',
    'Cookie',
    'Test'
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please enter a sweet name');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await client.post('/sweets', {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      });
      
      // Clear form
      setFormData({ name: '', category: '', price: '', quantity: '' });
      
      // Call success callback to refresh dashboard and show notification
      onSuccess();
      onClose();
      
    } catch (err: any) {
      // Catch and display error message properly
      setError(err.response?.data?.error || 'Failed to add sweet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-2xl transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-r from-pink-300 to-orange-300 rounded-full opacity-20 blur-xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-20 blur-xl" />
          
          {/* Header */}
          <div className="relative px-8 pt-10 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl shadow-lg">
                  <CandyCane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Sweet</h2>
                  <p className="text-sm text-gray-500">Fill in the details below</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-shake">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-white" />
                </div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative px-8 pb-10 space-y-6">
            {/* Name Input */}
            <div className="group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Sweet Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-pink-500">
                  <CandyCane className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter sweet name (e.g., Chocolate Bar)"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="group">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                  <Tag className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                </div>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Input */}
            <div className="group">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-green-500">
                  <DollarSign className="h-5 w-5 text-gray-400 group-focus-within:text-green-500" />
                </div>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="0.00"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">USD</span>
                </div>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="group">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Initial Stock Quantity
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500">
                  <Package className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500" />
                </div>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter quantity"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-700 to-orange-700 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                
                {isLoading ? (
                  <>
                    <div className="relative z-10 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="relative z-10">Adding Sweet...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                    <span className="relative z-10">Add to Inventory</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Tip: Make sure to enter accurate pricing and stock levels for better inventory management.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}