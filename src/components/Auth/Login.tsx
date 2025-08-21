import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, Eye, EyeOff, UserCheck } from 'lucide-react';

export function Login() {
  const { login, loginWithUsername } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'kitchen_staff' | 'inventory_manager' | 'delivery_staff' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrator', icon: '👑' },
    { value: 'kitchen_staff', label: 'Kitchen Staff', icon: '👨‍🍳' },
    { value: 'inventory_manager', label: 'Inventory Manager', icon: '📦' },
    { value: 'delivery_staff', label: 'Delivery Staff', icon: '🚚' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedRole) {
      setError('Please select your role to continue');
      return;
    }
    
    setLoading(true);

    try {
      let success = false;
      
      if (loginMethod === 'email') {
        success = await login(email, password, selectedRole);
      } else {
        success = await loginWithUsername(username, password, selectedRole);
      }
      
      if (!success) {
        setError('Invalid credentials or unauthorized role access');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@gabrielkitchen.com', username: 'admin', password: 'password123' },
    { role: 'Kitchen Staff', email: 'ravi@gabrielkitchen.com', username: 'ravi.kumar', password: 'password123' },
    { role: 'Inventory Manager', email: 'priya@gabrielkitchen.com', username: 'priya.sharma', password: 'password123' },
    { role: 'Delivery Staff', email: 'suresh@gabrielkitchen.com', username: 'suresh.babu', password: 'password123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Gabriel Kitchen</h2>
          <p className="mt-2 text-gray-600">Kitchen Management System</p>
          <p className="text-sm text-gray-500">Hosur, Tamil Nadu</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Select Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                  required
                >
                  <option value="">Select your role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Login Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Login Method</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="loginMethod"
                    value="email"
                    checked={loginMethod === 'email'}
                    onChange={(e) => setLoginMethod(e.target.value as 'email')}
                    className="mr-2"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="loginMethod"
                    value="username"
                    checked={loginMethod === 'username'}
                    onChange={(e) => setLoginMethod(e.target.value as 'username')}
                    className="mr-2"
                  />
                  <span>Username</span>
                </label>
              </div>
            </div>

            {loginMethod === 'email' ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            ) : (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Accounts (Select role first):</h3>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (loginMethod === 'email') {
                      setEmail(account.email);
                    } else {
                      setUsername(account.username);
                    }
                    setPassword(account.password);
                  }}
                  className="w-full text-left px-3 py-2 bg-gray-50 rounded text-sm hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">{account.role}</div>
                  <div className="text-gray-600">
                    {loginMethod === 'email' ? account.email : `Username: ${account.username}`}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}