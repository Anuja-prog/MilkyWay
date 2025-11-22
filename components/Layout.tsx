import React from 'react';
import { Home, Truck, Users, FileText, Menu, X, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'daily', label: 'Daily Entry', icon: Truck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'billing', label: 'Billing', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="font-bold text-xl flex items-center gap-2">
            <Truck className="w-6 h-6" /> MilkyWay
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar (Desktop) / Drawer (Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        md:relative md:translate-x-0 shadow-xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex h-16 items-center px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl shadow-md">
             <Truck className="w-6 h-6 mr-2" /> MilkyWay
          </div>
          
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
                  ${currentPage === item.id 
                    ? 'bg-blue-50 text-blue-700 shadow-sm translate-x-1' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                  }`}
              >
                <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${currentPage === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-100">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <h4 className="text-xs font-semibold text-blue-800 uppercase mb-1">Support</h4>
                <p className="text-xs text-blue-600">Need help? Call admin support.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8 scroll-smooth">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;