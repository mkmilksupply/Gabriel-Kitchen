import React, { useState } from 'react';
import { ShoppingCart, Clock, Truck, CheckCircle, Plus, Phone, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AdminOrderCreation } from './AdminOrderCreation';
import { DeliveryAssignmentModal } from './DeliveryAssignmentModal';

export function OrderManagement() {
  const { orders, recipes, updateOrderStatus, addOrder } = useApp();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdminOrderModal, setShowAdminOrderModal] = useState(false);
  const [showDeliveryAssignmentModal, setShowDeliveryAssignmentModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<any>(null);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cooking':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cooking':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'cooking': return 'Cooking';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAdminOrderModal(true)}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 font-semibold shadow-lg touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Order & Assign Staff</span>
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {['all', 'pending', 'cooking', 'out_for_delivery', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm touch-manipulation ${
                statusFilter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Orders' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4 sm:space-y-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {order.orderNumber ? `Order ${order.orderNumber}` : `Order #${order.id}`}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4 sm:space-y-0 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{order.customerPhone}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span className="break-words">{order.deliveryAddress}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Order Time: {formatTime(order.orderTime)}</div>
                        <div>Est. Delivery: {formatTime(order.estimatedDelivery)}</div>
                        <div>Total Amount: ₹{order.totalAmount}</div>
                        {order.assignedStaff && (
                          <div>Assigned to: {order.assignedStaff}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        const recipe = recipes.find(r => r.id === item.recipeId) || mockRecipes.find(r => r.id === item.recipeId);
                        return (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2 sm:p-3">
                            <span className="font-medium text-sm sm:text-base">{recipe?.name || 'Unknown Recipe'}</span>
                            <div className="text-right">
                              <div className="text-sm">Qty: {item.quantity}</div>
                              <div className="text-sm font-medium">₹{item.price * item.quantity}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 sm:border-t-0 sm:pt-0">
                  <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cooking', user?.name)}
                        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors touch-manipulation font-medium"
                      >
                        Start Cooking
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setSelectedOrderForDelivery(order);
                          setShowDeliveryAssignmentModal(true);
                        }}
                        className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors touch-manipulation font-medium"
                      >
                        🚚 Assign Delivery Partner
                      </button>
                    )}
                    {order.status === 'cooking' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery', user?.name)}
                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors touch-manipulation font-medium"
                      >
                        Send for Delivery
                      </button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered', user?.name)}
                        className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors touch-manipulation font-medium"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <AdminOrderCreation
        isOpen={showAdminOrderModal}
        onClose={() => setShowAdminOrderModal(false)}
      />
      
      <DeliveryAssignmentModal
        isOpen={showDeliveryAssignmentModal}
        onClose={() => {
          setShowDeliveryAssignmentModal(false);
          setSelectedOrderForDelivery(null);
        }}
        order={selectedOrderForDelivery}
      />
    </div>
  );
}