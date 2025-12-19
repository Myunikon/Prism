/**
 * Protocol-Specific QR Code Parsers
 * Handles WiFi, vCard, meCard, Geo, SMS, Tel, Email, etc.
 */

/**
 * Detect and parse QR code protocol
 * @param {string} data - Raw QR code content
 * @returns {object} Parsed protocol data
 */
export function parseQRProtocol(data) {
    if (!data || typeof data !== 'string') {
        return { type: 'TEXT', raw: data };
    }

    const upperData = data.toUpperCase();

    // WiFi
    if (upperData.startsWith('WIFI:')) {
        return parseWiFi(data);
    }

    // vCard
    if (upperData.startsWith('BEGIN:VCARD')) {
        return parseVCard(data);
    }

    // meCard
    if (upperData.startsWith('MECARD:')) {
        return parseMeCard(data);
    }

    // Geo Location
    if (upperData.startsWith('GEO:')) {
        return parseGeo(data);
    }

    // SMS
    if (upperData.startsWith('SMS:') || upperData.startsWith('SMSTO:')) {
        return parseSMS(data);
    }

    // Phone
    if (upperData.startsWith('TEL:')) {
        return parseTel(data);
    }

    // Email
    if (upperData.startsWith('MAILTO:')) {
        return parseMailTo(data);
    }

    // Calendar Event
    if (upperData.startsWith('BEGIN:VEVENT')) {
        return parseVEvent(data);
    }

    return { type: 'TEXT', raw: data };
}

/**
 * Parse WiFi QR Code
 * Format: WIFI:T:WPA;S:NetworkName;P:Password;H:true;;
 */
function parseWiFi(data) {
    const result = {
        type: 'WIFI',
        icon: 'fa-wifi',
        color: 'neon-blue',
        fields: []
    };

    // Extract parameters using regex
    const typeMatch = data.match(/T:([^;]*)/i);
    const ssidMatch = data.match(/S:([^;]*)/i);
    const passMatch = data.match(/P:([^;]*)/i);
    const hiddenMatch = data.match(/H:([^;]*)/i);

    if (ssidMatch) result.fields.push({ label: 'SSID (Network Name)', value: ssidMatch[1], important: true });
    if (typeMatch) result.fields.push({ label: 'Security Type', value: typeMatch[1] || 'Open' });
    if (passMatch) result.fields.push({ label: 'Password', value: passMatch[1], sensitive: true });
    if (hiddenMatch) result.fields.push({ label: 'Hidden Network', value: hiddenMatch[1].toLowerCase() === 'true' ? 'Yes' : 'No' });

    return result;
}

/**
 * Parse vCard
 * Format: BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\n...
 */
function parseVCard(data) {
    const result = {
        type: 'VCARD',
        icon: 'fa-address-card',
        color: 'neon-purple',
        fields: []
    };

    const lines = data.split(/\r?\n/);
    const fieldMap = {
        'FN': 'Full Name',
        'N': 'Name (Last;First)',
        'TEL': 'Phone',
        'EMAIL': 'Email',
        'ORG': 'Organization',
        'TITLE': 'Title',
        'ADR': 'Address',
        'URL': 'Website',
        'NOTE': 'Note',
        'BDAY': 'Birthday'
    };

    lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        let key = line.substring(0, colonIndex).split(';')[0].toUpperCase();
        const value = line.substring(colonIndex + 1);

        if (fieldMap[key] && value) {
            result.fields.push({ 
                label: fieldMap[key], 
                value: value.replace(/;/g, ' '),
                important: key === 'FN' || key === 'TEL'
            });
        }
    });

    return result;
}

/**
 * Parse meCard
 * Format: MECARD:N:Doe,John;TEL:123456;EMAIL:john@example.com;;
 */
function parseMeCard(data) {
    const result = {
        type: 'MECARD',
        icon: 'fa-id-badge',
        color: 'neon-green',
        fields: []
    };

    const fieldMap = {
        'N': 'Name',
        'TEL': 'Phone',
        'EMAIL': 'Email',
        'ADR': 'Address',
        'URL': 'Website',
        'NOTE': 'Note',
        'BDAY': 'Birthday',
        'ORG': 'Organization'
    };

    // Remove MECARD: prefix and split by ;
    const content = data.substring(7);
    const parts = content.split(';');

    parts.forEach(part => {
        const colonIndex = part.indexOf(':');
        if (colonIndex === -1) return;

        const key = part.substring(0, colonIndex).toUpperCase();
        const value = part.substring(colonIndex + 1);

        if (fieldMap[key] && value) {
            result.fields.push({ 
                label: fieldMap[key], 
                value: value.replace(/,/g, ' '),
                important: key === 'N' || key === 'TEL'
            });
        }
    });

    return result;
}

