
import React, { useState } from 'react';
import { Property, PropertyStatus, UserProfile, LifecycleEntry, UserRole } from '../../types';

interface PropertyGridProps {
  properties: Property[];
  user: UserProfile;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onVerify: (id: string) => void;
  onViewDetails: (property: Property) => void;
  onFlag: (id: string) => void;
  onExpressInterest: (id: string) => void;
  comparisonIds: string[];
  onToggleComparison: (id: string) => void;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, user, onStatusChange, onVerify, onViewDetails, onFlag, onExpressInterest,
  comparisonIds, onToggleComparison
}) => {
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const handleAuditView = (p: Property) => {
    setActiveProperty(p);
    onViewDetails(p);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map(prop => (
        <PropertyCard 
          key={prop.id} 
          property={prop} 
          user={user} 
          onStatusChange={onStatusChange} 
          onVerify={onVerify}
          onViewDetails={handleAuditView}
          onFlag={onFlag}
          onExpressInterest={onExpressInterest}
          isSelectedForComparison={comparisonIds.includes(prop.id)}
          onToggleComparison={() => onToggleComparison(prop.id)}
        />
      ))}

      {activeProperty && (
        <AuditLogModal 
          property={activeProperty} 
          user={user}
          onClose={() => setActiveProperty(null)} 
        />
      )}
    </div>
  );
};

