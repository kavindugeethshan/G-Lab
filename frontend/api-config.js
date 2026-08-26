// G-Lab Shared API Configuration
(function () {
    function getApiUrl() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;

        // Local development
        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.')
        ) {
            return (hostname === 'localhost' || hostname === '127.0.0.1')
                ? 'http://localhost:3001'
                : `${protocol}//${hostname}:3001`;
        }

        // Production / Cloudflare Tunnel
        return 'https://trademarks-fifteen-imposed-savings.trycloudflare.com';
    }

    window.API_URL = getApiUrl();
})();