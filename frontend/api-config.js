// G-Lab Shared API Configuration
(function () {
    function getApiUrl() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;

        // Local development environment (localhost, 127.0.0.1, or local IP like 192.168.x.x)
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
            return (hostname === 'localhost' || hostname === '127.0.0.1') 
                ? 'http://localhost:3001' 
                : `${protocol}//${hostname}:3001`;
        }

        // Online production environment (Cloudflare Tunnel, trycloudflare.com, HTTPS, standard ports)
        if (hostname.includes('trycloudflare.com') || protocol === 'https:' || !port || port === '80' || port === '443') {
            return window.location.origin;
        }

        // Fallback for any other origin
        return window.location.origin;
    }

    window.API_URL = getApiUrl();
})();
