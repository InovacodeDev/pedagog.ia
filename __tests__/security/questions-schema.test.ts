import { describe, it, expect } from 'vitest';
import { GenerateQuestionsSchema } from '../../server/actions/questions';

describe('GenerateQuestionsSchema Security', () => {
  it('should accept valid inputs with reasonable file sizes', () => {
    const validData = {
      quantity: 5,
      types: ['multiple_choice'],
      style: 'enem',
      discipline: 'matematica',
      subject: 'algebra',
      files: [
        {
          name: 'test.txt',
          type: 'text/plain',
          content: 'SGVsbG8gV29ybGQ=', // "Hello World" in base64
        },
      ],
    };

    const result = GenerateQuestionsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject file content that is too large (DoS prevention)', () => {
    // 6MB of base64 data (approx)
    // 5MB limit target.
    // 6 * 1024 * 1024 = 6,291,456 bytes.
    const largeContent = 'a'.repeat(7 * 1024 * 1024);

    const maliciousData = {
      quantity: 5,
      types: ['multiple_choice'],
      style: 'enem',
      discipline: 'matematica',
      subject: 'algebra',
      files: [
        {
          name: 'large_malicious_file.txt',
          type: 'text/plain',
          content: largeContent,
        },
      ],
    };

    const result = GenerateQuestionsSchema.safeParse(maliciousData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/muito grande/i);
    }
  });
});
