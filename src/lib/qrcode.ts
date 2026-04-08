import QRCode from "qrcode";

// ── Unique ID generator ──────────────────────────────────────────────────────
// Produces a 8-char alphanumeric ID, collision-resistant enough for a product catalogue.
const CHARS = "abcdefghjkmnpqrstuvwxyz23456789"; // no confusable chars (0,O,1,l,i)

export function generateQrCodeId(length = 8): string {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}

// ── QR image generator ───────────────────────────────────────────────────────
export interface QrOptions {
  /** Full URL the QR code should resolve to */
  url: string;
  /** px size of the QR image (default 400) */
  size?: number;
  /** Foreground colour (default iSPORTS navy) */
  darkColor?: string;
  /** Background colour (default white) */
  lightColor?: string;
  /** Error correction level – H gives the best resilience (default "H") */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

/**
 * Generates a QR code as a base64 PNG data-URL.
 * Use this on the server side (Node.js) only.
 */
export async function generateQrCodeDataUrl(opts: QrOptions): Promise<string> {
  const {
    url,
    size = 400,
    darkColor = "#004b9c",
    lightColor = "#ffffff",
    errorCorrectionLevel = "H",
  } = opts;

  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: { dark: darkColor, light: lightColor },
    errorCorrectionLevel,
  });
}

/**
 * Generates a high-res QR code Buffer (PNG) suitable for download / printing.
 */
export async function generateQrCodeBuffer(opts: QrOptions): Promise<Buffer> {
  const {
    url,
    size = 600,
    darkColor = "#004b9c",
    lightColor = "#ffffff",
    errorCorrectionLevel = "H",
  } = opts;

  return QRCode.toBuffer(url, {
    width: size,
    margin: 2,
    type: "png",
    color: { dark: darkColor, light: lightColor },
    errorCorrectionLevel,
  });
}

/**
 * Builds the canonical QR redirect URL for a product.
 * `/qr/<qrCodeId>` → redirects to `/shop/products/<slug>`
 */
export function buildProductQrUrl(baseUrl: string, qrCodeId: string): string {
  return `${baseUrl}/qr/${qrCodeId}`;
}
