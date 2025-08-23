// Mock for next-auth/react to resolve Jest testing issues
// This mock provides the basic structure needed for tests

const useSession = jest.fn(() => ({
  data: null,
  status: "unauthenticated",
  update: jest.fn(),
}));

const signIn = jest.fn(() => Promise.resolve());
const signOut = jest.fn(() => Promise.resolve());
const getSession = jest.fn(() => Promise.resolve(null));
const getCsrfToken = jest.fn(() => Promise.resolve("mock-csrf-token"));
const getProviders = jest.fn(() => Promise.resolve({}));

module.exports = {
  useSession,
  signIn,
  signOut,
  getSession,
  getCsrfToken,
  getProviders,
  SessionProvider: ({ children }) => children,
};