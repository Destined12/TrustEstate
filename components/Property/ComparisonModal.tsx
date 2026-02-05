
import React from 'react';
import { Property } from '../../types';

interface ComparisonModalProps {
  selectedProperties: Property[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ selectedProperties, onClose, onRemove }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] p-4 md:p-12 flex flex-col animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-12 py-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Market Comparison</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Side-by-side analysis of your selected verified assets</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-all">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-x-auto p-12">
          <div className="min-w-[800px] h-full">
            <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] gap-8">
              {/* Labels Column */}
              <div className="space-y-12 pt-48">
                <div className="h-32"></div> {/* Spacer for images */}
                <div className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-2 border-b border-slate-100">Valuation</div>
                <div className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-2 border-b border-slate-100">Location</div>
                <div className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-2 border-b border-slate-100">Registry Status</div>
                <div className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-2 border-b border-slate-100">UPC ID</div>
                <div className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-2 border-b border-slate-100">Fraud Signal Score</div>
              </div>

              {/* Property Columns */}
              {selectedProperties.map(prop => (
                <div key={prop.id} className="space-y-12 relative animate-in slide-in-from-right-4">
                  <button 
                    onClick={() => onRemove(prop.id)}
                    className="absolute -top-4 -right-4 bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors z-30 shadow-md"
                  >
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                  
                  {/* Header Area */}
                  <div className="space-y-4">
                    <div className="h-48 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                      <img src={prop.images[0]} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-black text-slate-900 text-lg line-clamp-2 min-h-[3.5rem]">{prop.title}</h3>
                  </div>

                  {/* Pricing */}
                  <div className="py-2 border-b border-slate-100">
                    <span className="text-2xl font-black text-indigo-600">₦{prop.price.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">{prop.type}</span>
                  </div>

                  {/* Location */}
                  <div className="py-2 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-700 leading-tight">{prop.address}</p>
                  </div>

                  {/* Status */}
                  <div className="py-2 border-b border-slate-100">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700`}>{prop.status}</span>
                  </div>

                  {/* UPC */}
                  <div className="py-2 border-b border-slate-100">
                    <code className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50 px-2 py-1 rounded">{prop.upc}</code>
                  </div>

                  {/* Risk */}
                  <div className="py-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                       <div className={`w-3 h-3 rounded-full ${prop.fraudScore < 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                       <span className="font-black text-slate-800">{prop.fraudScore}% Safe</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-8 border-t border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-500 italic">All comparison data is synced directly with the TrustEstate Private Registry.</p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
