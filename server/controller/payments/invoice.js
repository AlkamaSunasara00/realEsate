const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const connection = require("../../connection/connection");

// 🧾 Generate and save invoice PDF
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

  const projectRoot = path.resolve(__dirname, "../../..");
  const invoiceDir = path.join(projectRoot, "client/public/uploads/invoices");
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

  const invoiceFileName = `invoice_${payment_id}.pdf`;
  const invoicePath = path.join(invoiceDir, invoiceFileName);
  const relativePath = `${invoiceFileName}`;

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(invoicePath);
  doc.pipe(stream);

  // HEADER DESIGN
  doc
    .fontSize(26)
    .fillColor("#333")
    .text("INVOICE", { align: "right" })
    .moveDown(2);

  doc
    .fontSize(10)
    .fillColor("#555")
    .text("ISSUED TO:", 50, 100)
    .fontSize(12)
    .fillColor("#000")
    .text(client_name, 50, 115)
    .text(property_title, 50, 130)
    .text(property_address, 50, 145);

  doc
    .fontSize(10)
    .fillColor("#555")
    .text("INVOICE NO:", 400, 100)
    .fontSize(12)
    .fillColor("#000")
    .text(`#INV-${payment_id}`, 480, 100)
    .fontSize(10)
    .fillColor("#555")
    .text("DATE:", 400, 120)
    .fontSize(12)
    .fillColor("#000")
    .text(confirmed_at.split(" ")[0], 480, 120);

  doc
    .moveTo(50, 170)
    .lineTo(550, 170)
    .strokeColor("#ccc")
    .lineWidth(1)
    .stroke();

  // TABLE HEADER
  doc
    .fontSize(10)
    .fillColor("#555")
    .text("DESCRIPTION", 60, 190)
    .text("UNIT PRICE", 300, 190)
    .text("QTY", 400, 190)
    .text("TOTAL", 480, 190);

  doc
    .moveTo(50, 205)
    .lineTo(550, 205)
    .strokeColor("#ccc")
    .lineWidth(1)
    .stroke();

  // TABLE BODY
  doc
    .fontSize(12)
    .fillColor("#000")
    .text(property_title, 60, 220)
    .text(`₹${amount}`, 300, 220)
    .text("1", 400, 220)
    .text(`₹${amount}`, 480, 220);

  doc
    .moveTo(50, 240)
    .lineTo(550, 240)
    .strokeColor("#ccc")
    .lineWidth(1)
    .stroke();

  // TOTALS
  const subtotalY = 260;
  const total = parseFloat(amount);

  doc
    .fontSize(12)
    .text("SUBTOTAL", 400, subtotalY)
    .text(`₹${amount}`, 480, subtotalY)
    .font("Helvetica-Bold")
    .text("TOTAL", 400, subtotalY + 30)
    .text(`₹${total}`, 480, subtotalY + 30);

  // SIGNATURE (base64)
  if (signatureDataURL) {
    const img = signatureDataURL.replace(/^data:image\/\w+;base64,/, "");
    const buf = Buffer.from(img, "base64");
    doc.image(buf, 400, 380, { width: 100, height: 60 });
    doc.fontSize(10).fillColor("#555").text("Authorized Signature", 400, 450);
  }

  doc
    .fontSize(10)
    .fillColor("#888")
    .text("Thank you for your business!", 50, 730, { align: "center" });

  doc.end();

  // save + update DB
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
    console.error("PDF error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  });
};

// 🧾 Get invoice path
const getInvoicePath = (req, res) => {
  const { id } = req.params;
  connection.query("SELECT invoice_path FROM payments WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!result.length) return res.status(404).json({ error: "Not found" });
    res.json({ invoice_path: result[0].invoice_path });
  });
};

// 🧾 Download invoice
const downloadInvoice = (req, res) => {
  const invoiceId = req.params.id;

  // jump 3 levels up from controllers/payment/
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


module.exports={generateInvoicePdf,getInvoicePath,downloadInvoice}