
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { UserProfile, Property, UserRole } from "../../types";
import * as db from "../../dbService";
import { User, Phone, Mail, ShieldCheck, ExternalLink, Image as ImageIcon, Briefcase, Building, MessageCircle, LogOut } from "lucide-react";

interface Props {
  user: UserProfile;
  properties: Property[];
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export default function ProfilePage({ user, properties, onUpdateUser, onLogout }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  
  const myProperties = useMemo(() => 
    properties.filter(p => p.ownerId === user.id), 
    [properties, user.id]
  );

  const whatsappLink = useMemo(() => 
    user.phone ? `https://wa.me/${user.phone.replace(/\D/g, "")}` : null,
    [user.phone]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await onUpdateUser(user.id, { profileImage: base64 });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAuditDetails = () => {
    const propSummary = myProperties.length > 0 
      ? myProperties.map(p => 
          `- ${p.title} (${p.propertyType || 'Asset'})
    Registry ID: ${p.upc}
    Units: ${p.units || 1}
    Valuation: N${p.price.toLocaleString()}
    Coords: ${p.latitude || 'N/A'}, ${p.longitude || 'N/A'}
    Address: ${p.address}`
        ).join('\n\n')
      : "No assets registered to this node.";
      
    const message = `
FULL NODE AUDIT REPORT:
-----------------------
IDENTITY DATA:
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || 'Not Registered'}
WhatsApp Protocol: ${whatsappLink || 'Unavailable'}
Registry Role: ${user.role}
Verification: ${user.isKycVerified ? 'Authorized Node' : 'Audit Pending'}
Fraud Risk Index: ${user.fraudScore || 0}%

REGISTERED ASSET LEDGER:
${propSummary}

Generated on: ${new Date().toLocaleString()}
    `;
    alert(message);
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b pb-8 border-slate-200">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Registry Node Profile</h1>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Identity Hub • authorized terminal</p>
        </div>
        <Button onClick={onLogout} variant="ghost" className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-6 py-4 rounded-2xl h-fit border border-rose-100 flex items-center gap-3">
           <LogOut size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="rounded-[3rem] border-none shadow-xl overflow-hidden bg-white">
              <CardContent className="p-10 text-center space-y-6">
                 <div className="relative w-40 h-40 mx-auto">
                    <img 
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=200`} 
                      className="w-full h-full object-cover rounded-[2.5rem] border-4 border-slate-50 shadow-inner shadow-slate-200"
                    />
                    <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-indigo-700 transition-all border-4 border-white">
                       {isUploading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white animate-spin rounded-full"></div> : <ImageIcon size={20} />}
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                    </label>
                 </div>
                 
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] bg-indigo-50 px-3 py-1 rounded-full">{user.role}</span>
                 </div>

                 <div className="pt-4 flex flex-col gap-2">
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${user.isKycVerified ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                       <span className="text-[9px] font-black uppercase tracking-widest">Integrity Status</span>
                       <ShieldCheck size={16} />
                    </div>
                 </div>

                 <Button onClick={handleAuditDetails} className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">
                    Generate Full Node Audit
                 </Button>
              </CardContent>
           </Card>

           <Card className="rounded-[3rem] border-none shadow-sm bg-slate-900 text-white overflow-hidden">
              <CardContent className="p-8 space-y-6">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">Protocol Channels</h3>
                 <div className="space-y-6">
                    <ChannelItem icon={<Mail size={16}/>} label="Email Node" value={user.email} />
                    <ChannelItem icon={<Phone size={16}/>} label="Phone Registry" value={user.phone || 'Unlinked'} />
                    {whatsappLink && (
                       <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-xl transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                                <MessageCircle size={18} />
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">WhatsApp Link</p>
                                <p className="text-sm font-black text-emerald-400">Open Protocol</p>
                             </div>
                          </div>
                          <ExternalLink size={14} className="text-slate-700 group-hover:text-emerald-400" />
                       </a>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Assets Section */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Managed Assets Ledger</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{myProperties.length} Records found</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProperties.map(p => (
                <Card key={p.id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                   <div className="h-40 overflow-hidden relative">
                      <img src={p.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-[9px] font-black text-slate-900 uppercase">
                         {p.propertyType || 'Asset'}
                      </div>
                   </div>
                   <CardContent className="p-6 space-y-4">
                      <div className="space-y-1">
                         <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight line-clamp-1">{p.title}</h4>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.address}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                         <span className="text-sm font-black text-indigo-600 tracking-tighter">₦{p.price.toLocaleString()}</span>
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${p.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {p.status}
                         </span>
                      </div>
                   </CardContent>
                </Card>
              ))}
              {myProperties.length === 0 && (
                 <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                    <Building className="text-slate-300" size={48} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No assets listed on this node.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function ChannelItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
       <div className="w-10 h-10 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center">
          {icon}
       </div>
       <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-black text-slate-200">{value}</p>
       </div>
    </div>
  );
}
