import '@testing-library/jest-dom';

// Add global mocks
jest.mock('react-router', () => ({
  useHistory: jest.fn()
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: jest.fn()
}));