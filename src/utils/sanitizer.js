export const defangUrl = (input) => {
    let output = input;
    
    // http/https -> hxxp/hxxps
    output = output.replace(/^http/i, 'hxxp');
    
    // . -> [.] (avoid breaking common patterns if already defanged)
    // We try to target dots in domains/IPs
    output = output.replace(/\./g, '[.]');
    
    // :// -> [://] (optional, but standard defang usually just does protocol)
    
    return output;
};

export const refangUrl = (input) => {
    let output = input;
    
    // hxxp -> http
    output = output.replace(/^hxxp/i, 'http');
    
    // [.] -> .
    output = output.replace(/\[\.\]/g, '.');
    output = output.replace(/\(\.\)/g, '.');
    
    return output;
};
