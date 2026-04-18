const GST_RATE = 0.05;
const CONVENIENCE_FEE = 25;

export const computeFareBreakdown = (baseFarePerSeat, seatCount, discountAmount = 0) => {
  const base = baseFarePerSeat * seatCount;
  const gst = Math.round(base * GST_RATE * 100) / 100;
  const convenience = CONVENIENCE_FEE;
  const subtotal = base + gst + convenience;
  const discount = Math.min(discountAmount, subtotal);
  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  return {
    baseFare: base,
    gst,
    convenienceFee: convenience,
    discount,
    total,
  };
};

export const applyCouponToFare = (subtotalAfterFees, coupon) => {
  if (!coupon || !coupon.isActive) return 0;
  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) return 0;
  if (coupon.validTill && now > coupon.validTill) return 0;
  if (subtotalAfterFees < (coupon.minFare || 0)) return 0;
  if (coupon.usageLimit != null && coupon.timesUsed >= coupon.usageLimit) return 0;

  let discount = 0;
  if (coupon.discountType === 'flat') {
    discount = coupon.discountValue;
  } else {
    discount = (subtotalAfterFees * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  }
  return Math.round(Math.min(discount, subtotalAfterFees) * 100) / 100;
};

export const refundForCancellation = (departureDateTime, totalPaid) => {
  const now = Date.now();
  const dep = departureDateTime.getTime();
  const hours = (dep - now) / (1000 * 60 * 60);
  if (hours >= 24) return Math.round(totalPaid * 100) / 100;
  if (hours >= 4) return Math.round(totalPaid * 0.5 * 100) / 100;
  return 0;
};
