import React, { useState } from 'react';
import { Customer, SubscriptionType } from '../types';
import { Search, Plus, Edit2, Trash2, Phone, MapPin } from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  onAddCustomer: (c: Customer) => void;
  onEditCustomer: (c: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onAddCustomer, onEditCustomer, onDeleteCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    address: '',
    mobile: '',
    defaultQuantity: 1,
    pricePerLitre: 60,
    subscriptionType: SubscriptionType.DAILY,
    balance: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const existing = customers.find(c => c.id === editingId);
      if(existing) {
          onEditCustomer({ ...existing, ...formData } as Customer);
      }
    } else {
      const newCustomer: Customer = {
        id: `c-${Date.now()}`,
        isActive: true,
        ...formData as any
      };
      onAddCustomer(newCustomer);
    }
    handleCloseModal();
  };

  const handleOpenEdit = (c: Customer) => {
      setEditingId(c.id);
      setFormData(c);
      setIsModalOpen(true);
  }

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        name: '',
        address: '',
        mobile: '',
        defaultQuantity: 1,
        pricePerLitre: 60,
        subscriptionType: SubscriptionType.DAILY,
        balance: 0
      });
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
            <Plus className="w-5 h-5" /> Add Customer
        </button>
      </div>

      <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
            type="text"
            placeholder="Search by name, mobile, or address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm focus:shadow-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((customer, index) => (
            <div 
                key={customer.id} 
                style={{ animationDelay: `${index * 50}ms` }}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{customer.name}</h3>
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full mt-1 ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => handleOpenEdit(customer)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeleteCustomer(customer.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 mb-5">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {customer.address}
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {customer.mobile}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 px-5 pb-5">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Daily Qty</p>
                        <p className="font-semibold text-slate-700">{customer.defaultQuantity} L</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Rate</p>
                        <p className="font-semibold text-slate-700">₹{customer.pricePerLitre}/L</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">Balance</p>
                        <p className={`font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₹{Math.abs(customer.balance)} {customer.balance > 0 ? 'Due' : 'Adv'}
                        </p>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                  <h2 className="text-xl font-bold mb-4 text-slate-800">{editingId ? 'Edit Customer' : 'New Customer'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                          <input required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                          <input required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                          <input required type="tel" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Qty (Liters)</label>
                            <input required type="number" step="0.5" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.defaultQuantity} onChange={e => setFormData({...formData, defaultQuantity: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price/Litre</label>
                            <input required type="number" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.pricePerLitre} onChange={e => setFormData({...formData, pricePerLitre: parseFloat(e.target.value)})} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-8">
                          <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium">Cancel</button>
                          <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium">Save Customer</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Customers;