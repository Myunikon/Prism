/**
 * Network Intelligence Utilities
 */
import { store } from '../store/state.js';

export async function resolveHost(domain) {
    if (!domain) return null;

    // Remove protocol if present to get raw hostname
    const hostname = domain.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
    
    // Cloudflare DNS-over-HTTPS Endpoint
    const dohUrl = `https://cloudflare-dns.com/dns-query?name=${hostname}&type=A`;

    try {
        const response = await fetch(dohUrl, {
            headers: { 'Accept': 'application/dns-json' }
        });
        
        if (!response.ok) return null;

        const data = await response.json();
        
        if (data.Answer) {
            return {
                hostname: hostname,
                records: data.Answer.map(rec => ({
                    type: "A", // IPv4
                    data: rec.data,
                    ttl: rec.TTL
                }))
            };
        }
        return { hostname, records: [] };
    } catch (e) {
        console.warn("DNS Recon failed:", e);
        return null;
    }
}

/**
 * Check URL against VirusTotal via proxy
 */
export async function checkUrlWithVT(url) {
    const VT_PROXY_URL = store.config.vtProxyUrl;

    if (!VT_PROXY_URL) {
        return { error: 'VT_PROXY_URL not configured', fallback: true };
    }

    try {
        // First check if URL is already in VT database
        const reportResponse = await fetch(
            `${VT_PROXY_URL}/url-report?url=${encodeURIComponent(url)}`,
            { method: 'GET' }
        );
        
        const reportData = await reportResponse.json();
        
        if (reportData.found) {
            return {
                success: true,
                cached: true,
                ...reportData
            };
        }
        
        // URL not in database, submit for scanning
        const scanResponse = await fetch(`${VT_PROXY_URL}/scan-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        const scanData = await scanResponse.json();
        
        if (scanData.analysisId) {
            // Poll for results (max 30 seconds)
            return await pollAnalysis(scanData.analysisId, 6);
        }
        
        return { error: 'Failed to submit URL', data: scanData };
        
    } catch (e) {
        console.error("VT Proxy error:", e);
        return { error: e.message, fallback: true };
    }
}

/**
 * Poll VT analysis until complete
 */
async function pollAnalysis(analysisId, maxAttempts = 6) {
    const VT_PROXY_URL = store.config.vtProxyUrl;
    
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
        
        try {
            const response = await fetch(`${VT_PROXY_URL}/analysis/${analysisId}`);
            const data = await response.json();
            
            if (data.status === 'completed') {
                return {
                    success: true,
                    cached: false,
                    stats: data.stats,
                    malicious: data.malicious,
                    suspicious: data.suspicious,
                    harmless: data.harmless
                };
            }
        } catch (e) {
            console.warn("Poll attempt failed:", e);
        }
    }
    
    return { error: 'Analysis timeout', pending: true };
}

/**
 * Check if VT proxy is configured and healthy
 */
export async function checkVTProxyHealth() {
    const VT_PROXY_URL = store.config.vtProxyUrl;
    if (!VT_PROXY_URL) return { configured: false };
    
    try {
        const response = await fetch(`${VT_PROXY_URL}/health`);
        const data = await response.json();
        return { configured: true, ...data };
    } catch (e) {
        return { configured: true, healthy: false, error: e.message };
    }
}
