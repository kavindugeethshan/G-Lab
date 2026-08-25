// G-Lab Shared API Configuration
(function () {
    function getApiUrl() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;

        // Local development environment
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }

        // If explicitly running on port 3001 over local network IP
        if (port === '3001') {
            return `${protocol}//${hostname}:3001`;
        }

        // Online production environment (Cloudflare Tunnel, custom domains, standard ports)
        if (hostname.includes('trycloudflare.com') || protocol === 'https:' || !port || port === '80' || port === '443') {
            return window.location.origin;
        }

        // Fallback for any other custom origin
        return `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }

    window.API_URL = getApiUrl();
})();
