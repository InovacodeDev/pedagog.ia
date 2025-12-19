import { describe, it, expect } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';

describe('XSS Prevention', () => {
  it('should sanitize script tags', () => {
    const malicious = '<script>alert("xss")</script>Hello';
    const clean = DOMPurify.sanitize(malicious);
    expect(clean).toBe('Hello');
  });

  it('should sanitize onclick attributes', () => {
    const malicious = '<button onclick="alert(1)">Click me</button>';
    const clean = DOMPurify.sanitize(malicious);
    expect(clean).toBe('<button>Click me</button>');
  });

  it('should sanitize img onerror', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    const clean = DOMPurify.sanitize(malicious);
    expect(clean).toBe('<img src="x">');
  });

  it('should allow safe formatting tags', () => {
    const safe = '<b>Bold</b> <i>Italic</i> <p>Paragraph</p>';
    const clean = DOMPurify.sanitize(safe);
    expect(clean).toBe(safe);
  });
});
