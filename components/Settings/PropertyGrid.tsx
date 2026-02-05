
import React from 'react';
import { Property, PropertyStatus, UserProfile, UserRole } from '../../types';

interface PropertyGridProps {
  properties: Property[];
  user: UserProfile;
  onStatusChange: (id: string, newStatus: PropertyStatus) => void;
  onVerify: (id: string) => void;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties, user, onStatusChange, onVerify }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(prop => (
        <PropertyCard 
          key={prop.id} 
          property={prop} 
          user={user} 
          onStatusChange={onStatusChange} 
          onVerify={onVerify}
        />
      ))}
    </div>
  );
};

const PropertyCard: React.FC<{ 
  property: Property; 
  user: UserProfile; 
  onStatusChange: (id: string, newStatus: PropertyStatus) => void;
  onVerify: (id: string) => void;
}> = ({ property, user, onStatusChange, onVerify }) => {
  
  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.AVAILABLE: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case PropertyStatus.PENDING_CONFIRMATION: return 'bg-amber-100 text-amber-700 border-amber-200';
      case PropertyStatus.SOLD: return 'bg-slate-100 text-slate-700 border-slate-200';
      case PropertyStatus.RENTED: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case PropertyStatus.LOCKED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const isGuest = user.id === 'guest';
  const isOwner = !isGuest && property.ownerId === user.id;
  const isPendingTenant = !isGuest && property.status === PropertyStatus.PENDING_CONFIRMATION && user.role === UserRole.TENANT;

  // Use the first image in the array, or a placeholder if empty
  const displayImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://via.placeholder.com/800x600?text=No+Image+Available';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-indigo-200 ${property.status === PropertyStatus.LOCKED ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="relative h-48 overflow-hidden">
        <img 
          src={displayImage} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-800">
            {property.type}
          </div>
        </div>
        {property.images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-white">
            <i className="fas fa-images mr-1"></i> {property.images.length}
          </div>
        )}
        {property.fraudScore > 50 && (
          <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg animate-pulse">
              <i className="fas fa-warning mr-2"></i>FLAGGED
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{property.title}</h3>
          <span className="text-indigo-600 font-extrabold">₦{property.price.toLocaleString()}</span>
        </div>
        <p className="text-slate-500 text-sm mb-4 flex items-center">
          <i className="fas fa-location-dot mr-2 text-indigo-400"></i>
          {property.address}
        </p>
        
        <div className="flex items-center space-x-4 pt-4 border-t border-slate-100 mb-4">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Property UPC</div>
            <div className="text-xs font-mono font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 overflow-hidden text-ellipsis whitespace-nowrap">{property.upc}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk</div>
            <div className={`text-xs font-bold ${property.fraudScore < 20 ? 'text-emerald-600' : property.fraudScore < 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {property.fraudScore}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {isOwner && property.status === PropertyStatus.AVAILABLE && (
            <button 
              onClick={() => onStatusChange(property.id, PropertyStatus.PENDING_CONFIRMATION)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-100 transition-all"
            >
              Initiate Close Deal
            </button>
          )}

          {isPendingTenant && (
            <div className="space-y-2">
              <div className="text-[10px] text-amber-600 font-bold text-center bg-amber-50 py-1 rounded">PENDING YOUR VERIFICATION</div>
              <button 
                onClick={() => onVerify(property.id)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-100 transition-all"
              >
                Confirm Transaction
              </button>
            </div>
          )}

          {property.status === PropertyStatus.LOCKED && (
            <div className="p-3 bg-red-50 rounded-lg flex items-center space-x-3">
              <i className="fas fa-lock text-red-500"></i>
              <span className="text-xs font-medium text-red-700 leading-tight">Property locked due to high fraud score.</span>
            </div>
          )}

          {((!isOwner && !isPendingTenant) || isGuest) && property.status === PropertyStatus.AVAILABLE && (
            <button className="w-full py-2 border-2 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-600 rounded-lg text-sm font-bold transition-all">
              {isGuest ? 'Login to Inquire' : 'View Details'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyGrid;
