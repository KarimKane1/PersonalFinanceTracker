export type Page = 'income-expenses' | 'debts' | 'accounts' | 'planning' | 'dashboard';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  currentProfileName: string;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentPage, onPageChange, currentProfileName, onLogout, isOpen, onToggle }: SidebarProps) {
  const pages: { id: Page; label: string; icon: string }[] = [
    { id: 'income-expenses', label: 'Income & Expenses', icon: '💰' },
    { id: 'debts', label: 'Debts & Loans', icon: '💳' },
    { id: 'accounts', label: 'Accounts', icon: '🏦' },
    { id: 'planning', label: 'Planning', icon: '📊' },
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static
        top-0 left-0
        w-64 h-screen
        bg-gradient-to-b from-blue-600 to-blue-700
        shadow-lg flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex-1">
          <div className="mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md mb-3">
              <span className="text-2xl">💰</span>
            </div>
            <h2 className="text-white font-semibold text-lg">Finance Planner</h2>
          </div>
          <nav className="space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  onPageChange(page.id);
                  onToggle(); // Close mobile menu after selection
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                  currentPage === page.id
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'text-blue-100 hover:bg-blue-500/30 hover:text-white'
                }`}
              >
                <span className="text-lg">{page.icon}</span>
                <span>{page.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Profile and Logout Section */}
        <div className="p-6 border-t border-blue-500/30">
          <div className="mb-3 text-xs text-blue-200 font-medium truncate">{currentProfileName}</div>
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

