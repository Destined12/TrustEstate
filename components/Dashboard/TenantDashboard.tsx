
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { User, Home, Clock, CheckCircle, MessageSquare, Gauge, FileText, LogOut, ShieldCheck, Send } from "lucide-react";
import { UserProfile, Property, PropertyStatus } from "../../types";
import Onboarding from "../Auth/Onboarding";
import * as db from "../../dbService";

interface TenantDashboardProps {
  user: UserProfile;
  properties: Property[];
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  onVerify: (id: string) => void;
}

export default function TenantDashboard({ user, properties, onUpdateUser, onLogout, onVerify }: TenantDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'applications' | 'complaints'>('overview');
  const [complaintMsg, setComplaintMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myInterests = useMemo(() => properties.filter(p => p.interestedTenants?.some(t => t.id === user.id)), [properties, user.id]);
  const pendingDeals = useMemo(() => myInterests.filter(p => p.status === PropertyStatus.PENDING_CONFIRMATION && p.tenantId === user.id), [myInterests, user.id]);
  const confirmedDeals = useMemo(() => myInterests.filter(p => (p.status === PropertyStatus.RENTED || p.status === PropertyStatus.SOLD) && p.tenantId === user.id), [myInterests, user.id]);

  const stats = [
    { label: "Applications", value: myInterests.length, icon: FileText, color: "indigo" },
    { label: "Pending Deals", value: pendingDeals.length, icon: Clock, color: "amber" },
    { label: "Confirmed Deals", value: confirmedDeals.length, icon: CheckCircle, color: "emerald" },
    { label: "Risk Signal", value: "Normal", icon: Gauge, color: "slate" },
  ];

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    onUpdateUser(updatedUser.id, updatedUser);
    setActiveTab('overview');
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMsg) return;
    setIsSubmitting(true);
    try {
      await db.createComplaint(user.id, complaintMsg);
      alert("Dispute Logged: Our registry audit team will investigate.");
      setComplaintMsg("");
    } catch (err) {
      alert("Submission failed. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-12 bg-slate-50">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-white border-r border-slate-200 p-6 flex flex-col gap-8">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Tenant Registry</p>
          <nav className="flex flex-col gap-2">
            <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Gauge size={16}/>} label="Overview" />
            <NavBtn active={activeTab === 'verification'} onClick={() => setActiveTab('verification')} icon={<User size={16}/>} label="Verification" />
            <NavBtn active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} icon={<Home size={16}/>} label="Applications" />
            <NavBtn active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} icon={<MessageSquare size={16}/>} label="Disputes" />
          </nav>
        </div>

        <div className="mt-auto space-y-4">
          <Button onClick={onLogout} variant="ghost" className="w-full text-rose-600 hover:bg-rose-50 justify-start px-5 py-4 rounded-2xl gap-4">
             <LogOut size={16} />
             <span className="text-[10px] uppercase tracking-widest font-black">Logout Session</span>
          </Button>

          <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-2xl">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Node Secure</span>
             </div>
             <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">Node ID: {user.id.substring(0, 8)}...</p>
          </div>
        </div>
      </aside>

      <main className="col-span-12 md:col-span-9 lg:col-span-10 p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'verification' && 'Integrity Audit'}
              {activeTab === 'applications' && 'Asset Applications'}
              {activeTab === 'complaints' && 'Registry Support'}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Status: <span className={`font-bold ${user.isKycVerified ? 'text-emerald-600' : 'text-amber-600'}`}>{user.isKycVerified ? 'Verified Authorized Buyer' : 'Verification Required'}</span></p>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
             <div className="text-right">
                <p className="text-sm font-black text-slate-900">{user.name}</p>
                <p className="text-[10px] uppercase font-black text-indigo-500 tracking-widest leading-none mt-1">{user.role}</p>
             </div>
            <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}`} alt="user" className="w-12 h-12 rounded-xl border border-slate-100" />
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-8 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center shadow-inner`}>
                       <stat.icon size={28} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden">
              <div className="bg-indigo-600 h-2 w-full"></div>
              <CardContent className="p-10 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identity Integrity Check</h2>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${user.isKycVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {user.isKycVerified ? 'Authorized node' : 'Final audit pending'}
                  </span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IntegrityItem checked={user.isKycVerified} label="Government ID Verification" />
                  <IntegrityItem checked={user.kycStep >= 3} label="Biometric Confirmation" />
                </ul>
                {!user.isKycVerified && (
                  <Button onClick={() => setActiveTab('verification')} className="w-fit px-12 py-5 mt-4 text-[10px] uppercase tracking-[0.2em] font-black rounded-2xl">
                    Launch Full Identity Audit
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <Card className="rounded-[3rem] border-none shadow-sm">
                  <CardContent className="p-10 flex flex-col gap-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Handshakes</h2>
                    <div className="space-y-4">
                       {myInterests.slice(0, 3).map(p => (
                         <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                  <img src={p.images[0]} className="w-full h-full object-cover" />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-800 line-clamp-1">{p.title}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status: {p.status}</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {user.isKycVerified ? (
              <Card className="rounded-[3rem] border-none shadow-sm p-20 text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                   <ShieldCheck size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Identity Authorized</h2>
                <Button onClick={() => setActiveTab('overview')} className="px-10 py-4 font-black uppercase text-[10px] tracking-widest mt-6">Return to Command Center</Button>
              </Card>
            ) : (
              <Onboarding user={user} onComplete={handleOnboardingComplete} />
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Your Active Handshakes</h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{myInterests.length} Assets Found</span>
             </div>
             <div className="grid grid-cols-1 gap-6">
                {myInterests.map(p => (
                  <Card key={p.id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden flex flex-col md:flex-row">
                     <div className="w-full md:w-1/4 h-48 md:h-auto bg-slate-100">
                        <img src={p.images[0]} className="w-full h-full object-cover" />
                     </div>
                     <CardContent className="flex-1 p-8 flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-black text-slate-900 leading-tight">{p.title}</h3>
                              <span className="text-indigo-600 font-black text-lg tracking-tighter">₦{p.price.toLocaleString()}</span>
                           </div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center mb-4"><i className="fas fa-location-dot mr-2"></i>{p.address}</p>
                           <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block ${p.status === PropertyStatus.AVAILABLE ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              Registry Status: {p.status}
                           </div>
                        </div>
                        <div className="mt-6 flex gap-4">
                           <Button className="flex-1 py-4 text-[9px] uppercase tracking-widest font-black rounded-xl">View Details</Button>
                           {p.status === PropertyStatus.PENDING_CONFIRMATION && p.tenantId === user.id && (
                             <Button onClick={() => onVerify(p.id)} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] uppercase tracking-widest font-black rounded-xl">Finalize Deal</Button>
                           )}
                        </div>
                     </CardContent>
                  </Card>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
             <Card className="rounded-[3rem] border-none shadow-sm">
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Registry Audit Node</h2>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                      Lodge a formal dispute or report suspicious landlord behavior.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitComplaint} className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Dispute Message</label>
                      <textarea 
                        required 
                        rows={6} 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-indigo-600 font-medium resize-none text-sm" 
                        placeholder="Describe the issue in detail for investigation..."
                        value={complaintMsg}
                        onChange={e => setComplaintMsg(e.target.value)}
                      ></textarea>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 text-[10px] uppercase tracking-[0.3em] font-black rounded-2xl"
                    >
                      <Send size={14} className="mr-3" />
                      {isSubmitting ? 'Transmitting...' : 'Dispatch Protocol Report'}
                    </Button>
                  </form>
                </CardContent>
             </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.03] font-black' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}
    >
      {icon}
      <span className="text-[10px] uppercase tracking-widest">{label}</span>
    </button>
  );
}

function IntegrityItem({ checked, label }: { checked?: boolean, label: string }) {
  return (
    <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <span className={`text-[11px] font-bold uppercase tracking-tight ${checked ? 'text-slate-700' : 'text-slate-300'}`}>{label}</span>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${checked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
        <CheckCircle size={12} className={checked ? 'opacity-100' : 'opacity-20'} />
      </div>
    </li>
  );
}
