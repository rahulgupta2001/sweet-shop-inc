import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, Store, AlertCircle, Sparkles } from 'lucide-react';
import client from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: value
  }));

  if (error) setError('');
};

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(formData.email, formData.password);
  };

  const performLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await client.post('/auth/login', { 
        email: email, 
        password: pass 
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      navigate('/dashboard');
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

//   const handleDemoLogin = async () => {
//     await performLogin('admin@incubyte.com', 'admin123');
//   };

  return (
    // FIX: Added 'py-12' to ensure vertical spacing and removed 'overflow-hidden' from main container
    // moved overflow handling to the background blob container only
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 py-12 relative">
      
      {/* Animated Background Blobs - Contained strictly to background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Decorative Top Icon */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-6 group-hover:rotate-12 transition-transform duration-300">
              <Store className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 border border-white/50 relative z-10">
          
          {/* Header - Added extra top margin to clear the icon visual */}
          <div className="text-center mb-8 pt-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <span className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Sweet Shop
            </span>
            <p className="text-gray-500 text-sm mt-2">Sign in to manage your inventory</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/90 border border-red-200 rounded-2xl flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Quick Demo Button */}
          {/* <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full mb-6 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-700 font-medium rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Use Demo Admin Account</span>
          </button> */}

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white/50 text-gray-500 backdrop-blur-sm">Or login with email</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="name@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">Remember me</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}