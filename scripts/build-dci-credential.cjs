/* Build a fictional credential and its detached integrity proof.
 * The signing key exists only in this process and is never written to disk.
 * The proof demonstrates integrity, not institutional identity or accreditation.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const QRCode = require("qrcode");

async function build() {
  const root = path.resolve(__dirname, "..");
  const canonical = fs.readFileSync(path.join(root, "_config.yml"), "utf8")
    .match(/^url:\s*"([^"]+)"/m)?.[1];
  if (!canonical) throw new Error("The site's canonical URL is missing.");
  const destination = new URL("/sample-credential", canonical).href;
  const imageDir = path.join(root, "assets4/images");
  const docDir = path.join(root, "assets4/docs");
  fs.mkdirSync(imageDir, { recursive: true });
  fs.mkdirSync(docDir, { recursive: true });
  const qrPath = path.join(imageDir, "dci-credential-qr.png");
  await QRCode.toFile(qrPath, destination, {
    width: 320, margin: 4, errorCorrectionLevel: "M",
    color: { dark: "#292640", light: "#ffffff" },
  });
  // JPEG is embedded directly in the PDF; no document-generation runtime is required.
  const jpeg = execFileSync("python3", ["-c",
    "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.stdout.buffer,format='JPEG',quality=100,subsampling=0)",
    qrPath,
  ]);
  const escapePdf = text => text.replace(/[\\()]/g, "\\$&");
  const text = (x, y, size, content, bold = false) =>
    `BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${escapePdf(content)}) Tj ET`;
  const content = [
    "0.98 0.98 1 rg 0 0 612 792 re f",
    "0.31 0.27 0.89 rg 42 730 528 5 re f",
    "0.16 0.15 0.25 rg",
    text(54, 688, 14, "UNIVERSITY EXAMPLE", true),
    text(54, 637, 30, "Certificate of Achievement", true),
    text(54, 593, 12, "Presented to"),
    text(54, 553, 28, "Alex Morgan", true),
    text(54, 499, 17, "Global Leadership Programme", true),
    text(54, 469, 12, "Executive education | Programme completion"),
    text(54, 416, 11, "Recognising completion of the institution-approved programme."),
    text(54, 390, 11, "Achievement evidence: approved programme assessment."),
    text(54, 335, 11, "Issued: 6 October 2026"),
    text(54, 309, 11, "Credential ID: UE-GLP-2026-0148"),
    text(54, 283, 11, "Skills: strategic leadership, communication, decision-making"),
    "q 110 0 0 110 448 102 cm /QR Do Q",
    text(54, 182, 14, "Office of the Registrar", true),
    text(54, 158, 10, "University Example"),
    text(54, 98, 10, "Explore credential access and verification"),
    text(54, 78, 9, destination),
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /QR 7 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    Buffer.from(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`),
    Buffer.concat([
      Buffer.from(`<< /Type /XObject /Subtype /Image /Width 320 /Height 320 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),
      jpeg, Buffer.from("\nendstream"),
    ]),
  ];
  let pdf = Buffer.from("%PDF-1.4\n");
  const offsets = [0];
  objects.forEach((object, i) => {
    offsets.push(pdf.length);
    pdf = Buffer.concat([pdf, Buffer.from(`${i + 1} 0 obj\n`),
      Buffer.isBuffer(object) ? object : Buffer.from(object), Buffer.from("\nendobj\n")]);
  });
  const xref = pdf.length;
  const rows = offsets.map((offset, i) => `${String(offset).padStart(10, "0")} ${i ? "00000 n" : "65535 f"} \n`).join("");
  pdf = Buffer.concat([pdf, Buffer.from(`xref\n0 ${objects.length + 1}\n${rows}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)]);
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const signature = crypto.sign("sha256", pdf, { key: privateKey, dsaEncoding: "ieee-p1363" });
  fs.writeFileSync(path.join(docDir, "dci-credential.pdf"), pdf);
  fs.writeFileSync(path.join(docDir, "dci-proof.json"), JSON.stringify({
    algorithm: "ECDSA", curve: "P-256", hash: "SHA-256",
    credentialId: "UE-GLP-2026-0148",
    publicKey: publicKey.export({ format: "jwk" }),
    signature: signature.toString("base64"),
  }, null, 2) + "\n");
  console.log("Built credential PDF, public integrity proof and QR for the existing credential walkthrough.");
}

build().catch(error => { console.error(error); process.exitCode = 1; });
