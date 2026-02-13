import MD5 from 'crypto-js/md5';
import SHA1 from 'crypto-js/sha1';
import SHA256 from 'crypto-js/sha256';
import HmacSHA256 from 'crypto-js/hmac-sha256';

// Import new modular utilities
import { xorBruteForce, caesarBruteForce } from '../utils/cipher.js';
import { defangUrl, refangUrl } from '../utils/sanitizer.js';
import {
    parseMultiFormatTime,
    toUnix,
    toISO,
    toUTC,
} from "../utils/timeIntel.js";
import { parseUserAgent, calcSubnet, getLocalIP } from '../utils/networkIntel.js';
import { lookupOui } from '../utils/oui.js';
import { buildDorks, searchUsername } from "../utils/osint.js";

export function useTools() {
    const tools = [
        // Encoding/Decoding
        { id: 'b64_decode', name: 'Base64 Decode', icon: 'fa-unlock', color: 'from-blue-500 to-cyan-500', category: 'decode' },
        { id: 'b64_encode', name: 'Base64 Encode', icon: 'fa-lock', color: 'from-cyan-500 to-blue-500', category: 'encode' },
        { id: 'url_decode', name: 'URL Decode', icon: 'fa-link-slash', color: 'from-green-500 to-emerald-500', category: 'decode' },
        { id: 'url_encode', name: 'URL Encode', icon: 'fa-link', color: 'from-emerald-500 to-green-500', category: 'encode' },
        { id: 'hex_decode', name: 'Hex to Text', icon: 'fa-arrow-right-from-bracket', color: 'from-violet-500 to-purple-500', category: 'decode' },
        { id: 'jwt_decode', name: 'JWT Decode', icon: 'fa-id-card', color: 'from-fuchsia-500 to-pink-500', category: 'decode' },

        // Ciphers / Security (Refactored)
        { id: 'xor_brute', name: 'XOR Brute', icon: 'fa-user-secret', color: 'from-red-500 to-rose-600', category: 'cipher' }, // NEW
        { id: 'caesar_brute', name: 'Caesar Brute', icon: 'fa-rotate', color: 'from-amber-500 to-orange-500', category: 'cipher' }, // Upgraded ROT13
        { id: 'defang_url', name: 'Defang URL', icon: 'fa-shield-virus', color: 'from-emerald-500 to-green-600', category: 'security' }, // NEW
        { id: 'refang_url', name: 'Refang URL', icon: 'fa-shield-halved', color: 'from-green-500 to-teal-500', category: 'security' }, // NEW

        // Hash
        { id: 'hash_md5', name: 'MD5 Hash', icon: 'fa-fingerprint', color: 'from-pink-500 to-rose-500', category: 'hash' },
        { id: 'hash_sha1', name: 'SHA-1 Hash', icon: 'fa-fingerprint', color: 'from-rose-500 to-red-500', category: 'hash' },
        { id: 'hash_sha256', name: 'SHA-256 Hash', icon: 'fa-fingerprint', color: 'from-red-500 to-pink-500', category: 'hash' },
        { id: 'hmac_sha256', name: 'HMAC SHA256', icon: 'fa-key', color: 'from-orange-500 to-red-500', category: 'hash' },

        // Extractors
        { id: 'ext_email', name: 'Extract Emails', icon: 'fa-envelope', color: 'from-sky-500 to-blue-500', category: 'extract' },
        { id: 'ext_ip', name: 'Extract IPs', icon: 'fa-server', color: 'from-teal-500 to-cyan-500', category: 'extract' },
        { id: 'ext_url', name: 'Extract URLs', icon: 'fa-globe', color: 'from-indigo-500 to-blue-500', category: 'extract' },

        // Network Intel (NEW)
        { id: 'ua_parser', name: 'UA Parser', icon: 'fa-robot', color: 'from-indigo-500 to-violet-500', category: 'network' },
        {
            id: "subnet_calc",
            name: "Subnet Calc",
            category: "network",
            icon: "fa-network-wired",
            color: "from-gray-500 to-slate-500",
        },
        {
            id: "mac_oui",
            name: "MAC Vendor",
            category: "network",
            icon: "fa-barcode",
            color: "from-teal-500 to-emerald-500",
            placeholder: "Enter MAC Address...",
        },
        {
            id: "local_ip",
            name: "Local IP Leak",
            category: "network",
            icon: "fa-wifi",
            color: "from-red-500 to-orange-500",
            placeholder: "Click Run to detect...",
        },
        // OSINT
        {
            id: "google_dork",
            name: "Google Dorks",
            category: "osint",
            icon: "fa-magnifying-glass-arrow-right",
            color: "from-blue-600 to-blue-400",
            placeholder: "Enter domain (site:example.com) or keywords...",
        },
        {
            id: "user_recon",
            name: "Username Recon",
            category: "osint",
            icon: "fa-user-secret",
            color: "from-indigo-500 to-purple-500",
            placeholder: "Enter username to track...",
        },



        // Formatters
        { id: 'json_format', name: 'Format JSON', icon: 'fa-code', color: 'from-yellow-500 to-amber-500', category: 'format' },
        { id: 'slugify', name: 'Slugify', icon: 'fa-link', color: 'from-lime-500 to-green-500', category: 'format' },

        // Utils (Upgraded)
        { id: 'time_multi', name: 'Time Intel', icon: 'fa-clock', color: 'from-blue-400 to-indigo-500', category: 'util' }, // Upgraded Unix Time
        { id: 'uuid_gen', name: 'UUID Gen', icon: 'fa-fingerprint', color: 'from-purple-400 to-purple-600', category: 'util' },
        { id: 'count_chars', name: 'Count Chars', icon: 'fa-calculator', color: 'from-gray-500 to-slate-500', category: 'util' },
    ];

    const strategies = {
        // Encoders/Decoders
        b64_decode: (input) => { try { return atob(input); } catch (e) { return 'Invalid Base64'; } },
        b64_encode: (input) => btoa(unescape(encodeURIComponent(input))),
        url_decode: (input) => decodeURIComponent(input),
        url_encode: (input) => encodeURIComponent(input),
        hex_decode: (input) => input.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || 'Invalid hex',
        jwt_decode: (input) => {
            try {
                const parts = input.split('.');
                if (parts.length !== 3) return 'Invalid JWT format';
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                return JSON.stringify(payload, null, 2);
            } catch (e) { return 'Invalid JWT Payload'; }
        },

        // Ciphers / Security
        xor_brute: (input) => xorBruteForce(input),
        caesar_brute: (input) => caesarBruteForce(input),
        defang_url: (input) => defangUrl(input),
        refang_url: (input) => refangUrl(input),

        // Hashes
        hash_md5: (input) => MD5(input).toString(),
        hash_sha1: (input) => SHA1(input).toString(),
        hash_sha256: (input) => SHA256(input).toString(),
        hmac_sha256: (input) => {
            const lines = input.split('\n');
            if (lines.length < 2) return "Usage:\nLine 1: Secret Key\nLine 2+: Message to hash";
            const key = lines[0];
            const msg = lines.slice(1).join('\n');
            return HmacSHA256(msg, key).toString();
        },

        // Extractors
        ext_email: (input) => {
            const matches = input.match(/[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            return matches ? `Found ${matches.length} email(s):\n\n${[...new Set(matches)].join('\n')}` : 'No emails found';
        },
        ext_ip: (input) => {
            const matches = input.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g);
            return matches ? `Found ${matches.length} IP(s):\n\n${[...new Set(matches)].join('\n')}` : 'No IPs found';
        },
        ext_url: (input) => {
            const matches = input.match(/https?:\/\/[^\s<>"{}|\\^\[\]`]+/g);
            return matches ? `Found ${matches.length} URL(s):\n\n${[...new Set(matches)].join('\n')}` : 'No URLs found';
        },

        // Network
        ua_parser: (input) => parseUserAgent(input),
        subnet_calc: (input) => calcSubnet(input),
        mac_oui: (input) => lookupOui(input),
        local_ip: async () => await getLocalIP(),

        // OSINT
        google_dork: (input) => buildDorks(input),
        user_recon: (input) => searchUsername(input),

        // Formatters
        json_format: (input) => { try { return JSON.stringify(JSON.parse(input), null, 2); } catch (e) { return 'Invalid JSON'; } },
        slugify: (input) => input.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),

        // Utils
        time_multi: (input) => parseMultiFormatTime(input),
        uuid_gen: () => crypto.randomUUID(),
        count_chars: (input) => {
            return `Characters: ${input.length}\nWords: ${input.trim().split(/\s+/).filter(Boolean).length}\nLines: ${input.split('\n').length}\nBytes: ${new Blob([input]).size}`;
        }
    };

    const runTool = async (toolId, input) => {
        if (!input && !['uuid_gen', 'time_multi', 'local_ip'].includes(toolId)) return '';

        try {
            const strategy = strategies[toolId];
            if (!strategy) throw new Error('Tool not implemented');

            return await strategy(input);
        } catch (e) {
            return `Error: ${e.message}`;
        }
    };

    return {
        tools,
        runTool
    };
}
