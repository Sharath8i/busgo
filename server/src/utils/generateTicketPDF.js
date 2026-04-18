import PDFDocument from 'pdfkit';

export const generateTicketPDF = (booking, res) => {
  const doc = new PDFDocument({ size: 'A5', margin: 30 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${booking.pnr}.pdf"`);
  doc.pipe(res);
  doc.fontSize(20).text('BusGo E-Ticket', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`PNR: ${booking.pnr}`, { align: 'center' });
  doc.moveDown();
  if (booking.tripId?.scheduleId?.routeId) {
    const r = booking.tripId.scheduleId.routeId;
    doc.fontSize(11).text(`${r.originCity} → ${r.destinationCity}`);
  }
  doc.moveDown();
  doc.fontSize(10).text('Passengers:', { underline: true });
  booking.passengers.forEach((p, i) => {
    doc.text(`${i + 1}. ${p.name} — Seat ${p.seatNumber} (${p.gender}, ${p.age})`);
  });
  doc.end();
};
