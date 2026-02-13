export const parseUserAgent = (ua) => {
    // Simple regex-based parser
    const browsers = [
        { name: "Chrome", regex: /Chrome\/([0-9.]+)/ },
        { name: "Firefox", regex: /Firefox\/([0-9.]+)/ },
        { name: "Safari", regex: /Version\/([0-9.]+).*Safari/ },
        { name: "Edge", regex: /Edg\/([0-9.]+)/ },
        { name: "Opera", regex: /OPR\/([0-9.]+)/ },
        { name: "Android Browser", regex: /Android.*Br/ }
    ];

    const os = [
        { name: "Windows", regex: /Windows NT ([0-9.]+)/ },
        { name: "Mac OS", regex: /Mac OS X ([0-9._]+)/ },
        { name: "Android", regex: /Android ([0-9.]+)/ },
        { name: "iOS", regex: /iPhone OS ([0-9._]+)/ },
        { name: "Linux", regex: /Linux/ }
    ];

    let browserName = "Unknown Browser";
    let browserVer = "";

    for (let b of browsers) {
        const match = ua.match(b.regex);
        if (match) {
            browserName = b.name;
            browserVer = match[1] || "";
            break;
        }
    }

    let osName = "Unknown OS";
    let osVer = "";

    for (let o of os) {
        const match = ua.match(o.regex);
        if (match) {
            osName = o.name;
            osVer = match[1] ? match[1].replace(/_/g, '.') : "";
            break;
        }
    }

    // Checking for bots
    let isBot = /bot|crawl|slurp|spider/i.test(ua);

    return `Browser: ${browserName} ${browserVer}\nOS: ${osName} ${osVer}\nType: ${isBot ? 'Bot/Crawler' : 'User'}\n\nFull String:\n${ua}`;
};

export const calcSubnet = (input) => {
    // Expected format: IP/CIDR (e.g., 192.168.1.1/24)
    const [ip, cidrStr] = input.split('/');
    if (!ip || !cidrStr) return "Invalid format. Use IP/CIDR (e.g., 10.0.0.1/24)";

    const cidr = parseInt(cidrStr);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) return "Invalid CIDR (0-32)";

    const ipParts = ip.split('.').map(Number);
    if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
        return "Invalid IP address";
    }

    // IP to long
    const ipLong = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];

    // Mask
    const mask = 0xffffffff << (32 - cidr);

    // Network Address
    const netLong = ipLong & mask;

    // Broadcast Address
    const broadcastLong = netLong | (~mask);

    // Helper to IP string
    const longToIp = (l) => {
        return [(l >>> 24) & 255, (l >>> 16) & 255, (l >>> 8) & 255, l & 255].join('.');
    };

    const hosts = Math.pow(2, 32 - cidr) - 2;

    return `CIDR: ${cidr}\nNetmask: ${longToIp(mask)}\nNetwork IP: ${longToIp(netLong)}\nBroadcast: ${longToIp(broadcastLong)}\nHost Range: ${longToIp(netLong + 1)} - ${longToIp(broadcastLong - 1)}\nTotal Hosts: ${hosts > 0 ? hosts : 0}`;
};

// WebRTC Local IP Leak
export const getLocalIP = async () => {
    return new Promise((resolve) => {
        let resolved = false;
        const pc = new RTCPeerConnection({ iceServers: [] });
        // noop
        pc.createDataChannel("");

        pc.onicecandidate = (e) => {
            if (resolved) return;
            if (!e.candidate) {
                resolved = true;
                pc.close();
                resolve("No Local IP Found (Blocked?)");
                return;
            }
            const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
            const match = e.candidate.candidate.match(ipRegex);
            if (match) {
                resolved = true;
                resolve(match[1]);
                pc.close();
            }
        };

        pc.createOffer().then((sdp) => pc.setLocalDescription(sdp));

        // Timeout
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                pc.close();
                resolve("Timeout (WebRTC disabled?)");
            }
        }, 2000);
    });
};
