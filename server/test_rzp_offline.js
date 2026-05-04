const https = require('https');
const http = require('http');

// Mock https.request to simulate network failure (ECONNREFUSED)
const originalRequest = https.request;
https.request = function(options, cb) {
  const req = originalRequest(options, cb);
  req.on('socket', (socket) => {
    socket.destroy(new Error('getaddrinfo ENOTFOUND api.razorpay.com'));
  });
  return req;
};

const Razorpay = require('razorpay');
const rzp = new Razorpay({ key_id: 'rzp_test_123', key_secret: 'secret' });
rzp.orders.create({ amount: 100, currency: 'INR' })
  .then(console.log)
  .catch(e => {
     console.error('CAUGHT OFFLINE ERROR:', e.message);
  });
