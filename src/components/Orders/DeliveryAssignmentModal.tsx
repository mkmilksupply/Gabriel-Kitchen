import React, { useState } from 'react';
import { X, Truck, User, Phone, MapPin, Clock, Star, Navigation, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DeliveryAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

// Mock delivery partners data
const deliveryPartners = [
  { 
    id: 'dp1', 
    name: 'Suresh Babu', 
    phone: '+91 9876543213',
    status: 'available',
    currentDeliveries: 0,
    vehicleNumber: 'TN-20-AB-1234',
    rating: 4.8,
    totalDeliveries: 156,
    avgDeliveryTime: 28,
    location: 'Anna Nagar, Hosur'
  },
  { 
    id: 'dp2', 
    name: 'Arjun Nair', 
    phone: '+91 9876543217',
    status: 'available',
    currentDeliveries: 1,
    vehicleNumber: 'TN-20-CD-5678',
    rating: 4.6,
    totalDeliveries: 89,
    avgDeliveryTime: 32,
    location: 'Sipcot Phase 1, Hosur'
  },
  { 
    id: 'dp3', 
    name: 'Rajesh Kumar', 
    phone: '+91 9876543218',
    status: 'busy',
    currentDeliveries: 3,
    vehicleNumber: 'TN-20-EF-9012',
    rating: 4.9,
    totalDeliveries: 203,
    avgDeliveryTime: 25,
    location: 'Mathigiri Road, Hosur'
  },
  { 
    id: 'dp4', 
    name: 'Karthik Raj', 
    phone: '+91 9876543219',
    status: 'available',
    currentDeliveries: 0,
    vehicleNumber: 'TN-20-GH-3456',
    rating: 4.7,
    totalDeliveries: 134,
    avgDeliveryTime: 30,
    location: 'Bagalur Road, Hosur'
  }
];

export function DeliveryAssignmentModal({ isOpen, onClose, order }: DeliveryAssignmentModalProps) {
  const { updateOrderStatus } = useApp();
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  if (!isOpen || !order) return null;

  const availablePartners = deliveryPartners.filter(partner => 
    partner.status === 'available' || partner.currentDeliveries < 3
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'busy': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'offline': return <X className="h-4 w-4 text-red-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateEstimatedDelivery = (partnerId: string) => {
    const partner = deliveryPartners.find(p => p.id === partnerId);
    if (!partner) return '';
    
    const now = new Date();
    const estimatedMinutes = partner.avgDeliveryTime + (partner.currentDeliveries * 10); // Add 10 min per current delivery
    const estimatedTime = new Date(now.getTime() + estimatedMinutes * 60000);
    
    return estimatedTime.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const handlePartnerSelect = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setEstimatedDeliveryTime(calculateEstimatedDelivery(partnerId));
  };

  const handleAssignDelivery = async () => {
    if (!selectedPartner) {
      alert('Please select a delivery partner');
      return;
    }

    if (!estimatedDeliveryTime) {
      alert('Please set estimated delivery time');
      return;
    }

    const partner = deliveryPartners.find(p => p.id === selectedPartner);
    
    try {
      // Update order status to out_for_delivery and assign delivery partner
      await updateOrderStatus(order.id, 'out_for_delivery', partner?.name);
      
      // In a real app, you would also update delivery assignment in database
      console.log('Delivery assigned:', {
        orderId: order.id,
        partnerId: selectedPartner,
        partnerName: partner?.name,
        estimatedDeliveryTime,
        priority,
        specialInstructions
      });

      alert(`✅ Delivery Assigned Successfully!\n\nOrder #${order.id}\nAssigned to: ${partner?.name}\nPhone: ${partner?.phone}\nVehicle: ${partner?.vehicleNumber}\nEst. Delivery: ${new Date(estimatedDeliveryTime).toLocaleTimeString('en-IN')}\nPriority: ${priority.toUpperCase()}`);
      
      onClose();
    } catch (error) {
      console.error('Error assigning delivery:', error);
      alert('❌ Error assigning delivery. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Truck className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Assign Delivery Partner</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="space-y-1">
                  <div><span className="text-blue-700">Order ID:</span> <span className="font-bold">#{order.id}</span></div>
                  <div><span className="text-blue-700">Customer:</span> <span className="font-bold">{order.customerName}</span></div>
                  <div><span className="text-blue-700">Phone:</span> <span className="font-bold">{order.customerPhone}</span></div>
                  <div><span className="text-blue-700">Total Amount:</span> <span className="font-bold">₹{order.totalAmount}</span></div>
                </div>
              </div>
              <div>
                <div className="space-y-1">
                  <div><span className="text-blue-700">Order Time:</span> <span className="font-bold">{formatTime(order.orderTime)}</span></div>
                  <div><span className="text-blue-700">Items:</span> <span className="font-bold">{order.items.length} items</span></div>
                  <div><span className="text-blue-700">Status:</span> <span className="font-bold capitalize">{order.status.replace('_', ' ')}</span></div>
                  <div><span className="text-blue-700">Kitchen Staff:</span> <span className="font-bold">{order.assignedStaff}</span></div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <span className="text-blue-700 font-medium">Delivery Address:</span>
                  <div className="font-bold text-blue-900">{order.deliveryAddress}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Priority</label>
            <div className="grid grid-cols-3 gap-3">
              {['normal', 'high', 'urgent'].map((priorityLevel) => (
                <button
                  key={priorityLevel}
                  type="button"
                  onClick={() => setPriority(priorityLevel as any)}
                  className={`p-3 rounded-lg font-medium transition-colors border-2 ${
                    priority === priorityLevel
                      ? priorityLevel === 'urgent' ? 'border-red-500 bg-red-50 text-red-700' :
                        priorityLevel === 'high' ? 'border-orange-500 bg-orange-50 text-orange-700' :
                        'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {priorityLevel === 'urgent' ? '🚨 URGENT' :
                   priorityLevel === 'high' ? '⚡ HIGH' :
                   '📋 NORMAL'}
                </button>
              ))}
            </div>
          </div>

          {/* Available Delivery Partners */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Delivery Partner</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePartners.map((partner) => (
                <div
                  key={partner.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPartner === partner.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePartnerSelect(partner.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {partner.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{partner.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(partner.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(partner.status)}`}>
                        {partner.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Truck className="h-3 w-3" />
                        <span>{partner.vehicleNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Navigation className="h-3 w-3" />
                        <span>{partner.location}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{partner.rating} rating</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{partner.avgDeliveryTime} min avg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current: {partner.currentDeliveries} deliveries</span>
                    <span>Total: {partner.totalDeliveries} completed</span>
                  </div>
                  
                  {partner.status === 'busy' && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                      ⚠️ Currently busy with {partner.currentDeliveries} deliveries
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          {selectedPartner && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">Delivery Assignment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={estimatedDeliveryTime}
                    onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Delivery Instructions</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="e.g., Ring doorbell, Call on arrival, Handle with care..."
                  />
                </div>
              </div>
              
              {/* Assignment Summary */}
              <div className="mt-4 p-3 bg-white border border-green-300 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Assignment Summary</h5>
                <div className="text-sm text-green-700 space-y-1">
                  <div>
                    <span className="font-medium">Partner:</span> {deliveryPartners.find(p => p.id === selectedPartner)?.name}
                  </div>
                  <div>
                    <span className="font-medium">Vehicle:</span> {deliveryPartners.find(p => p.id === selectedPartner)?.vehicleNumber}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {deliveryPartners.find(p => p.id === selectedPartner)?.phone}
                  </div>
                  <div>
                    <span className="font-medium">Est. Delivery:</span> {estimatedDeliveryTime ? new Date(estimatedDeliveryTime).toLocaleString('en-IN') : 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span> <span className="uppercase">{priority}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignDelivery}
              disabled={!selectedPartner || !estimatedDeliveryTime}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              🚚 Assign Delivery Partner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}