
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="p-12 max-w-6xl mx-auto space-y-20 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em]">The Integrity Protocol</span>
        <h2 className="text-6xl font-black text-slate-900 tracking-tight">Building Trust in Every Square Meter.</h2>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
          TrustEstate is Nigeria's first high-security real estate registry, designed to eliminate fraud through biometric identity verification and asset hash-linking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <AboutCard 
          icon="fa-shield-halved" 
          title="Security Hub" 
          desc="Our platform uses advanced AI to analyze over 50 risk signals including IP mapping, device fingerprinting, and document authenticity scores." 
        />
        <AboutCard 
          icon="fa-user-check" 
          title="Verified Identities" 
          desc="Every landlord must undergo a multi-step identity verification process including Government ID extraction and live biometric face-match." 
        />
        <AboutCard 
          icon="fa-building-circle-check" 
          title="UPC Standard" 
          desc="Unique Property Codes (UPC) ensure that every listed asset is unique in our registry, preventing double-listings and title fraud." 
        />
      </div>

      <div className="bg-slate-900 rounded-[4rem] p-16 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full"></div>
         <div className="relative z-10 max-w-xl space-y-6">
            <h3 className="text-4xl font-black leading-tight">Zero-Trust Real Estate.</h3>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              We operate on a zero-trust architecture. This means we verify everything. From the location of the landlord to the hash of the deed, nothing enters the public registry without a perfect security handshake.
            </p>
         </div>
         <div className="mt-10 md:mt-0 grid grid-cols-2 gap-8 relative z-10">
            <div className="text-center">
              <div className="text-5xl font-black text-indigo-400">99.4%</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Biometric Match</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-indigo-400">2.4k+</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Verified Nodes</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const AboutCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 transition-all hover:shadow-xl hover:-translate-y-2">
    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner"><i className={`fas ${icon}`}></i></div>
    <h4 className="text-xl font-black text-slate-900 tracking-tight">{title}</h4>
    <p className="text-slate-500 font-medium leading-relaxed text-sm">{desc}</p>
  </div>
);

export default About;
