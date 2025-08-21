import React, { useState } from 'react';
import { DollarSign, Plus, Search, Filter, Download, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PayrollRecord } from '../../types';

// Mock staff data for payroll
const mockStaffForPayroll = [
  { id: '2', name: 'Ravi Kumar', role: 'kitchen_staff', baseSalary: 25000, department: 'Kitchen' },
  { id: '3', name: 'Priya Sharma', role: 'inventory_manager', baseSalary: 30000, department: 'Operations' },
  { id: '4', name: 'Suresh Babu', role: 'delivery_staff', baseSalary: 20000, department: 'Delivery' },
  { id: '5', name: 'Lakshmi Menon', role: 'kitchen_staff', baseSalary: 22000, department: 'Kitchen' },
  { id: '6', name: 'Arjun Nair', role: 'delivery_staff', baseSalary: 18000, department: 'Delivery' }
];

const mockPayrollRecords: PayrollRecord[] = [
  {
    id: '1',
    employeeId: '2',
    month: '2024-01',
    baseSalary: 25000,
    overtime: 2000,
    bonus: 1000,
    deductions: 500,
    netSalary: 27500,
    status: 'paid'
  },
  {
    id: '2',
    employeeId: '3',
    month: '2024-01',
    baseSalary: 30000,
    overtime: 1500,
    bonus: 2000,
    deductions: 600,
    netSalary: 32900,
    status: 'paid'
  },
  {
    id: '3',
    employeeId: '4',
    month: '2024-01',
    baseSalary: 20000,
    overtime: 3000,
    bonus: 500,
    deductions: 400,
    netSalary: 23100,
    status: 'pending'
  }
];

export function PayrollManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('2024-01');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showProcessModal, setShowProcessModal] = useState(false);

  // Generate months from business start (Jan 2023) to current date
  const generateAvailableMonths = () => {
    const months = [];
    const startDate = new Date(2023, 0); // January 2023 (business start)
    const currentDate = new Date();
    
    let currentMonth = new Date(startDate);
    
    while (currentMonth <= currentDate) {
      const year = currentMonth.getFullYear();
      const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
      const monthValue = `${year}-${month}`;
      const monthLabel = currentMonth.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      months.push({ value: monthValue, label: monthLabel });
      
      // Move to next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    
    return months.reverse(); // Most recent first
  };

  const availableMonths = generateAvailableMonths();

  const filteredRecords = mockPayrollRecords.filter(record => {
    const staff = mockStaffForPayroll.find(s => s.id === record.employeeId);
    const matchesSearch = staff?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = record.month === monthFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesMonth && matchesStatus;
  });

  const handleExportPayroll = () => {
    // Create CSV content
    const headers = ['Employee Name', 'Department', 'Base Salary', 'Overtime', 'Bonus', 'Deductions', 'Net Salary', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => {
        const staff = mockStaffForPayroll.find(s => s.id === record.employeeId);
        return [
          staff?.name || 'Unknown',
          staff?.department || 'Unknown',
          record.baseSalary,
          record.overtime,
          record.bonus,
          record.deductions,
          record.netSalary,
          record.status
        ].join(',');
      })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_${monthFilter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPayroll = filteredRecords.reduce((sum, record) => sum + record.netSalary, 0);
  const paidAmount = filteredRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.netSalary, 0);
  const pendingAmount = filteredRecords.filter(r => r.status === 'pending').reduce((sum, record) => sum + record.netSalary, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportPayroll}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowProcessModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Process Payroll</span>
          </button>
        </div>
      </div>

      {/* Payroll Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalPayroll.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">₹{paidAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">₹{pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-gray-900">{mockStaffForPayroll.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {availableMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const staff = mockStaffForPayroll.find(s => s.id === record.employeeId);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {staff?.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{staff?.name}</div>
                          <div className="text-sm text-gray-500">{staff?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{record.baseSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{record.overtime.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{record.bonus.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -₹{record.deductions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{record.netSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900 transition-colors text-sm font-medium">
                          Approve
                        </button>
                      )}
                      {record.status === 'approved' && (
                        <button className="text-blue-600 hover:text-blue-900 transition-colors text-sm font-medium">
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Department Wise Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {['Kitchen', 'Operations', 'Delivery'].map((dept) => {
                const deptStaff = mockStaffForPayroll.filter(s => s.department === dept);
                const deptPayroll = deptStaff.reduce((sum, staff) => {
                  const record = mockPayrollRecords.find(r => r.employeeId === staff.id);
                  return sum + (record?.netSalary || 0);
                }, 0);
                
                return (
                  <div key={dept} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{dept}</p>
                      <p className="text-sm text-gray-600">{deptStaff.length} employees</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{deptPayroll.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payroll Trends</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Salary</span>
                <span className="font-medium">₹{Math.round(totalPayroll / filteredRecords.length).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Overtime</span>
                <span className="font-medium">₹{filteredRecords.reduce((sum, r) => sum + r.overtime, 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Bonuses</span>
                <span className="font-medium">₹{filteredRecords.reduce((sum, r) => sum + r.bonus, 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Deductions</span>
                <span className="font-medium text-red-600">-₹{filteredRecords.reduce((sum, r) => sum + r.deductions, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Payroll Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Process Payroll</h3>
              <button
                onClick={() => setShowProcessModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  defaultValue={availableMonths[0]?.value}
                >
                  {availableMonths.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="all">All Departments</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="operations">Operations</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Processing Summary</h4>
                <div className="text-sm text-blue-700">
                  <div>Employees: {mockStaffForPayroll.length}</div>
                  <div>Estimated Total: ₹{mockStaffForPayroll.reduce((sum, staff) => sum + staff.baseSalary, 0).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Payroll processed successfully!');
                    setShowProcessModal(false);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Process Payroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}