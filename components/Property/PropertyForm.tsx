
import React, { useState, useRef, useEffect } from 'react';
import { Property, PropertyStatus, UserProfile } from '../../types';
import { generatePropertyListingDescription } from '../../services/geminiService';
import { verifyDocumentOwnership } from '../../services/verificationService';
import { calculateHash } from '../../services/securityService';

interface PropertyFormProps {
  user: UserProfile;
  onSubmit: (property: Property) => void;
  onClose: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ user, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    type: 'Sale' as 'Sale' | 'Rent',
    propertyType: 'Flat',
    otherType: '',
    units: '1',
    latitude: '',
    longitude: '',
    images: [] as string[],
    description: '',
    deed: null as string | null,
    deedHash: '',
    isShareConsentGiven: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  // Address validation logic (backend integrated)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.address.length > 10) {
        setIsValidatingAddress(true);
        try {
          const encoded = encodeURIComponent(formData.address);
          setMapUrl(`https://maps.google.com/maps?q=${encoded}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
        } catch (e) {
          console.error("Address validation failed");
        } finally {
          setIsValidatingAddress(false);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData.address]);

  const handleDeedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsVerifying(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const hash = await calculateHash(base64);
      const isOwner = await verifyDocumentOwnership(base64, user.name);
      if (isOwner) {
        setFormData(prev => ({ ...prev, deed: base64, deedHash: hash }));
        alert("Ownership Document Verified: Name matches registered landlord profile.");
      } else {
        alert("CRITICAL ERROR: Name on document DOES NOT match your registered name. Property verification failed.");
      }
      setIsVerifying(false);
    };
    reader.readAsDataURL(file as Blob);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      reader.readAsDataURL(file as Blob);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length < 1 || !formData.deed) {
      alert("Please ensure images and a verified ownership document are uploaded.");
      return;
    }
    if (!formData.isShareConsentGiven) {
      alert("You must consent to sharing the document for third party verification.");
      return;
    }
    const upc = `UPC-NG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    onSubmit({
      id: `prop-${Date.now()}`,
      title: formData.title,
      address: formData.address,
      price: Number(formData.price),
      status: PropertyStatus.AVAILABLE,
      type: formData.type,
      propertyType: formData.propertyType,
      otherType: formData.propertyType === 'Other' ? formData.otherType : undefined,
      units: Number(formData.units),
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
      ownerId: user.id,
      images: formData.images,
      description: formData.description,
      upc,
      fraudScore: 0,
      signals: [],
      documentHash: formData.deedHash,
      isShareConsentGiven: formData.isShareConsentGiven
    });
  };

  const handleAiGen = async () => {
    if (!formData.title || !formData.address) {
      alert("Enter title and address for AI description.");
      return;
    }
    setIsGenerating(true);
    try {
      const details = `${formData.title} in ${formData.address}. Type: ${formData.propertyType}. Units: ${formData.units}. Price: N${formData.price}.`;
      const desc = await generatePropertyListingDescription(details);
      setFormData(p => ({ ...p, description: desc }));
    } catch (e) {
      alert("AI failed to generate description.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]">
        {/* Left Side: Map Preview */}
        <div className="hidden md:block w-1/3 bg-slate-100 relative">
          {mapUrl ? (
            <iframe 
              src={mapUrl} 
              className="w-full h-full border-none grayscale-[0.2] opacity-80" 
              allowFullScreen 
              loading="lazy"
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center space-y-4">
              <i className="fas fa-map-location-dot text-6xl opacity-20"></i>
              <p className="text-sm font-bold uppercase tracking-widest">Registry Map Node</p>
              <p className="text-[10px] uppercase tracking-widest font-black opacity-60">Geospatial link pending...</p>
            </div>
          )}
          {isValidatingAddress && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center">
              <i className="fas fa-circle-notch fa-spin text-indigo-600 text-3xl"></i>
            </div>
          )}
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-900 px-10 py-8 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Registry Asset Enrollment</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Authorized protocol entry</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/10 p-3 rounded-full transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Property Title</label>
                <input placeholder="e.g. Modern Lekki Duplex" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Listing Context</label>
                <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                  <option value="Sale">Sale Protocol</option>
                  <option value="Rent">Rental Protocol</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Property Classification</label>
                <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm" value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})}>
                  <option value="Flat">Flat / Apartment</option>
                  <option value="Duplex">Duplex / House</option>
                  <option value="Land">Land Parcel</option>
                  <option value="Warehouse">Commercial Warehouse</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Units</label>
                <input type="number" min="1" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold" value={formData.units} onChange={e => setFormData({...formData, units: e.target.value})} />
              </div>
            </div>

            {formData.propertyType === 'Other' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specify Classification</label>
                <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold" value={formData.otherType} onChange={e => setFormData({...formData, otherType: e.target.value})} />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registry Address</label>
              <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Latitude Node</label>
                <input placeholder="6.45..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-mono text-xs" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Longitude Node</label>
                <input placeholder="3.47..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-mono text-xs" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Valuation (₦)</label>
                <input required type="number" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-black text-indigo-600" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Document (C of O)</label>
                <label className={`w-full px-5 py-3.5 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-all ${formData.deed ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-black' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300 font-bold'}`}>
                  <input type="file" className="hidden" onChange={handleDeedUpload} />
                  <i className={`fas ${isVerifying ? 'fa-spinner fa-spin' : formData.deed ? 'fa-check-circle' : 'fa-file-shield'} mr-2`}></i>
                  <span className="text-[10px] uppercase tracking-widest">{isVerifying ? 'Analyzing Deed...' : formData.deed ? 'Deed Validated' : 'Upload Secure C of O'}</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registry Visuals</label>
              <div className="flex flex-wrap gap-3 mt-2">
                <label className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all text-slate-400">
                  <input type="file" multiple className="hidden" onChange={handleImageUpload} />
                  <i className="fas fa-plus mb-1"></i>
                  <span className="text-[8px] font-black uppercase tracking-tighter">Capture</span>
                </label>
                {formData.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} className="w-24 h-24 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                    <button type="button" onClick={() => setFormData(p => ({...p, images: p.images.filter((_, idx) => idx !== i)}))} className="absolute -top-2 -right-2 bg-rose-500 text-white w-6 h-6 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Description</label>
                <button type="button" onClick={handleAiGen} disabled={isGenerating} className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i> AI Optimize
                </button>
              </div>
              <textarea 
                required 
                rows={5}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 resize-none text-xs font-medium leading-relaxed" 
                placeholder="Asset characteristics, proximity metrics, security parameters..."
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                <input 
                  type="checkbox" 
                  id="consent"
                  className="mt-1 w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                  checked={formData.isShareConsentGiven}
                  onChange={e => setFormData({...formData, isShareConsentGiven: e.target.checked})}
                />
                <label htmlFor="consent" className="text-[10px] font-bold text-indigo-900 leading-relaxed uppercase tracking-wide cursor-pointer">
                  I authorize the release of these asset hashes for third-party integrity auditing.
                </label>
            </div>

            <div className="pt-6 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-5 border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-500 rounded-2xl hover:bg-slate-50 transition-all">Discard</button>
              <button type="submit" className="flex-1 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-black transition-all">Submit Enrollment</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
