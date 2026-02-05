
import { neon } from '@neondatabase/serverless';
import { UserProfile, Property, PropertyStatus, UserRole } from '../types';

const DATABASE_URL = 'postgresql://neondb_owner:npg_nCJKfistPo15@ep-dark-boat-ah4yb37l.c-3.us-east-1.aws.neon.tech/Afrems?sslmode=require';
const sql = neon(DATABASE_URL);

export const SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Luxury 5-Bedroom Detached Duplex',
    address: 'Banana Island, Ikoyi, Lagos',
    price: 450000000,
    status: PropertyStatus.AVAILABLE,
    type: 'Sale',
    ownerId: 'user-landlord-1',
    ownerName: 'Chief Adebayo',
    ownerPhone: '+2348012345678',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Ultra-modern luxury living in Africa\'s most exclusive neighborhood. 24/7 security and private pool.',
    upc: 'UPC-LA-BI-001',
    fraudScore: 5,
    signals: []
  },
  {
    id: 'prop-2',
    title: 'Executive Prime Land - 1000sqm',
    address: 'Maitama Ext, Abuja (FCT)',
    price: 150000000,
    status: PropertyStatus.AVAILABLE,
    type: 'Sale',
    ownerId: 'user-landlord-1',
    ownerName: 'Chief Adebayo',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Perfectly level prime residential land in the heart of Abuja. C of O verified and ready for transfer.',
    upc: 'UPC-AB-MT-002',
    fraudScore: 2,
    signals: []
  },
  {
    id: 'prop-3',
    title: 'Corporate HQ Tower Office Space',
    address: 'Victoria Island, Lagos',
    price: 12000000,
    status: PropertyStatus.AVAILABLE,
    type: 'Rent',
    ownerId: 'user-landlord-2',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'High-end office space in a prime commercial hub. Full power backup and 24/7 technical support.',
    upc: 'UPC-LA-VI-003',
    fraudScore: 8,
    signals: []
  }
];

export const initDb = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        phone TEXT,
        nin TEXT,
        role TEXT NOT NULL,
        is_kyc_verified BOOLEAN DEFAULT FALSE,
        kyc_step INTEGER DEFAULT 0,
        is_banned BOOLEAN DEFAULT FALSE,
        suspension_until TEXT,
        profile_image TEXT
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        address TEXT NOT NULL,
        price BIGINT NOT NULL,
        status TEXT NOT NULL,
        type TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        upc TEXT UNIQUE NOT NULL,
        fraud_score INTEGER DEFAULT 0,
        document_hash TEXT,
        tenant_id TEXT,
        description TEXT,
        images JSONB DEFAULT '[]',
        interested_tenants JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    const usersCount = await sql`SELECT COUNT(*) FROM users`;
    if (parseInt(usersCount[0].count) === 0) {
      const admin = { id: 'admin-1', name: 'System Admin', email: 'admin@trustestate.ng', role: UserRole.ADMIN, is_kyc_verified: true, kyc_step: 3 };
      await sql`INSERT INTO users (id, name, email, role, is_kyc_verified, kyc_step) VALUES (${admin.id}, ${admin.name}, ${admin.email}, ${admin.role}, ${admin.is_kyc_verified}, ${admin.kyc_step})`;
    }
    const propsCount = await sql`SELECT COUNT(*) FROM properties`;
    if (parseInt(propsCount[0].count) === 0) {
      for (const p of SAMPLE_PROPERTIES) {
        await sql`INSERT INTO properties (id, title, address, price, status, type, owner_id, upc, fraud_score, description, images) VALUES (${p.id}, ${p.title}, ${p.address}, ${p.price}, ${p.status}, ${p.type}, ${p.ownerId}, ${p.upc}, ${p.fraudScore}, ${p.description}, ${JSON.stringify(p.images)})`;
      }
    }
  } catch (e) {
    console.error("[DB] Init failed:", e);
  }
};

export const fetchUsers = async (): Promise<UserProfile[]> => {
  const result = await sql`SELECT * FROM users`;
  return result.map(r => ({
    id: r.id, name: r.name, email: r.email, phone: r.phone, nin: r.nin, role: r.role as UserRole, isKycVerified: r.is_kyc_verified, kycStep: r.kyc_step, isBanned: r.is_banned, profileImage: r.profile_image
  }));
};

export const upsertUser = async (user: UserProfile) => {
  await sql`
    INSERT INTO users (id, name, email, phone, nin, role, is_kyc_verified, kyc_step, profile_image)
    VALUES (${user.id}, ${user.name}, ${user.email}, ${user.phone}, ${user.nin}, ${user.role}, ${user.isKycVerified}, ${user.kycStep}, ${user.profileImage || null})
    ON CONFLICT (email) DO UPDATE SET is_kyc_verified = EXCLUDED.is_kyc_verified, kyc_step = EXCLUDED.kyc_step, profile_image = EXCLUDED.profile_image
  `;
};

export const fetchProperties = async (): Promise<Property[]> => {
  const result = await sql`SELECT * FROM properties ORDER BY created_at DESC`;
  return result.map(r => ({
    id: r.id, title: r.title, address: r.address, price: Number(r.price), status: r.status as PropertyStatus, type: r.type, ownerId: r.owner_id, upc: r.upc, fraudScore: r.fraud_score, documentHash: r.document_hash, tenantId: r.tenant_id, description: r.description,
    images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
    interestedTenants: typeof r.interested_tenants === 'string' ? JSON.parse(r.interested_tenants) : r.interested_tenants,
    signals: []
  }));
};

export const saveProperty = async (p: Property) => {
  await sql`
    INSERT INTO properties (id, title, address, price, status, type, owner_id, upc, fraud_score, document_hash, tenant_id, description, images, interested_tenants)
    VALUES (${p.id}, ${p.title}, ${p.address}, ${p.price}, ${p.status}, ${p.type}, ${p.ownerId}, ${p.upc}, ${p.fraudScore}, ${p.documentHash || null}, ${p.tenantId || null}, ${p.description}, ${JSON.stringify(p.images)}, ${JSON.stringify(p.interestedTenants || [])})
    ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, tenant_id = EXCLUDED.tenant_id, interested_tenants = EXCLUDED.interested_tenants
  `;
};

export const deleteUser = async (id: string) => { await sql`DELETE FROM users WHERE id = ${id}`; };
export const updateUserPassword = async (id: string, pass: string) => { await sql`UPDATE users SET password = ${pass} WHERE id = ${id}`; };
