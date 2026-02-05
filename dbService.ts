import { neon } from '@neondatabase/serverless';
import { UserProfile, Property, PropertyStatus, UserRole, Complaint, AuditLog, LifecycleEntry } from './types';

/**
 * TrustEstate Database Service
 */
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_nCJKfistPo15@ep-dark-boat-ah4yb37l.c-3.us-east-1.aws.neon.tech/Afrems?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

// Internal stable UUIDs for Seeding
const ADMIN_ID = 'a1b1b1b1-b1b1-4b11-81b1-b1b1b1b1b1b1';

export const initDb = async () => {
  try {
    // 1. Create Tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role TEXT CHECK (role IN ('ADMIN','LANDLORD','TENANT')),
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        phone TEXT,
        fraud_score INT DEFAULT 0,
        is_banned BOOLEAN DEFAULT FALSE,
        suspension_until TIMESTAMP,
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        kyc_verified BOOLEAN DEFAULT FALSE,
        face_verified BOOLEAN DEFAULT FALSE,
        nin_verified BOOLEAN DEFAULT FALSE,
        profile_image TEXT,
        kyc_step INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID REFERENCES users(id),
        title TEXT,
        address TEXT,
        price NUMERIC,
        status TEXT CHECK (status IN ('AVAILABLE','PENDING_CONFIRMATION','SOLD','RENTED','FLAGGED')),
        type TEXT,
        property_type TEXT,
        other_type TEXT,
        units INTEGER DEFAULT 1,
        latitude NUMERIC,
        longitude NUMERIC,
        upc TEXT UNIQUE,
        fraud_score INTEGER DEFAULT 0,
        description TEXT,
        images JSONB DEFAULT '[]',
        interested_tenants JSONB DEFAULT '[]',
        tenant_id UUID REFERENCES users(id),
        document_hash TEXT,
        flags INT DEFAULT 0,
        lifecycle_log JSONB DEFAULT '[]',
        neighborhood_insights TEXT,
        created_at TIMESTAMP DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        property_id UUID REFERENCES properties(id),
        message TEXT NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action TEXT NOT NULL,
        target_id TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT now()
      )
    `;

    // 2. MIGRATIONS: Add missing columns if they don't exist
    // Fix: Replaced addColumn helper with direct tagged template calls to fix TS error 
    // where a string was passed to the sql tagged template function.
    try { await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS lifecycle_log JSONB DEFAULT '[]'`; } catch(e) {}
    try { await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS interested_tenants JSONB DEFAULT '[]'`; } catch(e) {}
    try { await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type TEXT`; } catch(e) {}
    try { await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS units INTEGER DEFAULT 1`; } catch(e) {}
    try { await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude NUMERIC`; } catch(e) {}
    try { await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude NUMERIC`; } catch(e) {}
    try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_until TIMESTAMP`; } catch(e) {}

    // 3. Seed Admin (admin@trustestate.com / admin)
    await sql`
      INSERT INTO users (id, email, password, name, role, kyc_verified, kyc_step)
      VALUES (${ADMIN_ID}, 'admin@trustestate.com', 'admin', 'System Admin', 'ADMIN', true, 3)
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'ADMIN'
    `;
  } catch (e) {
    console.error("[DB] Init Error:", e);
  }
};

// --- CRUD & Actions ---

export const fetchUsers = async (): Promise<UserProfile[]> => {
  const r = await sql`SELECT * FROM users`;
  return r.map(u => ({
    id: u.id, name: u.name, email: u.email, password: u.password, phone: u.phone, 
    role: u.role as UserRole, isKycVerified: u.kyc_verified, kycStep: u.kyc_step, 
    isBanned: u.is_banned, suspensionUntil: u.suspension_until, profileImage: u.profile_image, 
    fraudScore: u.fraud_score
  }));
};

