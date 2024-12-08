export const API_URL = process.env.REACT_APP_API_URL || (() => {
  const hostname = window.location.hostname;
  return `http://${hostname}:1337`;
})(); 