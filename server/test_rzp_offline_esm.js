import https from 'https';
import Razorpay from 'razorpay';

const originalRequest = https.request;
https.request = function(options, cb) {
  const req = originalRequest(options, cb);
  req.on('socket', (socket) => {
    socket.destroy(new Error('getaddrinfo ENOTFOUND api.razorpay.com'));
  });
  return req;
};

const rzp = new Razorpay({ key_id: 'rzp_test_123', key_secret: 'secret' });
rzp.orders.create({ amount: 100, currency: 'INR' })
  .then(console.log)
  .catch(e => {
     console.error('CAUGHT:', e.message);
  });
