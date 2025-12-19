/**
 * Forensics Analysis Utilities
 */

import { store } from '../store/state.js'; // Optional if needed for config

export function calculateEntropy(str) {
  if (!str) return 0;
  const len = str.length;
  const frequencies = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy.toFixed(2);
}

export function getHexdump(str) {
  if (!str) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  // Limit hexdump length for performance
  const slice = data.slice(0, 128);
  let result = [];

  for (let i = 0; i < slice.length; i += 16) {
    const chunk = slice.slice(i, i + 16);
    let hexPart = "";
    let textPart = "";
    chunk.forEach((byte) => {
      hexPart += byte.toString(16).padStart(2, "0") + " ";
      textPart += byte >= 32 && byte < 127 ? String.fromCharCode(byte) : ".";
    });
    result.push(
      `${i.toString(16).padStart(4, "0")}  ${hexPart.padEnd(48, " ")}  |${textPart}|`
    );
  }
  return result.join("\n");
}

export function parseUrlDetails(urlStr) {
    try {
        const url = new URL(urlStr);
        const params = [];
        url.searchParams.forEach((val, key) => {
            params.push({ id: 'P', name: key, val: val });
        });

        return {
            isUrl: true,
            structure: [
                { id: 'PROT', name: 'Protocol', val: url.protocol },
                { id: 'HOST', name: 'Hostname', val: url.hostname },
                { id: 'PORT', name: 'Port', val: url.port || (url.protocol==='https:'?'443':'80') },
                { id: 'PATH', name: 'Pathname', val: url.pathname },
                { id: 'HASH', name: 'Fragment', val: url.hash || 'N/A' },
                { id: 'ARGS', name: 'Query Params', val: `${params.length} found`, children: params }
            ]
        };
    } catch (e) {
        return { isUrl: false, structure: [] };
    }
}

export function analyzeHeuristics(data) {
    let score = 0;
    let flags = [];
    const lower = data.toLowerCase();

    // 1. Critical Schemes
    if (lower.startsWith("javascript:")) {
        score += 10;
        flags.push("XSS VECTOR (javascript: URI)");
    }
    if (lower.startsWith("data:")) {
        score += 5;
        flags.push("EMBEDDED DATA (Phishing Risk)");
    }
    if (lower.startsWith("http://")) {
        score += 3;
        flags.push("INSECURE PROTOCOL (HTTP)");
    }

    // 2. IP Address Direct Access
    const ipRegex = /(http[s]?:\/\/)?(?:[0-9]{1,3}\.){3}[0-9]{1,3}/;
    if (ipRegex.test(lower) && !lower.includes("192.168") && !lower.includes("127.0.0.1")) {
        score += 4;
        flags.push("DIRECT IP ACCESS (Suspicious)");
    }

    // 3. Dangerous Keywords
    const suspicious = [
        "cmd", "powershell", "install", "apk", "bank", "login", "verify", 
        "bonus", "free", "claim", "update", "security-check", "confirm", "wallet"
    ];
    suspicious.forEach(w => {
        if (lower.includes(w)) {
            score += 2;
            flags.push(`SUSPICIOUS KEYWORD: '${w}'`);
        }
    });

    // 4. File Extensions
    const dangerousExt = [".apk", ".exe", ".scr", ".bat", ".sh", ".jar", ".vbs"];
    if (dangerousExt.some(ext => lower.includes(ext))) {
        score += 6;
        flags.push("EXECUTABLE FILE TARGET");
    }

    // 5. URL Obfuscation
    if ((data.match(/%/g) || []).length > 5) {
        score += 3;
        flags.push("HIGH OBFUSCATION (Multiple Encoding)");
    }

    // 6. Shortlink Detectors
    const shorteners = ["bit.ly", "goo.gl", "tinyurl", "t.co", "is.gd", "wa.me", "adf.ly"];
    if (shorteners.some(s => lower.includes(s))) {
        score += 2;
        flags.push("URL SHORTENER (Hidden Destination)");
    }

    // 7. Homograph Attack (Simple check for non-ascii mixed with http)
    if (lower.startsWith("http") && /[^\x00-\x7F]/.test(data)) {
        score += 5;
        flags.push("POSSIBLE HOMOGRAPH ATTACK (IDN)");
    }

    return { score, flags };
}

export async function calculateHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// extractExif removed as it is now handled by src/utils/exif.js using exifr
