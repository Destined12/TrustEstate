
import React from 'react';

interface HomeProps {
  onGetStarted: () => void;
}

const Home: React.FC<HomeProps> = ({ onGetStarted }) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center px-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-90 scale-105"
            alt="Luxury Home"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-6xl w-full text-white space-y-8">
           <div className="space-y-4 max-w-2xl animate-in slide-in-from-left-10 duration-700">
             <span className="bg-indigo-600/20 backdrop-blur-md border border-indigo-500/30 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">
               Securing Nigerian Real Estate
             </span>
             <h1 className="text-7xl font-black leading-[1.05] tracking-tight">
               Integrity First. <br/> <span className="text-indigo-400">Assets Verified.</span>
             </h1>
             <p className="text-xl text-slate-300 font-medium leading-relaxed">
               Welcome to the private registry. Every listing is biometrically verified, every landlord is KYC audited, and every deal is secured by our integrity protocol.
             </p>
           </div>
           
           <div className="flex items-center space-x-6 pt-4 animate-in slide-in-from-bottom-10 delay-300 duration-700">
             <button onClick={onGetStarted} className="px-10 py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest flex items-center group">
               Explore Registry <i className="fas fa-arrow-right ml-3 group-hover:translate-x-2 transition-transform"></i>
             </button>
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-800 shadow-xl">
                   <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user"/>
                 </div>
               ))}
               <div className="w-12 h-12 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-black shadow-xl">
                 +2k
               </div>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Nodes Active</p>
           </div>
        </div>
      </section>

      {/* Featured Badges */}
      <section className="bg-white py-16 px-10 border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
           <FeatureBadge icon="fa-fingerprint" title="Identity Verified" desc="99.4% Biometric Accuracy" />
           <FeatureBadge icon="fa-file-shield" title="Doc Integrity" titleColor="text-emerald-600" desc="Blockchain Hash-Linked Deeds" />
           <FeatureBadge icon="fa-tower-observation" title="Fraud Guard" titleColor="text-rose-600" desc="Real-time Signal Analysis" />
           <FeatureBadge icon="fa-handshake-check" title="Escrow Secure" desc="Tenant-Driven Deal Handshakes" />
        </div>
      </section>
    </div>
  );
};

const FeatureBadge = ({ icon, title, desc, titleColor }: { icon: string, title: string, desc: string, titleColor?: string }) => (
  <div className="flex items-start space-x-5">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl text-indigo-600 shadow-inner border border-slate-100">
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${titleColor || 'text-slate-900'}`}>{title}</h4>
      <p className="text-xs text-slate-500 font-bold leading-tight">{desc}</p>
    </div>
  </div>
);

export default Home;
