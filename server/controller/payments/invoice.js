const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const connection = require("../../connection/connection");

// ──────────────────────────────────────────────────────
//  PROFESSIONAL INVOICE DESIGN
// ──────────────────────────────────────────────────────
const generateInvoicePdf = (req, res) => {
  const {
    payment_id,
    client_name,
    property_title,
    property_address,
    amount,
    confirmed_by,
    confirmed_at,
    signatureDataURL,
  } = req.body;

  if (!payment_id || !client_name) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // ─────── Paths ───────
  const projectRoot = path.resolve(__dirname, "../../..");
  const invoiceDir = path.join(projectRoot, "client/public/uploads/invoices");
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

  const invoiceFileName = `invoice_${payment_id}.pdf`;
  const invoicePath = path.join(invoiceDir, invoiceFileName);
  const relativePath = `${invoiceFileName}`;

  // ─────── PDF setup ───────
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true,
  });
  const stream = fs.createWriteStream(invoicePath);
  doc.pipe(stream);

  // ─────── Colors (professional palette) ───────
  const primary = "#1e40af";   // deep blue
  const accent  = "#f59e0b";   // amber
  const success = "#10b981";   // emerald
  const muted   = "#6b7280";   // slate-500

  // ─────── Helper: register fonts (optional – fallback to Helvetica) ───────
  const registerFont = (name, file) => {
    const fontPath = path.join(__dirname, `../../assets/fonts/${file}`);
    if (fs.existsSync(fontPath)) doc.font(fontPath);
    else doc.font("Helvetica");
    return name;
  };
  const bold = registerFont("Bold", "Inter-Bold.ttf");
  const regular = registerFont("Regular", "Inter-Regular.ttf");
  const italic = registerFont("Italic", "Inter-Italic.ttf");

  // ─────── Header ───────
  doc
    .fillColor(primary)
    .font(bold)
    .fontSize(28)
    .text("INVOICE", { align: "right" })
    .moveDown(0.5);

  // Company placeholder (you can replace with real logo)
  doc
    .rect(50, 50, 120, 40)
    .lineWidth(1.5)
    .stroke(accent)
    .fillOpacity(0.1)
    .fill(accent)
    .fillOpacity(1)
    .font(regular)
    .fontSize(10)
    .fillColor(muted)
    .text("YOUR LOGO", 55, 62);

  // ─────── Bill-To & Invoice meta ───────
  const startY = 120;
  doc
    .font(regular)
    .fontSize(10)
    .fillColor(muted)
    .text("BILL TO", 50, startY)
    .font(bold)
    .fontSize(13)
    .fillColor("#111")
    .text(client_name, 50, startY + 15)
    .font(regular)
    .fontSize(11)
    .fillColor("#333")
    .text(property_title, 50, startY + 32)
    .text(property_address, 50, startY + 48);

  // Right side meta
  doc
    .font(regular)
    .fontSize(10)
    .fillColor(muted)
    .text("INVOICE #", 380, startY)
    .text("DATE", 380, startY + 20)
    .font(bold)
    .fontSize(12)
    .fillColor(primary)
    .text(`INV-${payment_id}`, 460, startY)
    .text(confirmed_at.split(" ")[0], 460, startY + 20);

  // ─────── Table Header ───────
  const tableTop = 220;
  const rowHeight = 25;
  const colWidths = { desc: 240, price: 80, qty: 60, total: 80 };

  const drawRow = (y, bg = "#f9fafb") => {
    doc
      .rect(50, y, 500, rowHeight)
      .fill(bg)
      .fillColor("#111");
  };

  // Header background
  drawRow(tableTop, primary);
  doc
    .font(bold)
    .fontSize(10)
    .fillColor("#fff")
    .text("DESCRIPTION", 60, tableTop + 7)
    .text("UNIT PRICE", 60 + colWidths.desc, tableTop + 7)
    .text("QTY", 60 + colWidths.desc + colWidths.price, tableTop + 7, { width: colWidths.qty, align: "center" })
    .text("TOTAL", 60 + colWidths.desc + colWidths.price + colWidths.qty, tableTop + 7, { align: "right" });

  // ─────── Table Body ───────
  const bodyY = tableTop + rowHeight;
  drawRow(bodyY, "#fff");
  doc
    .font(regular)
    .fontSize(11)
    .fillColor("#111")
    .text(property_title, 60, bodyY + 6, { width: colWidths.desc - 10 })
    .text(`₹${Number(amount).toLocaleString()}`, 60 + colWidths.desc, bodyY + 6)
    .text("1", 60 + colWidths.desc + colWidths.price, bodyY + 6, { width: colWidths.qty, align: "center" })
    .text(`₹${Number(amount).toLocaleString()}`, 60 + colWidths.desc + colWidths.price + colWidths.qty, bodyY + 6, { align: "right" });

  // ─────── Totals ───────
  const totalsY = bodyY + rowHeight + 20;
  const rightCol = 60 + colWidths.desc + colWidths.price + colWidths.qty;

  // Sub-total line
  doc
    .font(regular)
    .fontSize(11)
    .fillColor(muted)
    .text("SUBTOTAL", rightCol - 80, totalsY)
    .fillColor("#111")
    .text(`₹${Number(amount).toLocaleString()}`, rightCol, totalsY, { align: "right" });

  // Total (highlighted)
  doc
    .font(bold)
    .fontSize(14)
    .fillColor(success)
    .text("TOTAL", rightCol - 80, totalsY + 22)
    .text(`₹${Number(amount).toLocaleString()}`, rightCol, totalsY + 22, { align: "right" });

  // ─────── Signature ───────
  if (signatureDataURL) {
    const imgData = signatureDataURL.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(imgData, "base64");

    const sigY = totalsY + 70;
    doc
      .rect(rightCol - 110, sigY, 110, 55)
      .lineWidth(1.2)
      .stroke(accent)
      .image(imgBuffer, rightCol - 105, sigY + 5, { width: 100, height: 45 })
      .font(italic)
      .fontSize(9)
      .fillColor(muted)
      .text("Authorized Signature", rightCol - 105, sigY + 55);
  }

  // ─────── Footer ───────
  const footerY = doc.page.height - 100;
  doc
    .font(regular)
    .fontSize(9)
    .fillColor(muted)
    .text("Thank you for your business!", 0, footerY, { align: "center", width: doc.page.width })
    .text("For any queries contact support@yourcompany.com", 0, footerY + 12, { align: "center", width: doc.page.width });

  // ─────── Finalise PDF ───────
  doc.end();

  // ─────── DB update after PDF is written ───────
  stream.on("finish", () => {
    const updateSQL = `
      UPDATE payments
      SET status='completed', paid_at=?, invoice_path=?
      WHERE id=?;
    `;
    connection.query(updateSQL, [confirmed_at, relativePath, payment_id], (err) => {
      if (err) {
        console.error("DB update error:", err);
        return res.status(500).json({ error: "Failed to update DB" });
      }
      res.json({
        message: "Invoice generated successfully",
        file: relativePath,
      });
    });
  });

  stream.on("error", (err) => {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  });
};

// ─────── Existing helpers (unchanged) ───────
const getInvoicePath = (req, res) => {
  const { id } = req.params;
  connection.query("SELECT invoice_path FROM payments WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!result.length) return res.status(404).json({ error: "Not found" });
    res.json({ invoice_path: result[0].invoice_path });
  });
};

const downloadInvoice = (req, res) => {
  const invoiceId = req.params.id;
  const projectRoot = path.resolve(__dirname, "../../..");
  const invoicePath = path.join(projectRoot, "client/public/uploads/invoices", `invoice_${invoiceId}.pdf`);

  if (!fs.existsSync(invoicePath)) {
    console.error("Invoice not found at:", invoicePath);
    return res.status(404).json({ error: "Invoice not found" });
  }

  res.download(invoicePath, `invoice_${invoiceId}.pdf`, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "Failed to download invoice" });
    }
  });
};

module.exports = { generateInvoicePdf, getInvoicePath, downloadInvoice };