export const fetchProperties = async (): Promise<Property[]> => {
  const r = await sql`
    SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.kyc_verified as owner_kyc_status
    FROM properties p LEFT JOIN users u ON p.owner_id = u.id
    ORDER BY p.created_at DESC
  `;
  return r.map(p => ({
    id: p.id, title: p.title, address: p.address, price: Number(p.price), 
    status: p.status === 'FLAGGED' ? PropertyStatus.LOCKED : p.status as PropertyStatus, 
    type: p.type as 'Sale' | 'Rent', propertyType: p.property_type, otherType: p.other_type, 
    units: p.units, latitude: p.latitude ? Number(p.latitude) : undefined, 
    longitude: p.longitude ? Number(p.longitude) : undefined, ownerId: p.owner_id, 
    ownerName: p.owner_name, ownerPhone: p.owner_phone, ownerKycStatus: p.owner_kyc_status,
    upc: p.upc, fraudScore: p.fraud_score, description: p.description, 
    images: Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]'),
    interestedTenants: Array.isArray(p.interested_tenants) ? p.interested_tenants : JSON.parse(p.interested_tenants || '[]'),
    lifecycleLog: Array.isArray(p.lifecycle_log) ? p.lifecycle_log : JSON.parse(p.lifecycle_log || '[]'),
    neighborhoodInsights: p.neighborhood_insights, signals: []
  }));
};

export const saveProperty = async (p: Property) => {
  const statusDb = p.status === PropertyStatus.LOCKED ? 'FLAGGED' : p.status.toUpperCase().replace(' ', '_');
  const lifecycle = JSON.stringify([...(p.lifecycleLog || []), { status: p.status, timestamp: new Date().toISOString(), actor: 'Registry' }]);
  
  await sql`
    INSERT INTO properties (id, owner_id, title, address, price, status, type, property_type, units, latitude, longitude, upc, description, images, lifecycle_log)
    VALUES (${p.id}, ${p.ownerId}, ${p.title}, ${p.address}, ${p.price}, ${statusDb}, ${p.type}, ${p.propertyType}, ${p.units}, ${p.latitude}, ${p.longitude}, ${p.upc}, ${p.description}, ${JSON.stringify(p.images)}, ${lifecycle})
    ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, lifecycle_log = EXCLUDED.lifecycle_log
  `;
};

export const upsertUser = async (u: UserProfile) => {
  await sql`
    UPDATE users SET name = ${u.name}, role = ${u.role}, phone = ${u.phone}, 
    kyc_verified = ${u.isKycVerified}, kyc_step = ${u.kycStep}, profile_image = ${u.profileImage},
    is_banned = ${u.isBanned}, suspension_until = ${u.suspensionUntil}
    WHERE id = ${u.id}
  `;
};

export const createComplaint = async (userId: string, message: string, propertyId?: string) => {
  await sql`INSERT INTO complaints (user_id, message, property_id) VALUES (${userId}, ${message}, ${propertyId})`;
};

export const fetchComplaints = async (): Promise<Complaint[]> => {
  const r = await sql`SELECT c.*, u.name as user_name FROM complaints c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC`;
  return r.map(c => ({ id: c.id, userId: c.user_id, userName: c.user_name, propertyId: c.property_id, message: c.message, resolved: c.resolved, createdAt: c.created_at }));
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const r = await sql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`;
  return r.map(l => ({ id: l.id, action: l.action, targetId: l.target_id, metadata: l.metadata, createdAt: l.created_at }));
};

export const logAudit = async (action: string, targetId: string, metadata: any = {}) => {
  await sql`INSERT INTO audit_logs (action, target_id, metadata) VALUES (${action}, ${targetId}, ${JSON.stringify(metadata)})`;
};

export const resolveComplaint = async (complaintId: string) => {
  await sql`UPDATE complaints SET resolved = true WHERE id = ${complaintId}`;
};

export const forgotPassword = async (email: string) => {
  // Mock reset link
  return { success: true };
};
