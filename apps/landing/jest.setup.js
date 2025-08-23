import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: false,
      isReady: true,
      defaultLocale: 'en',
      domainLocales: [],
      isPreview: false,
    };
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  metrics: {
    increment: jest.fn(),
    gauge: jest.fn(),
  },
  getCurrentHub: () => ({
    getClient: () => ({
      getDsn: () => ({ projectId: 'test-project' }),
    }),
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Performance API
Object.defineProperty(window, 'PerformanceObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
  })),
});

Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  },
});

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn(),
    getRegistration: jest.fn(),
    getRegistrations: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});

// Mock PWA install prompt
Object.defineProperty(window, 'beforeinstallprompt', {
  writable: true,
  value: null,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock IndexedDB
const indexedDBMock = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
  databases: jest.fn(),
};
global.indexedDB = indexedDBMock;

// Mock Dexie
jest.mock('dexie', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    version: jest.fn().mockReturnThis(),
    stores: jest.fn().mockReturnThis(),
    open: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    table: jest.fn().mockReturnValue({
      add: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(null),
      put: jest.fn().mockResolvedValue(1),
      delete: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
      count: jest.fn().mockResolvedValue(0),
      toArray: jest.fn().mockResolvedValue([]),
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null),
          toArray: jest.fn().mockResolvedValue([]),
        }),
        below: jest.fn().mockReturnValue({
          delete: jest.fn().mockResolvedValue(undefined),
        }),
        and: jest.fn().mockReturnValue({
          delete: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      orderBy: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      }),
      bulkDelete: jest.fn().mockResolvedValue(undefined),
    }),
  })),
  Table: jest.fn(),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  QueryClient: jest.fn().mockImplementation(() => ({
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
    refetchQueries: jest.fn(),
    resetQueries: jest.fn(),
    removeQueries: jest.fn(),
    getQueryState: jest.fn(),
    getQueriesData: jest.fn(),
    setQueriesData: jest.fn(),
    getDefaultOptions: jest.fn(),
    setDefaultOptions: jest.fn(),
    mount: jest.fn(),
    unmount: jest.fn(),
    isFetching: jest.fn(),
    isMutating: jest.fn(),
    getQueryCache: jest.fn(),
    getMutationCache: jest.fn(),
    clear: jest.fn(),
    resumePausedMutations: jest.fn(),
    getQueryDefaults: jest.fn(),
    setQueryDefaults: jest.fn(),
    getMutationDefaults: jest.fn(),
    setMutationDefaults: jest.fn(),
    defaultOptions: {
      queries: {},
      mutations: {},
    },
  })),
  QueryClientProvider: ({ children }) => children,
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
  useInfiniteQuery: jest.fn(),
}));

// Mock next-pwa
jest.mock('next-pwa', () => {
  return jest.fn(() => (config) => config);
});

// Console error suppression for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
