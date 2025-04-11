// This file will only be used when needed in a serverless environment
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer/').Buffer;
}

export {}; 