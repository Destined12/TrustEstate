
export enum PropertyStatus {
  AVAILABLE = 'Available',
  PENDING_CONFIRMATION = 'Pending Confirmation',
  SOLD = 'Sold',
  RENTED = 'Rented',
  LOCKED = 'Locked'
}

export enum UserRole {
  LANDLORD = 'Landlord/Owner',
  TENANT = 'Tenant/Buyer',
  ADMIN = 'Admin'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  nin?: string;
  permanentAddress?: string;
  physicalAddress?: string;
  role: UserRole;
  isKycVerified: boolean;
  kycStep: number; // 0: None, 1: ID, 2: Face, 3: Completed
  kycFailureReason?: string;
  isBanned?: boolean;
  suspensionUntil?: string; // ISO Date
  profileImage?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  fraudScore?: number;
}

export interface TenantFlag {
  tenantId: string;
  tenantName: string;
  reason: string;
  timestamp: string;
}

export interface InterestedTenant {
  id: string;
  name: string;
  email: string;
  timestamp: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  status: PropertyStatus;
  type: 'Sale' | 'Rent';
  propertyType?: string; // e.g., Flat, Duplex, Land, Warehouse, Other
  otherType?: string;
  units?: number;
  latitude?: number;
  longitude?: number;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  ownerKycStatus?: boolean;
  tenantId?: string; 
  images: string[];
  description: string;
  upc: string; 
  fraudScore: number;
  signals: FraudSignal[];
  documentHash?: string;
  tenantFlags?: TenantFlag[];
  interestedTenants?: InterestedTenant[];
  isShareConsentGiven?: boolean;
  groundingSources?: GroundingSource[];
  neighborhoodInsights?: string;
  lifecycleLog?: LifecycleEntry[];
}

export interface LifecycleEntry {
  status: PropertyStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface FraudSignal {
  id: string;
  type: 'IP' | 'Device' | 'Document' | 'Behavior' | 'PublicRegistry';
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  timestamp: string;
}

export interface FraudLog {
  id: string;
  propertyId: string;
  trigger: string;
  ip: string;
  deviceFingerprint: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName?: string;
  propertyId?: string;
  message: string;
  resolved: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  targetUserId?: string;
  targetPropertyId?: string;
  // Added targetId to support generic auditing of registry actions
  targetId?: string;
  action: string;
  metadata?: any;
  createdAt: string;
}
