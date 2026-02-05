
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { User, Home, ShieldCheck, AlertTriangle, FilePlus, Flag, MessageSquare, Gauge, ChevronRight, LogOut, Send, Users } from "lucide-react";
import { UserProfile, Property, PropertyStatus, InterestedTenant } from "../../types";
import PropertyForm from "../Property/PropertyForm";
import PropertyGrid from "../Property/PropertyGrid";
import Onboarding from "../Auth/Onboarding";
import * as db from "../../dbService";

interface LandlordDashboardProps {
  user: UserProfile;
  properties: Property[];
  onAddProperty: (prop: Property) => void;
  onUpdateProperty: (id: string, updates: Partial<Property>) => void;
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  onVerify: (id: string) => void;
}

export default function LandlordDashboard({ user, properties, onAddProperty, onUpdateProperty, onUpdateUser, onLogout, onVerify }: LandlordDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'add' | 'my-props' | 'flagged' | 'complaints'>('overview');
  const [complaintMsg, setComplaintMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectingTenantForId, setSelectingTenantForId] = useState<string | null>(null);

  const myProperties = useMemo(() => properties.filter(p => p.ownerId === user.id), [properties, user.id]);
  const flaggedProperties = useMemo(() => myProperties.filter(p => p.status === PropertyStatus.LOCKED || (p.fraudScore && p.fraudScore > 20)), [myProperties]);

  const stats = useMemo(() => [
    { label: "Listed Properties", value: myProperties.length, icon: Home, color: "indigo" },
    { label: "Pending Verification", value: myProperties.filter(p => p.status === PropertyStatus.PENDING_CONFIRMATION).length, icon: AlertTriangle, color: "amber" },
    { label: "Confirmed Deals", value: myProperties.filter(p => p.status === PropertyStatus.RENTED || p.status === PropertyStatus.SOLD).length, icon: ShieldCheck, color: "emerald" },
    { label: "Risk Signals", value: flaggedProperties.length, icon: Flag, color: "rose" },
  ], [myProperties, flaggedProperties]);

  const handlePropertySubmit = (prop: Property) => {
    onAddProperty(prop);
    setActiveTab('my-props');
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    onUpdateUser(updatedUser.id, updatedUser);
    setActiveTab('overview');
  };

  const handleInitiateDeal = (propId: string) => {
    const prop = myProperties.find(p => p.id === propId);
    if (prop && prop.interestedTenants && prop.interestedTenants.length > 0) {
      setSelectingTenantForId(propId);
    } else {
      alert("No interested tenants logged for this asset yet.");
    }
  };

  const confirmTenantAssignment = (tenantId: string) => {
    if (selectingTenantForId) {
      onUpdateProperty(selectingTenantForId, { 
        status: PropertyStatus.PENDING_CONFIRMATION,
        tenantId: tenantId 
      });
      setSelectingTenantForId(null);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMsg) return;
    setIsSubmitting(true);
    try {
      await db.createComplaint(user.id, complaintMsg);
      alert("Inquiry Logged: Our security dispatch unit will respond within 24 hours.");
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Asset Control</p>
          <nav className="flex flex-col gap-2">
            <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Gauge size={16}/>} label="Overview" />
            <NavBtn active={activeTab === 'verification'} onClick={() => setActiveTab('verification')} icon={<User size={16}/>} label="Verification" />
            <NavBtn active={activeTab === 'add'} onClick={() => setActiveTab('add'} icon={<FilePlus size={16}/>} label="Add Property" />
            <NavBtn active={activeTab === 'my-props'} onClick={() => setActiveTab('my-props')} icon={<Home size={16}/>} label="My Properties" />
            <NavBtn active={activeTab === 'flagged'} onClick={() => setActiveTab('flagged')} icon={<Flag size={16}/>} label="Flagged Assets" />
            <NavBtn active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} icon={<MessageSquare size={16}/>} label="Disputes" />
          </nav>
        </div>

        <div className="mt-auto space-y-4">
          <Button onClick={onLogout} variant="ghost" className="w-full text-rose-600 hover:bg-rose-50 justify-start px-5 py-4 rounded-2xl gap-4">
             <LogOut size={16} />
             <span className="text-[10px] uppercase tracking-widest font-black">Logout</span>
          </Button>

          <div className="bg-indigo-900 rounded-3xl p-6 text-white border border-indigo-800 shadow-2xl">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Integrity Protocol</span>
             </div>
             <p className="text-[9px] font-bold text-indigo-400 leading-relaxed uppercase">Node ID: {user.id.substring(0, 8)}...</p>
          </div>
        </div>
      </aside>

      <main className="col-span-12 md:col-span-9 lg:col-span-10 p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'verification' && 'Identity Integrity'}
              {activeTab === 'add' && 'Register New Asset'}
              {activeTab === 'my-props' && 'Property Ledger'}
              {activeTab === 'flagged' && 'Risk Monitoring'}
              {activeTab === 'complaints' && 'Dispute Center'}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Managed node: <span className="font-bold text-slate-700">{user.email}</span>
            </p>
          </div>
          
          <div className={`px-5 py-2.5 rounded-2xl border flex items-center gap-3 ${user.isKycVerified ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700 animate-pulse'}`}>
             <ShieldCheck size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest">
               {user.isKycVerified ? 'Verified Authorized Node' : 'KYC Audit Required'}
             </span>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <Card className="rounded-[3rem] border-none shadow-sm">
                  <CardContent className="p-10 flex flex-col gap-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Registry Logs</h2>
                    <div className="space-y-4">
                       {myProperties.slice(0, 4).map(p => (
                         <div key={p.id} className="flex items-center justify-between group p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden">
                                  <img src={p.images[0]} className="w-full h-full object-cover" />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-800 line-clamp-1">{p.title}</p>
                                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{p.status}</p>
                               </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                         </div>
                       ))}
                    </div>
                  </CardContent>
               </Card>

               <Card className="rounded-[3rem] border-none shadow-sm overflow-hidden bg-indigo-600 text-white relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full"></div>
                  <CardContent className="p-10 relative z-10 flex flex-col h-full justify-between">
                    <div className="space-y-4">
                       <h2 className="text-2xl font-black tracking-tight leading-tight">Secure your profile to unlock more slots.</h2>
                       <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                         Nodes with 90%+ verification score receive priority marketplace placement.
                       </p>
                    </div>
                    {!user.isKycVerified && (
                      <Button onClick={() => setActiveTab('verification')} className="w-fit bg-white text-indigo-600 hover:bg-indigo-50 mt-6 px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl">
                        Verify Identity
                      </Button>
                    )}
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Identity is Authenticated</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-6">
                   <VerificationBadge label="KYC (NIN)" status={true} />
                   <VerificationBadge label="Biometric Match" status={true} />
                </div>
              </Card>
            ) : (
              <Onboarding user={user} onComplete={handleOnboardingComplete} />
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <PropertyForm user={user} onSubmit={handlePropertySubmit} onClose={() => setActiveTab('overview')} />
          </div>
        )}

        {activeTab === 'my-props' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <PropertyGrid 
               properties={myProperties} 
               user={user} 
               onStatusChange={(id, status) => {
                 if (status === PropertyStatus.PENDING_CONFIRMATION) handleInitiateDeal(id);
                 else onUpdateProperty(id, { status: status as PropertyStatus });
               }}
               onVerify={onVerify} 
               onViewDetails={() => {}} 
               onFlag={(id) => onUpdateProperty(id, { status: PropertyStatus.LOCKED })} 
               onExpressInterest={() => {}} 
               comparisonIds={[]} 
               onToggleComparison={() => {}} 
             />
          </div>
        )}

        {activeTab === 'flagged' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Restricted Assets</h2>
             {flaggedProperties.length > 0 ? (
               <PropertyGrid 
                 properties={flaggedProperties} 
                 user={user} 
                 onStatusChange={(id, status) => onUpdateProperty(id, { status: status as PropertyStatus })}
                 onVerify={onVerify} 
                 onViewDetails={() => {}} 
                 onFlag={(id) => onUpdateProperty(id, { status: PropertyStatus.LOCKED })} 
                 onExpressInterest={() => {}} 
                 comparisonIds={[]} 
                 onToggleComparison={() => {}} 
               />
             ) : (
               <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
                 <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-4" />
                 <p className="font-bold text-slate-600">No Restricted Assets in your Node.</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
             <Card className="rounded-[3rem] border-none shadow-sm">
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Protocol Dispute Node</h2>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                      Submit a manual verification request or report a registry error.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitComplaint} className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Encrypted Message</label>
                      <textarea 
                        required 
                        rows={6} 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-indigo-600 font-medium resize-none text-sm" 
                        placeholder="State your dispute or request details..."
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
                      {isSubmitting ? 'Transmitting...' : 'Dispatch Transmission'}
                    </Button>
                  </form>
                </CardContent>
             </Card>
          </div>
        )}

        {/* Tenant Selection Modal */}
        {selectingTenantForId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Assign Transaction Node</h3>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Select the buyer/tenant for this deal</p>
                 </div>
                 <button onClick={() => setSelectingTenantForId(null)} className="text-slate-400 hover:text-white transition-colors">
                    <AlertTriangle size={24} />
                 </button>
              </div>
              <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {myProperties.find(p => p.id === selectingTenantForId)?.interestedTenants?.map((t: InterestedTenant) => (
                  <button 
                    key={t.id} 
                    onClick={() => confirmTenantAssignment(t.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4 text-left">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {t.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800">{t.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{t.email}</p>
                       </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                  </button>
                ))}
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                 <Button variant="ghost" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setSelectingTenantForId(null)}>Cancel</Button>
              </div>
            </div>
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

function VerificationBadge({ label, status }: { label: string, status: boolean }) {
  return (
    <div className={`p-3 rounded-2xl flex items-center justify-between border ${status ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
       <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
       <ShieldCheck size={14} className={status ? 'text-emerald-500' : 'text-slate-300'} />
    </div>
  );
}
