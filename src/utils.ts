/**
 * Converts an IPv4 string to a 32-bit integer.
 */
export function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Converts a 32-bit integer to an IPv4 string.
 */
export function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join('.');
}

/**
 * Calculates the network range based on an IP and Subnet Mask.
 * Returns the first usable IP, last usable IP, and total usable hosts.
 */
export function getSubnetDetails(ip: string, mask: string) {
  const ipInt = ipToInt(ip);
  const maskInt = ipToInt(mask);

  // Network address = IP & Mask
  const networkInt = ipInt & maskInt;

  // Broadcast address = Network | (~Mask)
  // We use >>> 0 to ensure unsigned 32-bit integer behavior in JS
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;

  // First usable: Network + 1
  const firstUsableInt = networkInt + 1;

  // Last usable: Broadcast - 1
  const lastUsableInt = broadcastInt - 1;

  // Validate edge case (e.g. /32 or /31 where logic differs, but for standard networking:)
  const isValid = firstUsableInt <= lastUsableInt;

  return {
    networkAddress: intToIp(networkInt),
    broadcastAddress: intToIp(broadcastInt),
    firstUsable: isValid ? intToIp(firstUsableInt) : intToIp(networkInt),
    lastUsable: isValid ? intToIp(lastUsableInt) : intToIp(broadcastInt),
    firstUsableInt,
    lastUsableInt,
    hostCount: isValid ? lastUsableInt - firstUsableInt + 1 : 0
  };
}

/**
 * Checks if a target IP is within the subnet range defined by current IP and mask.
 */
export function isIpInSubnet(targetIp: string, currentIp: string, mask: string): boolean {
  const target = ipToInt(targetIp);
  const { firstUsableInt, lastUsableInt } = getSubnetDetails(currentIp, mask);
  return target >= firstUsableInt && target <= lastUsableInt;
}

/**
 * Generates an array of IP strings from start to end (inclusive).
 * Limit to avoid browser crash on huge ranges.
 */
export function generateIpRange(startIp: string, endIp: string, maxLimit = 255): string[] {
  const start = ipToInt(startIp);
  const end = ipToInt(endIp);
  const result: string[] = [];

  if (start > end) return [];

  // Safety limit
  const count = Math.min(end - start + 1, maxLimit);

  for (let i = 0; i < count; i++) {
    result.push(intToIp(start + i));
  }
  return result;
}

// Encryption Utils
async function getKeyMaterial(password: string) {
  const enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

export async function encryptData(data: object, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await getKeyMaterial(password);

  const key = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = enc.encode(JSON.stringify(data));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encodedData
  );

  const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
  buffer.set(new Uint8Array(salt), 0);
  buffer.set(new Uint8Array(iv), salt.byteLength);
  buffer.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

export async function decryptData(encryptedBase64: string, password: string): Promise<any> {
  const binary = atob(encryptedBase64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }

  const salt = buffer.slice(0, 16);
  const iv = buffer.slice(16, 28);
  const data = buffer.slice(28);

  const keyMaterial = await getKeyMaterial(password);

  // For decrypt usage
  const key = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}
