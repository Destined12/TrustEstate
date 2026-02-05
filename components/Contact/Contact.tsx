
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Inquiry Logged: Our security dispatch unit will respond within 24 hours.");
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="p-12 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="space-y-4">
            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em]">Contact Node</span>
            <h2 className="text-6xl font-black text-slate-900 tracking-tight">Secure Communications.</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Have a dispute, report, or general inquiry? Our node operators are ready to assist in maintaining registry integrity.
            </p>
          </div>

          <div className="space-y-8">
            <ContactInfo icon="fa-location-dot" title="Headquarters" desc="12 Integrity Way, Victoria Island, Lagos, NG" />
            <ContactInfo icon="fa-envelope-open-text" title="Secure Email" desc="integrity@trustestate.ng" />
            <ContactInfo icon="fa-phone-volume" title="Hotline" desc="+234 81 0000 9999" />
          </div>

          <div className="h-64 bg-slate-200 rounded-[3rem] overflow-hidden border-4 border-white shadow-xl relative group cursor-pointer">
             <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Map View" />
             <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/10">
                <div className="bg-indigo-600 text-white p-4 rounded-full animate-bounce shadow-2xl">
                  <i className="fas fa-location-dot text-2xl"></i>
                </div>
             </div>
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
               Live Node Map
             </div>
          </div>
        </div>

        <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl space-y-8">
           <div className="space-y-2">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Submit Protocol Inquiry</h3>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Authorized Transmission Node</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                 <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Node</label>
                 <input required type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
               </div>
             </div>
             <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Protocol</label>
                 <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
             </div>
             <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Encrypted Message</label>
                 <textarea required rows={5} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none focus:ring-2 focus:ring-indigo-600 font-medium resize-none" value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
             </div>
             <button type="submit" className="w-full py-6 bg-slate-900 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-black transition-all uppercase text-[10px] tracking-[0.3em]">Dispatch Transmission</button>
           </form>
        </div>
      </div>
    </div>
  );
};

const ContactInfo = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="flex items-center space-x-6">
    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i className={`fas ${icon}`}></i></div>
    <div>
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-lg font-black text-slate-800 tracking-tight">{desc}</p>
    </div>
  </div>
);

export default Contact;
