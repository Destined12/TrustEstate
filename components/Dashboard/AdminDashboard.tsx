
import React, { useMemo, useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Users, Home, Flag, ShieldAlert, CheckCircle, Ban, Unlock, Trash2, Clock, LogOut, MessageSquare, History } from "lucide-react";
import { UserProfile, Property, UserRole, PropertyStatus, Complaint, AuditLog } from "../../types";
import * as db from "../../dbService";

interface Props {
  users: UserProfile[];
  properties: Property[];
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onUpdateProperty: (id: string, updates: Partial<Property>) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ users, properties, onUpdateUser, onUpdateProperty, onLogout }: Props) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'assets' | 'disputes' | 'audit'>('users');

  const loadData = async () => {
    const [cList, aLogs] = await Promise.all([
      db.fetchComplaints(),
      db.fetchAuditLogs()
    ]);
    setComplaints(cList);
    setAuditLogs(aLogs);
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => ({
    users: users.length,
    flaggedUsers: users.filter(u => u.isBanned || (u.fraudScore && u.fraudScore > 20)).length,
    properties: properties.length,
    flaggedProperties: properties.filter(p => p.status === PropertyStatus.LOCKED).length,
    complaints: complaints.filter(c => !c.resolved).length,
  }), [users, properties, complaints]);

  // --- Admin Actions ---
  const handleBanUser = async (id: string) => {
    await db.upsertUser({ ...users.find(u => u.id === id)!, isBanned: true } as UserProfile);
    await db.logAudit("BAN_USER", id);
    onUpdateUser(id, { isBanned: true });
  };

  const handleSuspendUser = async (id: string) => {
    const until = new Date();
    until.setMonth(until.getMonth() + 3);
    await db.upsertUser({ ...users.find(u => u.id === id)!, suspensionUntil: until.toISOString() } as UserProfile);
    await db.logAudit("SUSPEND_USER", id);
    onUpdateUser(id, { suspensionUntil: until.toISOString() });
  };

  const handleReactivateUser = async (id: string) => {
    await db.upsertUser({ ...users.find(u => u.id === id)!, isBanned: false, suspensionUntil: undefined } as UserProfile);
    await db.logAudit("REACTIVATE_USER", id);
    onUpdateUser(id, { isBanned: false, suspensionUntil: undefined });
  };

  const handleUnlockProperty = async (id: string) => {
    await db.saveProperty({ ...properties.find(p => p.id === id)!, status: PropertyStatus.AVAILABLE });
    await db.logAudit("UNLOCK_PROPERTY", id);
    onUpdateProperty(id, { status: PropertyStatus.AVAILABLE });
  };

  const handleVerifyFromComplaint = async (complaintId: string, type: 'user' | 'property', targetId: string) => {
    if (type === 'user') {
      onUpdateUser(targetId, { isKycVerified: true, kycStep: 3 });
      await db.logAudit("VERIFY_USER_FROM_COMPLAINT", targetId);
    } else {
      onUpdateProperty(targetId, { status: PropertyStatus.AVAILABLE });
      await db.logAudit("VERIFY_PROPERTY_FROM_COMPLAINT", targetId);
    }
    await db.resolveComplaint(complaintId);
    loadData();
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen overflow-y-auto custom-scrollbar h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl"><ShieldAlert size={28} /></div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Registry Command Node</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Administrative Access Only</p>
           </div>
        </div>
        <Button onClick={onLogout} variant="ghost" className="bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl px-6 h-12 gap-2 border border-rose-100">
           <LogOut size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <KPI icon={Users} label="Nodes" value={stats.users} color="slate" />
        <KPI icon={ShieldAlert} label="Risk Nodes" value={stats.flaggedUsers} color="rose" />
        <KPI icon={Home} label="Asset Ledger" value={stats.properties} color="indigo" />
        <KPI icon={Flag} label="Locked Assets" value={stats.flaggedProperties} color="amber" />
        <KPI icon={MessageSquare} label="Open Disputes" value={stats.complaints} color="emerald" />
      </div>

      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit">
         <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={14}/>} label="Node Ops" />
         <TabBtn active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} icon={<Home size={14}/>} label="Asset Audit" />
         <TabBtn active={activeTab === 'disputes'} onClick={() => setActiveTab('disputes')} icon={<MessageSquare size={14}/>} label="Disputes" />
         <TabBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<History size={14}/>} label="Audit Trail" />
      </div>

      {activeTab === 'users' && (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in duration-300">
          <CardContent className="p-8">
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">Identity Node Registry</h2>
             <div className="divide-y divide-slate-50">
                {users.map(u => (
                  <div key={u.id} className="py-5 flex items-center justify-between group hover:bg-slate-50 px-4 rounded-2xl transition-all">
                     <div className="flex items-center gap-4">
                        <img src={u.profileImage || `https://ui-avatars.com/api/?name=${u.name}`} className="w-12 h-12 rounded-xl border border-slate-100" />
                        <div>
                           <div className="font-black text-slate-900">{u.name} <span className="text-[9px] text-slate-400 font-bold ml-2">({u.role})</span></div>
                           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{u.email} • Risk: {u.fraudScore || 0}%</div>
                           {u.suspensionUntil && <div className="text-[9px] text-amber-600 font-black uppercase mt-1">Suspended until: {new Date(u.suspensionUntil).toLocaleDateString()}</div>}
                        </div>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!u.isBanned ? (
                           <Button size="sm" variant="ghost" className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest" onClick={() => handleBanUser(u.id)}>Ban</Button>
                        ) : (
                           <Button size="sm" variant="ghost" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest" onClick={() => handleReactivateUser(u.id)}>Restore</Button>
                        )}
                        {!u.suspensionUntil && !u.isBanned && (
                           <Button size="sm" variant="ghost" className="bg-amber-50 text-amber-600 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest" onClick={() => handleSuspendUser(u.id)}>Suspend 3M</Button>
                        )}
                        <Button size="sm" variant="ghost" className="bg-slate-100 text-slate-400 px-3 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={12} /></Button>
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'disputes' && (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in duration-300">
           <CardContent className="p-8 space-y-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Mediation Hub</h2>
              <div className="divide-y divide-slate-50">
                 {complaints.filter(c => !c.resolved).map(c => (
                    <div key={c.id} className="py-6 flex justify-between items-start gap-10">
                       <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-black">!</div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Filed by: {c.userName}</p>
                                <p className="text-xs text-slate-800 font-bold">{new Date(c.createdAt).toLocaleString()}</p>
                             </div>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm font-medium italic text-slate-600 leading-relaxed">
                             "{c.message}"
                          </div>
                       </div>
                       <div className="w-64 space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Resolution Dispatch</p>
                          <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100" onClick={() => handleVerifyFromComplaint(c.id, c.propertyId ? 'property' : 'user', c.propertyId || c.userId)}>
                             Verify & Resolve
                          </Button>
                          <Button variant="ghost" className="w-full h-11 text-slate-400 hover:bg-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest" onClick={() => db.resolveComplaint(c.id).then(loadData)}>Dismiss Only</Button>
                       </div>
                    </div>
                 ))}
                 {complaints.filter(c => !c.resolved).length === 0 && (
                    <div className="py-20 text-center text-slate-400">
                       <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Registry Disputes Clear</p>
                    </div>
                 )}
              </div>
           </CardContent>
        </Card>
      )}

      {activeTab === 'assets' && (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in duration-300">
           <CardContent className="p-8">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">Marketplace Asset Oversight</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {properties.map(p => (
                    <div key={p.id} className="p-5 border border-slate-100 rounded-3xl space-y-4 hover:shadow-lg transition-all group">
                       <div className="h-32 rounded-2xl overflow-hidden bg-slate-100 relative">
                          <img src={p.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          <div className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur rounded-lg text-[8px] font-black uppercase tracking-widest">{p.status}</div>
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 truncate">{p.title}</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase mt-1">
                             <span>Valuation: N{p.price.toLocaleString()}</span>
                             <span className={p.fraudScore > 20 ? 'text-rose-500' : 'text-emerald-500'}>Score: {p.fraudScore}%</span>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          {p.status === PropertyStatus.LOCKED ? (
                             <Button className="flex-1 h-10 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-widest" onClick={() => handleUnlockProperty(p.id)}><Unlock size={12} className="mr-2" /> Unlock</Button>
                          ) : (
                             <Button className="flex-1 h-10 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-[9px] font-black uppercase tracking-widest" onClick={() => onUpdateProperty(p.id, { status: PropertyStatus.LOCKED })}><Flag size={12} className="mr-2" /> Lock Asset</Button>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in duration-300">
           <CardContent className="p-8">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">Immutable Registry Log</h2>
              <div className="space-y-4">
                 {auditLogs.map(l => (
                    <div key={l.id} className="flex gap-5 p-4 border border-slate-50 rounded-2xl items-center hover:bg-slate-50 transition-colors">
                       <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0">
                          <History size={16} />
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{l.action}</span>
                             <span className="text-[9px] font-bold text-slate-400">{new Date(l.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter leading-none">Target ID: {l.targetId?.substring(0,18) || 'System Node'}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      )}
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string, color: string }) {
  const colors: any = {
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    slate: 'bg-white text-slate-600 border-slate-200'
  };

  return (
    <Card className={`rounded-[2rem] border-none shadow-xl transition-all hover:scale-[1.02] ${colors[color]}`}>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</p>
          <p className="text-3xl font-black tracking-tighter">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white/40`}>
           <Icon size={24} />
        </div>
      </CardContent>
    </Card>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-slate-900 text-white shadow-xl font-black' : 'text-slate-500 hover:text-slate-800 font-bold'}`}>
       {icon}
       <span className="text-[10px] uppercase tracking-widest">{label}</span>
    </button>
  );
}
