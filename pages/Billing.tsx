import React, { useState } from 'react';
import { Customer, DeliveryLog, Payment } from '../types';
import { FileText, Send, Download, IndianRupee } from 'lucide-react';
import { generateBillMessage } from '../services/geminiService';

interface BillingProps {
  customers: Customer[];
  logs: DeliveryLog[];
  payments: Payment[];
}

const Billing: React.FC<BillingProps> = ({ customers, logs, payments }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [messagePreview, setMessagePreview] = useState<string | null>(null);

  const getBillDetails = (customer: Customer) => {
    const [year, month] = selectedMonth.split('-');
    
    // Filter logs for this month and customer
    const monthlyLogs = logs.filter(l => 
      l.customerId === customer.id && 
      l.isDelivered && 
      l.date.startsWith(selectedMonth)
    );

    const totalQuantity = monthlyLogs.reduce((sum, l) => sum + l.quantity, 0);
    const totalAmount = totalQuantity * customer.pricePerLitre;
    
    // Previous balance logic could be complex, simplifying here:
    // Current Due = (Prev Balance) + (This Month Bill) - (Payments This Month)
    // For MVP, let's assume Customer.balance represents TOTAL outstanding including history.
    // But to show a specific monthly bill, we usually show: "This Month: X, Arrears: Y"
    
    return {
        quantity: totalQuantity,
        amount: totalAmount,
    };
  };

  const handleGenerateWhatsApp = async (customer: Customer) => {
    setGeneratingFor(customer.id);
    const bill = getBillDetails(customer);
    // Assume due date is 5th of next month
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(5);
    const dueDate = d.toLocaleDateString();
    
    // Total to pay = Bill Amount + Current Balance (if positive)
    // Note: customer.balance in mock is a snapshot. In a real app, calculate dynamically.
    // We will use bill.amount for the message context + outstanding.
    
    const totalDue = bill.amount + (customer.balance > 0 ? customer.balance : 0);

    const msg = await generateBillMessage(customer, totalDue, dueDate, selectedMonth);
    setMessagePreview(msg);
    setGeneratingFor(null);
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Billing & Payments</h1>
                    <p className="text-slate-500">Generate bills for {selectedMonth}</p>
                </div>
                <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="pb-3 font-semibold text-slate-600 pl-2">Customer</th>
                            <th className="pb-3 font-semibold text-slate-600">Total Milk</th>
                            <th className="pb-3 font-semibold text-slate-600">Month Bill</th>
                            <th className="pb-3 font-semibold text-slate-600">Status</th>
                            <th className="pb-3 font-semibold text-slate-600 text-right pr-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {customers.map(customer => {
                            const bill = getBillDetails(customer);
                            return (
                                <tr key={customer.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="py-4 pl-2">
                                        <div className="font-medium text-slate-800">{customer.name}</div>
                                        <div className="text-xs text-slate-400">{customer.mobile}</div>
                                    </td>
                                    <td className="py-4 text-slate-600">
                                        {bill.quantity} L
                                    </td>
                                    <td className="py-4 font-medium text-slate-800">
                                        ₹{bill.amount}
                                    </td>
                                    <td className="py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    </td>
                                    <td className="py-4 text-right pr-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleGenerateWhatsApp(customer)}
                                                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Send WhatsApp"
                                            >
                                                {generatingFor === customer.id ? (
                                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Download PDF">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
       </div>

       {/* Message Preview Modal */}
       {messagePreview && (
           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                   <h3 className="font-bold text-lg mb-4">Generated Message</h3>
                   <div className="bg-slate-100 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-line mb-4 max-h-60 overflow-y-auto">
                       {messagePreview}
                   </div>
                   <div className="flex justify-end gap-3">
                       <button 
                        onClick={() => setMessagePreview(null)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                       >
                           Close
                       </button>
                       <button 
                        onClick={() => {
                            // In real app, open WhatsApp URL
                            window.open(`https://wa.me/?text=${encodeURIComponent(messagePreview)}`, '_blank');
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                       >
                           <Send className="w-4 h-4" /> Send on WhatsApp
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default Billing;
