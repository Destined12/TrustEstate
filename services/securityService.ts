
/**
 * Security Service for TrustEstate
 * Handles IP tracking, VPN detection, Document Hashing and UPC management
 */

interface IpEntry {
  ip: string;
  timestamp: number;
}

interface UserSecurityLog {
  userId: string;
  ipHistory: IpEntry[];
  lastFingerprint: string;
}

const STORAGE_KEY_IP_LOGS = 'trustestate_security_logs';
const STORAGE_KEY_UPC_REGISTRY = 'trustestate_upc_registry';
const STORAGE_KEY_DOC_REGISTRY = 'trustestate_doc_hashes';

/**
 * Generates a device fingerprint.
 */
export const getDeviceFingerprint = (): string => {
  const nav = window.navigator;
  const screen = window.screen;
  let uid = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage
  ].join('###');
  return btoa(uid).substring(0, 32);
};

/**
 * Calculates a SHA-256 hash of a base64 string.
 */
export const calculateHash = async (base64: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(base64);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Heuristic VPN Detection. 
 */
const checkVpnStatus = async (ip: string): Promise<boolean> => {
  const proxyIndicators = ['185.', '45.', '193.', '103.']; 
  return proxyIndicators.some(indicator => ip.startsWith(indicator));
};

/**
 * Captures and logs security signals for a user action.
 */
export const logSecuritySignals = async (userId: string): Promise<{ 
  ip: string; 
  isNewIpIn24h: boolean; 
  isVpn: boolean; 
  fingerprintChanged: boolean 
}> => {
  let currentIp = '127.0.0.1';
  
  // Robust IP fetching with multiple fallbacks
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      currentIp = data.ip;
    } else {
      throw new Error("Ipify failed");
    }
  } catch (e) {
    try {
      const res2 = await fetch('https://icanhazip.com');
      if (res2.ok) {
        currentIp = (await res2.text()).trim();
      }
    } catch (e2) {
      console.warn("Unable to resolve external IP. Using local proxy address.");
    }
  }

  const fingerprint = getDeviceFingerprint();
  const logsJson = localStorage.getItem(STORAGE_KEY_IP_LOGS);
  let allLogs: UserSecurityLog[] = logsJson ? JSON.parse(logsJson) : [];
  
  let userLog = allLogs.find(l => l.userId === userId);
  if (!userLog) {
    userLog = { userId, ipHistory: [], lastFingerprint: fingerprint };
    allLogs.push(userLog);
  }

  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  // IP History Logic
  const recentIps = userLog.ipHistory.filter(h => h.timestamp > twentyFourHoursAgo);
  const isNewIpIn24h = recentIps.length > 0 && recentIps[recentIps.length - 1].ip !== currentIp;
  
  // VPN Logic
  const isVpn = await checkVpnStatus(currentIp);

  // Fingerprint Logic
  const fingerprintChanged = userLog.lastFingerprint !== fingerprint;

  // Update Logs
  userLog.ipHistory.push({ ip: currentIp, timestamp: now });
  userLog.lastFingerprint = fingerprint;
  localStorage.setItem(STORAGE_KEY_IP_LOGS, JSON.stringify(allLogs));

  return { ip: currentIp, isNewIpIn24h, isVpn, fingerprintChanged };
};

/**
 * Generates a Unique Property Code (UPC).
 */
export const generateUPC = (address: string): string => {
  const clean = address.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `UPC-${clean}-${random}`;
};

/**
 * Prevents duplicates by checking hash and UPC collisions.
 */
export const validateListingIntegrity = (upc: string, hash?: string): { 
  isDuplicate: boolean; 
  reason?: string 
} => {
  if (hash) {
    const docRegistryJson = localStorage.getItem(STORAGE_KEY_DOC_REGISTRY);
    const docRegistry: string[] = docRegistryJson ? JSON.parse(docRegistryJson) : [];
    if (docRegistry.includes(hash)) {
      return { isDuplicate: true, reason: 'Property document hash already registered.' };
    }
  }

  const upcRegistryJson = localStorage.getItem(STORAGE_KEY_UPC_REGISTRY);
  const upcRegistry: string[] = upcRegistryJson ? JSON.parse(upcRegistryJson) : [];
  if (upcRegistry.includes(upc)) {
    return { isDuplicate: true, reason: 'UPC collision detected.' };
  }

  return { isDuplicate: false };
};

/**
 * Persists new security data for a listing.
 */
export const registerPropertySecurity = (upc: string, hash?: string) => {
  const upcRegistry = JSON.parse(localStorage.getItem(STORAGE_KEY_UPC_REGISTRY) || '[]');
  upcRegistry.push(upc);
  localStorage.setItem(STORAGE_KEY_UPC_REGISTRY, JSON.stringify(upcRegistry));

  if (hash) {
    const docRegistry = JSON.parse(localStorage.getItem(STORAGE_KEY_DOC_REGISTRY) || '[]');
    docRegistry.push(hash);
    localStorage.setItem(STORAGE_KEY_DOC_REGISTRY, JSON.stringify(docRegistry));
  }
};
