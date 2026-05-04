import Razorpay from 'razorpay';
const rzp = new Razorpay({ key_id: 'rzp_test_123', key_secret: 'secret' });
rzp.orders.create({ amount: 100, currency: 'INR' })
  .then(console.log)
  .catch(e => console.error('Caught:', e));
