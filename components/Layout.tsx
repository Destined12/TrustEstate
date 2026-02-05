
import React from 'react';
import { UserProfile, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activeTab, setActiveTab }) => {
  const isRealUser = user && user.id !== 'guest';
  const dashboardTabs = ['dashboard', 'landlord-dash', 'tenant-dash'];

  const navigateToDashboard = () => {
    if (user.role === UserRole.ADMIN) setActiveTab('dashboard');
    else if (user.role === UserRole.LANDLORD) setActiveTab('landlord-dash');
    else setActiveTab('tenant-dash');
  };

  return (
    <div className="flex h-full flex-col">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between z-10 shadow-sm shrink-0">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
            <i className="fas fa-shield-halved text-2xl"></i>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">TrustEstate</span>
        </div>
        
        <div className="flex items-center">
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => setActiveTab('home')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Home</button>
            <button onClick={() => setActiveTab('listings')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'listings' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Marketplace</button>
            
            {isRealUser && (
              <button 
                onClick={navigateToDashboard} 
                className={`text-[10px] font-black uppercase tracking-widest transition-all ${dashboardTabs.includes(activeTab) ? 'text-indigo-600 underline underline-offset-8 decoration-2' : 'text-indigo-500 hover:text-indigo-700 font-black'}`}
              >
                Dashboard
              </button>
            )}

            <button onClick={() => setActiveTab('about')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'about' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>About</button>
            <button onClick={() => setActiveTab('contact')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'contact' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Contact</button>
            
            {!isRealUser && (
              <button 
                onClick={() => setActiveTab('login')} 
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                Login
              </button>
            )}

            {isRealUser && (
              <div 
                className="ml-6 pl-6 border-l border-slate-200 flex items-center gap-3 cursor-pointer group"
                onClick={() => setActiveTab('profile')}
              >
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                    <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest leading-none">View Profile</p>
                 </div>
                 <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}`} className="w-9 h-9 rounded-full border border-indigo-100 group-hover:scale-110 transition-transform" />
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-slate-50 relative overflow-y-auto custom-scrollbar flex flex-col">
        {children}
        
        <footer className="bg-slate-950 text-white mt-auto pt-24 pb-12 border-t border-white/5 shrink-0">
          <div className="max-w-7xl mx-auto px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
              {/* Brand Column */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
                  <div className="bg-indigo-600 text-white p-2 rounded-xl">
                    <i className="fas fa-shield-halved text-xl"></i>
                  </div>
                  <span className="text-xl font-black tracking-tighter">TrustEstate</span>
                </div>
                <p className="text-slate-400 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                  Nigeria's premier secure property registry. Eliminating real estate fraud through biometric identity nodes and asset hash-linking.
                </p>
                <div className="flex space-x-5">
                  <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>

              {/* Marketplace Column */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">Registry Hub</h4>
                <ul className="space-y-5">
                  <li><button onClick={() => setActiveTab('listings')} className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Active Marketplace</button></li>
                  <li><button onClick={() => setActiveTab('about')} className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Verification Protocol</button></li>
                  <li><button onClick={() => setActiveTab('home')} className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Market Trends</button></li>
                  <li><button onClick={() => setActiveTab('contact')} className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Node Support</button></li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">Legal Ledger</h4>
                <ul className="space-y-5">
                  <li><a href="#" className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Terms of Protocol</a></li>
                  <li><a href="#" className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Fraud Reporting</a></li>
                  <li><a href="#" className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Escrow Guidelines</a></li>
                </ul>
              </div>

              {/* Newsletter Column */}
              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">Stay Synced</h4>
                <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-widest">Receive real-time encrypted alerts on newly verified registry nodes.</p>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Enter Node Email" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-indigo-500 font-black uppercase tracking-widest text-white placeholder:text-slate-600"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white w-10 h-10 rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <i className="fas fa-paper-plane text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  © 2025 TrustEstate Registry. All Rights Secured by Biometric Integrity.
                </p>
              </div>
              <div className="flex items-center space-x-8 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="flex items-center space-x-3">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Flag_of_Nigeria.svg/1200px-Flag_of_Nigeria.svg.png" className="h-4 w-auto rounded-sm" alt="NG" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Lagos Mainnet Node</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
