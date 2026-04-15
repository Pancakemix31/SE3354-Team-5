// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

process.env.REACT_APP_FIREBASE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY || 'test-api-key';
process.env.REACT_APP_FIREBASE_AUTH_DOMAIN =
  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com';
process.env.REACT_APP_FIREBASE_PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID || 'test-project';
process.env.REACT_APP_FIREBASE_STORAGE_BUCKET =
  process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com';
process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID =
  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '1234567890';
process.env.REACT_APP_FIREBASE_APP_ID =
  process.env.REACT_APP_FIREBASE_APP_ID || '1:1234567890:web:testappid';
