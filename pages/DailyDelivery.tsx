import React, { useState } from 'react';
import { Customer, DeliveryLog } from '../types';
import { Check, X, Plus, Minus, MapPin, Share2 } from 'lucide-react';
import { optimizeRoute } from '../services/geminiService';

interface DailyDeliveryProps {
  customers: Customer[];
  logs: DeliveryLog[];
  onUpdateLog: (log: DeliveryLog) => void;
}

const DailyDelivery: React.FC<DailyDeliveryProps> = ({ customers, logs, onUpdateLog }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortedCustomerIds, setSortedCustomerIds] = useState<string[]>(customers.map(c => c.id));
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Filter logs for the selected date
  const currentLogs = logs.filter(l => l.date === selectedDate);

  const getLogForCustomer = (customerId: string) => {
    return currentLogs.find(l => l.customerId === customerId);
  };

  const handleToggleDelivery = (customer: Customer) => {
    const existingLog = getLogForCustomer(customer.id);
    if (existingLog) {
      // Toggle off or remove? Let's say toggle delivered status
      onUpdateLog({
        ...existingLog,
        isDelivered: !existingLog.isDelivered
      });
    } else {
      // Create new log
      const newLog: DeliveryLog = {
        id: `log-${selectedDate}-${customer.id}-${Date.now()}`,
        customerId: customer.id,
        date: selectedDate,
        quantity: customer.defaultQuantity,
        isDelivered: true,
        shift: 'Morning' // Defaulting to morning for MVP
      };
      onUpdateLog(newLog);
    }
  };

  const handleQuantityChange = (customer: Customer, delta: number) => {
    const existingLog = getLogForCustomer(customer.id);
    if (existingLog) {
        const newQty = Math.max(0, existingLog.quantity + delta);
        onUpdateLog({ ...existingLog, quantity: newQty });
    } else {
        // If no log exists yet, assume they want to deliver default + delta
        // But usually you verify delivery first. Let's just create a log with default + delta
        const newQty = Math.max(0, customer.defaultQuantity + delta);
        onUpdateLog({
            id: `log-${selectedDate}-${customer.id}-${Date.now()}`,
            customerId: customer.id,
            date: selectedDate,
            quantity: newQty,
            isDelivered: true,
            shift: 'Morning'
        });
    }
  };

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    const optimizedNames = await optimizeRoute(customers);
    
    // Reorder local customer IDs based on returned names
    const nameToIdMap = new Map<string, string>(customers.map(c => [c.name, c.id] as [string, string]));
    const newOrder: string[] = [];
    
    optimizedNames.forEach((name: string) => {
        const id = nameToIdMap.get(name);
        if (id) newOrder.push(id);
    });
    
    // Add any remaining (fallback)
    customers.forEach(c => {
        if (!newOrder.includes(c.id)) newOrder.push(c.id);
    });

    setSortedCustomerIds(newOrder);
    setIsOptimizing(false);
  };

  // Derived list for rendering
  const renderedCustomers = sortedCustomerIds
    .map(id => customers.find(c => c.id === id))
    .filter((c): c is Customer => !!c && c.isActive);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Daily Delivery</h1>
            <p className="text-sm text-slate-500">Mark deliveries for today</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
            />
        </div>
      </div>

      {/* Route Optimization Button */}
      <div className="flex justify-end">
          <button 
            onClick={handleOptimizeRoute}
            disabled={isOptimizing}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
          >
            <MapPin className="w-4 h-4" />
            {isOptimizing ? "Optimizing Route..." : "Optimize Route Sequence"}
          </button>
      </div>

      <div className="space-y-3">
        {renderedCustomers.map(customer => {
            const log = getLogForCustomer(customer.id);
            const isDelivered = log?.isDelivered ?? false;
            const quantity = log ? log.quantity : customer.defaultQuantity;

            return (
                <div key={customer.id} className={`
                    relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200
                    ${isDelivered 
                        ? 'bg-white border-green-200 shadow-sm' 
                        : 'bg-slate-50 border-slate-200 opacity-90 hover:opacity-100'}
                `}>
                    <div className="flex items-start gap-4 mb-4 sm:mb-0">
                        <button 
                            onClick={() => handleToggleDelivery(customer)}
                            className={`
                                w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors
                                ${isDelivered ? 'bg-green-500 text-white shadow-green-200 shadow-lg' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}
                            `}
                        >
                            {isDelivered ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                        </button>
                        <div>
                            <h3 className={`font-semibold text-lg ${isDelivered ? 'text-slate-800' : 'text-slate-500'}`}>
                                {customer.name}
                            </h3>
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {customer.address}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6 pl-16 sm:pl-0">
                        <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                            <button 
                                onClick={() => handleQuantityChange(customer, -0.5)}
                                className="p-2 hover:bg-white rounded-md transition-colors text-slate-600 disabled:opacity-50"
                                disabled={!isDelivered}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className={`font-mono font-bold w-12 text-center ${isDelivered ? 'text-slate-800' : 'text-slate-400'}`}>
                                {quantity} L
                            </span>
                            <button 
                                onClick={() => handleQuantityChange(customer, 0.5)}
                                className="p-2 hover:bg-white rounded-md transition-colors text-slate-600 disabled:opacity-50"
                                disabled={!isDelivered}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Status Indicator Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${isDelivered ? 'bg-green-500' : 'bg-slate-300'}`} />
                </div>
            );
        })}
      </div>
      
      {/* Sticky Summary Footer for Mobile */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden">
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl flex justify-between items-center">
              <div>
                  <p className="text-xs text-slate-400">Total Delivered</p>
                  <p className="font-bold text-xl">{currentLogs.filter(l => l.isDelivered).reduce((acc, l) => acc + l.quantity, 0)} L</p>
              </div>
              <div className="h-8 w-px bg-slate-700 mx-4"></div>
              <div>
                  <p className="text-xs text-slate-400">Completed</p>
                  <p className="font-bold text-xl">{currentLogs.filter(l => l.isDelivered).length}/{customers.length}</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DailyDelivery;