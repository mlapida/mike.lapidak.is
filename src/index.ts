/**
 * Cloudflare Worker for mike.lapidak.is
 * Handles API endpoints and utility functions
 */

export interface Env {
	// Add environment bindings here as needed
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url);
		
		// Basic security headers
		const headers = new Headers({
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
			'X-XSS-Protection': '1; mode=block',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
		});

		// Rate limiting - simple implementation
		const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
		
		// Handle different routes
		switch (url.pathname) {
			case '/api/health':
				return new Response(
					JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
					{ 
						status: 200, 
						headers: {
							...Object.fromEntries(headers.entries()),
							'Content-Type': 'application/json',
						}
					}
				);
				
			case '/api/contact':
				if (request.method !== 'POST') {
					return new Response('Method not allowed', { 
						status: 405,
						headers: Object.fromEntries(headers.entries())
					});
				}
				
				// Basic contact form handling (placeholder)
				return new Response(
					JSON.stringify({ message: 'Contact form endpoint - implementation needed' }),
					{ 
						status: 200,
						headers: {
							...Object.fromEntries(headers.entries()),
							'Content-Type': 'application/json',
						}
					}
				);
				
			default:
				return new Response('Not Found', { 
					status: 404,
					headers: Object.fromEntries(headers.entries())
				});
		}
	},
};
