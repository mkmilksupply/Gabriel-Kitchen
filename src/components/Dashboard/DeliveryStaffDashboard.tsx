import React, { useState } from 'react';
import { Truck, MapPin, Clock, CheckCircle, User, Phone, Navigation, Package, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export function DeliveryStaffDashboard() {
  const { orders, updateOrderStatus } = useApp();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Filter orders for delivery staff
  const myDeliveries = orders.filter(order => 
    order.assignedStaff === user?.name && order.status === 'out_for_delivery'
  );

  const completedToday = orders.filter(order => {
    const orderDate = new Date(order.orderTime).toDateString();
    const today = new Date().toDateString();
    return orderDate === today && order.status === 'delivered' && order.assignedStaff === user?.name;
  });

  const totalEarnings = completedToday.reduce((sum, order) => sum + order.totalAmount, 0);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDeliveryPriority = (orderTime: string, estimatedDelivery: string) => {
    const now = new Date();
    const estimated = new Date(estimatedDelivery);
    const timeDiff = estimated.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesLeft < 0) return 'overdue';
    if (minutesLeft < 15) return 'urgent';
    if (minutesLeft < 30) return 'high';
    return 'normal';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'overdue': return 'border-l-4 border-red-600 bg-red-50';
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const getTimeRemaining = (estimatedDelivery: string) => {
    const now = new Date();
    const estimated = new Date(estimatedDelivery);
    const timeDiff = estimated.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesLeft < 0) return `${Math.abs(minutesLeft)} min overdue`;
    if (minutesLeft < 60) return `${minutesLeft} min left`;
    const hoursLeft = Math.floor(minutesLeft / 60);
    const remainingMinutes = minutesLeft % 60;
    return `${hoursLeft}h ${remainingMinutes}m left`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Welcome, {user?.name}! 🚚</h1>
            <p className="text-green-100 text-sm sm:text-base">Ready to deliver happiness to our customers?</p>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold">{myDeliveries.length}</div>
            <div className="text-green-100 text-sm sm:text-base">Active Deliveries</div>
          </div>
        </div>
      </div>

      {/* Delivery Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Active Deliveries</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{myDeliveries.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivered Today</p>
              <p className="text-2xl font-bold text-gray-900">{completedToday.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.9⭐</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-green-500" />
            <span>🗺️ Active Delivery Routes</span>
          </h3>
        </div>
        <div className="p-6">
          {myDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500">Great! No pending deliveries.</p>
              <p className="text-sm text-gray-400">New delivery assignments will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myDeliveries.map((order) => {
                const priority = getDeliveryPriority(order.orderTime, order.estimatedDelivery);
                return (
                  <div key={order.id} className={`rounded-lg p-4 ${getPriorityColor(priority)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            🚚 Delivery {order.orderNumber || `#${order.id}`}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            priority === 'overdue' ? 'bg-red-100 text-red-800' :
                            priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {priority === 'overdue' ? '🚨 OVERDUE' :
                             priority === 'urgent' ? '⚡ URGENT' :
                             priority === 'high' ? '🔥 HIGH PRIORITY' :
                             '📋 NORMAL'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{getTimeRemaining(order.estimatedDelivery)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₹{order.totalAmount}</div>
                        <div className="text-sm text-gray-600">{order.items.length} items</div>
                      </div>
                    </div>
                    
                    {/* Customer Contact & Address */}
                    <div className="mb-4 p-3 bg-white bg-opacity-70 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">📞 Customer Contact</h5>
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline font-medium">
                              {order.customerPhone}
                            </a>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">📍 Delivery Address</h5>
                          <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span>{order.deliveryAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">📦 Items to Deliver:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white bg-opacity-50 rounded">
                            <span className="font-medium text-sm">{item.name}</span>
                            <span className="text-sm font-bold">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={() => {
                          if (confirm(`Mark delivery #${order.id} as completed?`)) {
                            updateOrderStatus(order.id, 'delivered', user?.name);
                          }
                        }}
                        className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium touch-manipulation"
                      >
                        ✅ Mark as Delivered
                      </button>
                      <button
                        onClick={() => window.open(`tel:${order.customerPhone}`, '_self')}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors touch-manipulation"
                      >
                        📞 Call Customer
                      </button>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
                      >
                        {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {selectedOrder === order.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h6 className="font-medium text-gray-900 mb-2">Order Timeline</h6>
                            <div className="space-y-1 text-gray-600">
                              <div>Ordered: {formatTime(order.orderTime)}</div>
                              <div>Est. Delivery: {formatTime(order.estimatedDelivery)}</div>
                              <div>Payment: Cash on Delivery</div>
                            </div>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900 mb-2">Delivery Notes</h6>
                            <div className="text-gray-600">
                              <div>• Handle with care</div>
                              <div>• Call before delivery</div>
                              <div>• Collect payment: ₹{order.totalAmount}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Today's Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">📊 Today's Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{completedToday.length}</div>
              <div className="text-gray-600 text-sm sm:text-base">Deliveries Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                ₹{totalEarnings.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">Total Delivered Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">28 min</div>
              <div className="text-gray-600 text-sm sm:text-base">Avg Delivery Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">4.9⭐</div>
              <div className="text-gray-600 text-sm sm:text-base">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Delivery Tips</h3>
        <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Always call customer before delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Check order items before leaving</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Handle food with care</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">📱</span>
              <span>Use GPS for optimal routes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">💰</span>
              <span>Collect exact payment amount</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">😊</span>
              <span>Maintain friendly customer service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}