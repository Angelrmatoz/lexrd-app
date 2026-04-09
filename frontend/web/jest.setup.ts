import '@testing-library/jest-dom';

// Mock de window.matchMedia (usado por use-mobile.ts y componentes de sidebar)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de window.scrollY
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
  configurable: true,
});
