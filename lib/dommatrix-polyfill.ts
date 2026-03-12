export default function polyfillDOMMatrix(): void {
  const globalObj = global as unknown as Record<string, unknown>;

  if (typeof global !== 'undefined' && typeof globalObj.DOMMatrix === 'undefined') {
    globalObj.DOMMatrix = class DOMMatrix {
      a: number = 1;
      b: number = 0;
      c: number = 0;
      d: number = 1;
      e: number = 0;
      f: number = 0;
      m11: number = 1;
      m12: number = 0;
      m13: number = 0;
      m14: number = 0;
      m21: number = 0;
      m22: number = 1;
      m23: number = 0;
      m24: number = 0;
      m31: number = 0;
      m32: number = 0;
      m33: number = 1;
      m34: number = 0;
      m41: number = 0;
      m42: number = 0;
      m43: number = 0;
      m44: number = 1;
      is2D: boolean = true;
      isIdentity: boolean = true;
      constructor() {}
    } as unknown;
  }
}

// Auto-run when imported
polyfillDOMMatrix();
