import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, Phone, User, CheckCircle, AlertCircle, Navigation, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Mock delivery staff data with real-time status
const deliveryStaff = [
  { 
    id: '4', 
    name: 'Suresh Babu', 
    phone: '+91 9876543213',
    status: 'delivering' as const,
    currentLocation: 'Anna Nagar, Hosur',
    vehicleNumber: 'TN-20-AB-1234',
    totalDeliveries: 156,
    todayDeliveries: 8,
    rating: 4.8,
    joinedDate: '2023-04-05'
  },
  { 
    id: '6', 
    name: 'Arjun Nair', 
    phone: '+91 9876543217',
    status: 'available' as const,
    currentLocation: 'Sipcot Phase 1, Hosur',
    vehicleNumber: 'TN-20-CD-5678',
    totalDeliveries: 89,
    todayDeliveries: 5,
    rating: 4.6,
    joinedDate: '2023-06-15'
  },
  { 
    id: '7', 
    name: 'Rajesh Kumar', 
    phone: '+91 9876543218',
    status: 'returning' as const,
    currentLocation: 'Mathigiri Road, Hosur',
    vehicleNumber: 'TN-20-EF-9012',
    totalDeliveries: 203,
    todayDeliveries: 12,
    rating: 4.9,
    joinedDate: '2023-02-20'
  }
];

export function DeliveryTracking() {
  const { orders } = useApp();
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshTime, setRefreshTime] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get delivery orders (out_for_delivery status)
  const deliveryOrders = orders.filter(order => order.status === 'out_for_delivery');
  
  // Get delivered orders for today
  const todayDelivered = orders.filter(order => {
    const orderDate = new Date(order.orderTime).toDateString();
    const today = new Date().toDateString();
    return orderDate === today && order.status === 'delivered';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivering': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'available': return 'bg-green-100 text-green-800 border-green-300';
      case 'returning': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivering': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'returning': return <Navigation className="h-4 w-4 text-orange-600" />;
      case 'offline': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEstimatedDeliveryTime = (orderTime: string) => {
    const orderDate = new Date(orderTime);
    const estimatedTime = new Date(orderDate.getTime() + 45 * 60000); // 45 minutes
    return estimatedTime.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDeliveryDuration = (orderTime: string) => {
    const orderDate = new Date(orderTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    return `${diffMinutes} min`;
  };

  const filteredStaff = statusFilter === 'all' 
    ? deliveryStaff 
    : deliveryStaff.filter(staff => staff.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
          <p className="text-gray-600">Monitor delivery staff and track order deliveries in real-time</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {refreshTime.toLocaleTimeString('en-IN')}
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Delivery Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryOrders.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{todayDelivered.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveryStaff.filter(s => s.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-gray-900">32 min</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Staff Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Delivery Staff Status</h3>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Staff</option>
                <option value="delivering">Delivering</option>
                <option value="available">Available</option>
                <option value="returning">Returning</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {filteredStaff.map((staff) => (
                <div key={staff.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-medium text-sm">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{staff.name}</h4>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{staff.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(staff.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(staff.status)}`}>
                        {staff.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{staff.currentLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{staff.vehicleNumber}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-600">Today: </span>
                        <span className="font-medium">{staff.todayDeliveries} deliveries</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rating: </span>
                        <span className="font-medium">⭐ {staff.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Deliveries</h3>
          </div>
          <div className="p-6">
            {deliveryOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active deliveries</p>
                <p className="text-sm text-gray-400">All orders have been delivered</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveryOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₹{order.totalAmount}</div>
                        <div className="text-sm text-gray-600">
                          Duration: {getDeliveryDuration(order.orderTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Assigned to: </span>
                        <span className="font-medium">{order.assignedStaff || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{order.customerPhone}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Est. Delivery: {getEstimatedDeliveryTime(order.orderTime)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm">
                        <span className="text-gray-600">Items: </span>
                        <span className="font-medium">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Deliveries (Today)</h3>
        </div>
        <div className="p-6">
          {todayDelivered.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No deliveries completed today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todayDelivered.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.customerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.assignedStaff || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatTime(order.orderTime)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{order.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}