/**
 * Parse Geo Location
 * Format: geo:40.7128,-74.0060 or geo:40.7128,-74.0060?q=New+York
 */
function parseGeo(data) {
    const result = {
        type: 'GEO',
        icon: 'fa-location-dot',
        color: 'red-500',
        fields: []
    };

    const coordMatch = data.match(/geo:([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/i);
    const queryMatch = data.match(/\?q=([^&]+)/i);

    if (coordMatch) {
        result.fields.push({ label: 'Latitude', value: coordMatch[1], important: true });
        result.fields.push({ label: 'Longitude', value: coordMatch[2], important: true });
        result.fields.push({ 
            label: 'Google Maps', 
            value: `https://maps.google.com/?q=${coordMatch[1]},${coordMatch[2]}`,
            isLink: true
        });
    }

    if (queryMatch) {
        result.fields.push({ label: 'Query', value: decodeURIComponent(queryMatch[1].replace(/\+/g, ' ')) });
    }

    return result;
}

/**
 * Parse SMS
 * Format: sms:+1234567890?body=Hello or smsto:+1234567890:Hello
 */
function parseSMS(data) {
    const result = {
        type: 'SMS',
        icon: 'fa-comment-sms',
        color: 'yellow-500',
        fields: []
    };

    const numMatch = data.match(/(?:sms|smsto):([^?:]+)/i);
    const bodyMatch = data.match(/(?:body=|:)([^&]+)$/i);

    if (numMatch) result.fields.push({ label: 'Phone Number', value: numMatch[1], important: true });
    if (bodyMatch) result.fields.push({ label: 'Message', value: decodeURIComponent(bodyMatch[1]) });

    return result;
}

/**
 * Parse Tel
 * Format: tel:+1234567890
 */
function parseTel(data) {
    return {
        type: 'TEL',
        icon: 'fa-phone',
        color: 'emerald-500',
        fields: [
            { label: 'Phone Number', value: data.substring(4), important: true }
        ]
    };
}

/**
 * Parse MailTo
 * Format: mailto:example@email.com?subject=Hello&body=World
 */
function parseMailTo(data) {
    const result = {
        type: 'EMAIL',
        icon: 'fa-envelope',
        color: 'cyan-500',
        fields: []
    };

    const emailMatch = data.match(/mailto:([^?]+)/i);
    const subjectMatch = data.match(/subject=([^&]+)/i);
    const bodyMatch = data.match(/body=([^&]+)/i);

    if (emailMatch) result.fields.push({ label: 'Email', value: emailMatch[1], important: true });
    if (subjectMatch) result.fields.push({ label: 'Subject', value: decodeURIComponent(subjectMatch[1]) });
    if (bodyMatch) result.fields.push({ label: 'Body', value: decodeURIComponent(bodyMatch[1]) });

    return result;
}

/**
 * Parse vEvent (Calendar)
 * Format: BEGIN:VEVENT\nSUMMARY:Meeting\nDTSTART:20231225T100000Z\n...
 */
function parseVEvent(data) {
    const result = {
        type: 'CALENDAR',
        icon: 'fa-calendar-days',
        color: 'orange-500',
        fields: []
    };

    const lines = data.split(/\r?\n/);
    const fieldMap = {
        'SUMMARY': 'Event Title',
        'DTSTART': 'Start Date',
        'DTEND': 'End Date',
        'LOCATION': 'Location',
        'DESCRIPTION': 'Description'
    };

    lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        let key = line.substring(0, colonIndex).split(';')[0].toUpperCase();
        let value = line.substring(colonIndex + 1);

        // Format dates nicely
        if ((key === 'DTSTART' || key === 'DTEND') && value) {
            try {
                const year = value.substring(0, 4);
                const month = value.substring(4, 6);
                const day = value.substring(6, 8);
                value = `${year}-${month}-${day}`;
            } catch (e) {}
        }

        if (fieldMap[key] && value) {
            result.fields.push({ 
                label: fieldMap[key], 
                value: value,
                important: key === 'SUMMARY'
            });
        }
    });

    return result;
}