const PropertyCard: React.FC<{ 
  property: Property; 
  user: UserProfile; 
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onVerify: (id: string) => void;
  onViewDetails: (property: Property) => void;
  onFlag: (id: string) => void;
  onExpressInterest: (id: string) => void;
  isSelectedForComparison: boolean;
  onToggleComparison: () => void;
}> = ({ 
  property, user, onStatusChange, onVerify, onViewDetails, onFlag, onExpressInterest,
  isSelectedForComparison, onToggleComparison
}) => {
  const alreadyInterested = property.interestedTenants?.some(t => t.id === user.id);
  const displayImage = property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800';

  const getStatusConfig = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.AVAILABLE:
        return { bg: 'bg-emerald-500', label: 'Available', icon: 'fa-globe', border: 'border-emerald-100' };
      case PropertyStatus.PENDING_CONFIRMATION:
        return { bg: 'bg-amber-500', label: 'Pending Confirmation', icon: 'fa-clock', border: 'border-amber-100' };
      case PropertyStatus.SOLD:
        return { bg: 'bg-indigo-600', label: 'Registry: SOLD', icon: 'fa-check-double', border: 'border-indigo-100' };
      case PropertyStatus.RENTED:
        return { bg: 'bg-blue-600', label: 'Registry: RENTED', icon: 'fa-key', border: 'border-blue-100' };
      case PropertyStatus.LOCKED:
        return { bg: 'bg-rose-600', label: 'Locked (Fraud/Dispute)', icon: 'fa-shield-virus', border: 'border-rose-100' };
      default:
        return { bg: 'bg-slate-500', label: 'Archive', icon: 'fa-box-archive', border: 'border-slate-100' };
    }
  };

  const statusConfig = getStatusConfig(property.status);
  const isOwner = user && user.id === property.ownerId;
  const isPendingTenant = user && user.id === property.tenantId && property.status === PropertyStatus.PENDING_CONFIRMATION;
  
  return (
    <div className={`bg-white rounded-[2.5rem] shadow-sm border overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl ${isSelectedForComparison ? 'ring-4 ring-indigo-500/20 border-indigo-500' : 'border-slate-100'} ${property.status === PropertyStatus.LOCKED ? 'opacity-90 grayscale-[0.3]' : ''}`}>
      <div className="relative h-56 overflow-hidden">
        <img src={displayImage} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
        <div className="absolute top-4 left-4">
           <span className={`${statusConfig.bg} text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center`}>
             <i className={`fas ${statusConfig.icon} mr-2`}></i> {statusConfig.label}
           </span>
        </div>
        <button onClick={onToggleComparison} className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelectedForComparison ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/30'}`}>
          <i className="fas fa-layer-group text-xs"></i>
        </button>
      </div>
      
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2">{property.title}</h3>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center"><i className="fas fa-location-dot mr-2 text-indigo-500"></i>{property.address}</p>
        </div>

        <div className="flex justify-between items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Registry Value</span>
            <div className="text-xl font-black text-indigo-600 tracking-tighter">₦{property.price.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Risk Index</span>
            <div className={`text-xs font-bold ${property.fraudScore < 20 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {property.fraudScore}% {property.fraudScore > 20 ? 'Warning' : 'Verified'}
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col space-y-2 mt-auto">
          {isOwner && property.status === PropertyStatus.AVAILABLE && (
            <button 
              onClick={() => onStatusChange(property.id, PropertyStatus.PENDING_CONFIRMATION)} 
              className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              Initiate Close Deal
            </button>
          )}

          {property.status === PropertyStatus.AVAILABLE && !isOwner && user.id !== 'guest' && (
            <button 
              onClick={() => onExpressInterest(property.id)} 
              className={`w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${alreadyInterested ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'}`}
              disabled={alreadyInterested}
            >
              {alreadyInterested ? 'Handshake Logged' : 'Express Protocol Interest'}
            </button>
          )}

          {isPendingTenant && (
            <button 
              onClick={() => onVerify(property.id)} 
              className="w-full py-4 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all animate-pulse"
            >
              Finalize Verification Handshake
            </button>
          )}

          <button 
            onClick={() => onViewDetails(property)}
            className="w-full py-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all"
          >
            Audit & View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const AuditLogModal: React.FC<{ property: Property, user: UserProfile, onClose: () => void }> = ({ property, user, onClose }) => {
  const [activeImg, setActiveImg] = useState(0);
  const whatsappLink = property.ownerPhone ? `https://wa.me/${property.ownerPhone.replace(/\D/g, '')}` : null;
  const isPrivileged = user.role === UserRole.ADMIN || user.id === property.ownerId;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
      <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row my-auto h-[90vh]">
        {/* Left Side: Images and Identity Node */}
        <div className="w-full md:w-2/5 bg-slate-50 flex flex-col border-r border-slate-100 overflow-y-auto custom-scrollbar">
           <div className="h-80 shrink-0 relative overflow-hidden">
              <img src={property.images[activeImg] || 'https://via.placeholder.com/600'} className="w-full h-full object-cover transition-all" />
              <div className="absolute bottom-6 left-6 flex gap-2">
                 {property.images.map((_, i) => (
                   <button key={i} onClick={() => setActiveImg(i)} className={`w-3 h-3 rounded-full border-2 border-white transition-all ${activeImg === i ? 'bg-white scale-125' : 'bg-white/40'}`}></button>
                 ))}
              </div>
              <div className="absolute top-6 right-6 bg-slate-900/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                 {property.type} Protocol
              </div>
           </div>
           
           <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Index</p>
                    <div className="flex items-center gap-2">
                       <span className={`text-xl font-black ${property.fraudScore < 15 ? 'text-emerald-600' : 'text-rose-600'}`}>{property.fraudScore}%</span>
                       <div className={`w-2 h-2 rounded-full ${property.fraudScore < 15 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">UPC Registry</p>
                    <code className="text-[10px] font-black text-indigo-600 font-mono block truncate">{property.upc}</code>
                 </div>
              </div>

              {/* Owner Identity Section */}
              <div className="bg-slate-900 rounded-[2rem] p-6 text-white space-y-4 shadow-xl">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 ${property.ownerKycStatus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          <i className={`fas ${property.ownerKycStatus ? 'fa-user-check' : 'fa-user-clock'}`}></i>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner Verification</p>
                          <p className="text-xs font-black">{property.ownerKycStatus ? 'Identity Verified' : 'Audit Pending'}</p>
                       </div>
                    </div>
                    {property.ownerKycStatus && <i className="fas fa-certificate text-indigo-400"></i>}
                 </div>
                 
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Authorized Node Contact</p>
                    <p className="text-sm font-black tracking-tight">{property.ownerName || 'Anonymous Node'}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{property.ownerPhone || 'No Phone Link'}</p>
                 </div>

                 {whatsappLink && (
                   <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
                   >
                     <i className="fab fa-whatsapp text-lg"></i>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Open WhatsApp Link</span>
                   </a>
                 )}
              </div>

              {/* Risk Analysis Log (Visible to All) */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Risk Signal Log</h4>
                 <div className="space-y-3">
                    {property.signals && property.signals.length > 0 ? (
                       property.signals.map((sig, i) => (
                          <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex gap-3 items-start">
                             <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${sig.severity === 'High' ? 'bg-rose-500' : sig.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                             <div>
                                <p className="text-[9px] font-black text-slate-800 uppercase leading-none mb-1">{sig.type} Protocol</p>
                                <p className="text-[10px] text-slate-500 font-medium leading-tight">{sig.description}</p>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center">
                          <p className="text-[9px] font-black text-emerald-600 uppercase">Heuristic Clean • No Active Flags</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Detailed Profile & Handshakes */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
           <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{property.title}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{property.address}</p>
                 </div>
                 <button onClick={onClose} className="bg-slate-50 hover:bg-slate-100 p-4 rounded-full transition-all">
                    <i className="fas fa-times text-xl text-slate-400"></i>
                 </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <DetailItem label="Asset Units" value={property.units?.toString() || '1'} icon="fa-building" />
                 <DetailItem label="Classification" value={property.propertyType || 'Residential'} icon="fa-tag" />
                 <DetailItem label="Latitude" value={property.latitude?.toFixed(4) || 'N/A'} icon="fa-location-dot" />
                 <DetailItem label="Longitude" value={property.longitude?.toFixed(4) || 'N/A'} icon="fa-compass" />
              </div>

              {/* Asset Intelligence */}
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Asset Intelligence Report</h3>
                 <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    {property.description}
                 </p>
                 {property.neighborhoodInsights && (
                   <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100/50">
                      <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2">Neighborhood Node Data</p>
                      <p className="text-xs text-slate-600 leading-relaxed italic">{property.neighborhoodInsights}</p>
                   </div>
                 )}
              </div>

              {/* Grounding Sources */}
              {property.groundingSources && property.groundingSources.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Grounding Verification Nodes</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.groundingSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[9px] font-bold text-emerald-700 hover:bg-emerald-100 transition-all flex items-center gap-2"
                      >
                        <i className="fas fa-link text-[8px]"></i> {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Interested Tenants Ledger (Privileged) */}
              {isPrivileged && (
                 <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                       Interested Node Ledger
                       <span className="bg-white px-2 py-0.5 rounded text-[8px] font-black border border-slate-200">Owner/Admin Only</span>
                    </h3>
                    <div className="space-y-3">
                       {property.interestedTenants && property.interestedTenants.length > 0 ? (
                          property.interestedTenants.map((t, idx) => (
                             <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                                      {t.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900 leading-none mb-1">{t.name}</p>
                                      <p className="text-[10px] text-slate-400 font-bold">{t.email}</p>
                                   </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(t.timestamp).toLocaleDateString()}</span>
                             </div>
                          ))
                       ) : (
                          <p className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No interest logged yet.</p>
                       )}
                    </div>
                 </div>
              )}

              {/* Handshake History */}
              <div className="space-y-6">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Registry Handshake History</h3>
                 <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {property.lifecycleLog && property.lifecycleLog.length > 0 ? (
                      property.lifecycleLog.map((entry, i) => (
                        <div key={i} className="relative pl-10 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                           <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-500 shadow-sm flex items-center justify-center z-10">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                           </div>
                           <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                 <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{entry.status}</span>
                                 <span className="text-[9px] font-bold text-slate-400">{new Date(entry.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                 Authorized by <span className="font-black text-slate-800 uppercase tracking-tighter">{entry.actor}</span>. {entry.note}
                              </p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Sync Completed</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Security Hash & Valuation Bar */}
           <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marketplace Valuation</p>
                 <p className="text-2xl font-black text-indigo-600 tracking-tighter">₦{property.price.toLocaleString()}</p>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Integrity Hash</p>
                 <code className="text-[10px] font-mono text-slate-500 break-all bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-inner">{property.documentHash || 'UNHASHED_ASSET'}</code>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

function DetailItem({ label, value, icon }: { label: string, value: string, icon: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
       <div className="flex items-center gap-2">
          <i className={`fas ${icon} text-indigo-500 text-[10px]`}></i>
          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
       </div>
       <span className="text-xs font-black text-slate-900 truncate">{value}</span>
    </div>
  );
}

export default PropertyGrid;
