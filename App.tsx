import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyDelivery from './pages/DailyDelivery';
import Customers from './pages/Customers';
import Billing from './pages/Billing';
import { MOCK_CUSTOMERS, MOCK_LOGS, MOCK_PAYMENTS } from './constants';
import { Customer, DeliveryLog } from './types';

const App: React.FC = () => {
  // Simple Hash Routing for SPA
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Global State
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [logs, setLogs] = useState<DeliveryLog[]>(MOCK_LOGS);
  const [payments, setPayments] = useState(MOCK_PAYMENTS);

  // Handlers
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers([...customers, newCustomer]);
  };

  const handleEditCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const handleDeleteCustomer = (id: string) => {
    if(window.confirm("Are you sure you want to delete this customer?")) {
        setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleUpdateLog = (log: DeliveryLog) => {
    const exists = logs.find(l => l.id === log.id);
    if (exists) {
        setLogs(logs.map(l => l.id === log.id ? log : l));
    } else {
        setLogs([...logs, log]);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard customers={customers} logs={logs} />;
      case 'daily':
        return <DailyDelivery customers={customers} logs={logs} onUpdateLog={handleUpdateLog} />;
      case 'customers':
        return (
            <Customers 
                customers={customers} 
                onAddCustomer={handleAddCustomer} 
                onEditCustomer={handleEditCustomer} 
                onDeleteCustomer={handleDeleteCustomer}
            />
        );
      case 'billing':
        return <Billing customers={customers} logs={logs} payments={payments} />;
      default:
        return <Dashboard customers={customers} logs={logs} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
