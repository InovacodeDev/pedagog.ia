import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config.mjs';

describe('Security Headers', () => {
  it('should have security headers configured in next.config.mjs', async () => {
    // @ts-ignore
    const headers = await nextConfig.headers();
    const globalHeaders = headers.find((h: any) => h.source === '/(.*)');

    expect(globalHeaders).toBeDefined();

    const headerKeys = globalHeaders.headers.map((h: any) => h.key);

    expect(headerKeys).toContain('X-DNS-Prefetch-Control');
    expect(headerKeys).toContain('Strict-Transport-Security');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('Referrer-Policy');
    expect(headerKeys).toContain('Permissions-Policy');

    const permissionsPolicy = globalHeaders.headers.find((h: any) => h.key === 'Permissions-Policy');
    expect(permissionsPolicy.value).toContain('camera=(self)');
    expect(permissionsPolicy.value).toContain('microphone=(self)');
    expect(permissionsPolicy.value).toContain('geolocation=()');
  });
});
