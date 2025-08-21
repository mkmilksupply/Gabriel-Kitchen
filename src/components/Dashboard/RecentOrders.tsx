import React from 'react';
import { Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function RecentOrders() {
  const { orders } = useApp();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cooking':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cooking':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'cooking':
        return 'Cooking';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    {order.orderNumber || `#${order.id}`}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:block sm:text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <p className="text-sm font-medium text-gray-900 sm:mt-1">₹{order.totalAmount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}