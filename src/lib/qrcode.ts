import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import sharp from "sharp";

// ─────────────────────────────────────────────────────────────────────────────
// Brand constants
// ─────────────────────────────────────────────────────────────────────────────
const NAVY = "#004b9c";
const GREEN = "#81bf42";

// Absolute path to the logo shipped with the Next.js app
const LOGO_PATH = path.join(process.cwd(), "public", "ISportsCricket-Logo.png");

// ─────────────────────────────────────────────────────────────────────────────
// Unique ID generator
// ─────────────────────────────────────────────────────────────────────────────
// 8-character alphanumeric, no visually confusable characters (0/O, 1/l/I)
const CHARS = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateQrCodeId(length = 8): string {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface QrOptions {
  /** Full URL the QR code should encode */
  url: string;
  /**
   * Output image width in pixels.
   * Use 400–500 for DB storage (data-URL), 800+ for print downloads.
   * Default: 500
   */
  size?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: build the branded logo badge
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Creates a white rounded-square badge containing the iSPORTS logo.
 * Falls back to an SVG wordmark when the PNG is absent.
 *
 * @param badgeSize  Overall badge dimensions in px
 * @returns          PNG Buffer of the composited badge
 */
async function buildLogoBadge(badgeSize: number): Promise<Buffer> {
  const radius = Math.round(badgeSize * 0.2); // corner radius
  const border = Math.max(2, Math.round(badgeSize * 0.028)); // border stroke
  const padding = Math.round(badgeSize * 0.13); // inner padding

  // ── White rounded-square with navy border ─────────────────────────────────
  const badgeSvg = `<svg
    width="${badgeSize}" height="${badgeSize}"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="0" y="0"
      width="${badgeSize}" height="${badgeSize}"
      rx="${radius}" ry="${radius}"
      fill="white"
    />
    <rect
      x="${border / 2}" y="${border / 2}"
      width="${badgeSize - border}" height="${badgeSize - border}"
      rx="${radius - 1}" ry="${radius - 1}"
      fill="none"
      stroke="${NAVY}"
      stroke-width="${border}"
    />
  </svg>`;

  const badgeBase = await sharp(Buffer.from(badgeSvg)).png().toBuffer();

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoArea = badgeSize - padding * 2;
  let logoBuffer: Buffer;

  if (fs.existsSync(LOGO_PATH)) {
    // Real logo PNG — resize to fit inside the padding zone
    logoBuffer = await sharp(LOGO_PATH)
      .resize(logoArea, logoArea, {
        fit: "inside",
        withoutEnlargement: false,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();
  } else {
    // SVG wordmark fallback (no external file needed)
    const s = logoArea;
    const wordmarkSvg = `<svg
      width="${s}" height="${s}"
      viewBox="0 0 ${s} ${s}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="${s / 2}" y="${s * 0.44}"
        font-family="'Arial Black','Arial Bold',Impact,sans-serif"
        font-size="${s * 0.285}"
        font-weight="900"
        fill="${NAVY}"
        text-anchor="middle"
        letter-spacing="-0.5"
      >iSPORTS</text>
      <text
        x="${s / 2}" y="${s * 0.7}"
        font-family="Arial,Helvetica,sans-serif"
        font-size="${s * 0.155}"
        font-weight="700"
        fill="${GREEN}"
        text-anchor="middle"
        letter-spacing="2.5"
      >CRICKET</text>
    </svg>`;
    logoBuffer = await sharp(Buffer.from(wordmarkSvg)).png().toBuffer();
  }

  // Centre the logo inside the badge precisely
  const meta = await sharp(logoBuffer).metadata();
  const logoW = meta.width ?? logoArea;
  const logoH = meta.height ?? logoArea;
  const logoPosX = Math.round((badgeSize - logoW) / 2);
  const logoPosY = Math.round((badgeSize - logoH) / 2);

  return sharp(badgeBase)
    .composite([{ input: logoBuffer, left: logoPosX, top: logoPosY }])
    .png()
    .toBuffer();
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: full branded QR generation
// ─────────────────────────────────────────────────────────────────────────────
async function buildBrandedQr(url: string, size: number): Promise<Buffer> {
  // Raw QR in iSPORTS navy on white, error-correction H
  const qrBuffer = await QRCode.toBuffer(url, {
    width: size,
    margin: 3,
    type: "png",
    color: { dark: NAVY, light: "#ffffff" },
    errorCorrectionLevel: "H", // tolerates up to 30% module loss
  });

  // Badge covers ~21.5% of the QR — well inside the 30% EC headroom
  const badgeSize = Math.round(size * 0.215);
  const badgeBuffer = await buildLogoBadge(badgeSize);

  // Composite dead-centre
  const offsetX = Math.round((size - badgeSize) / 2);
  const offsetY = Math.round((size - badgeSize) / 2);

  return sharp(qrBuffer)
    .composite([{ input: badgeBuffer, left: offsetX, top: offsetY }])
    .png()
    .toBuffer();
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API  (drop-in replacements — same signatures as before)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a base64 PNG data-URL for storage in MongoDB.
 * Renders directly in any <img src="…"> tag.
 *
 * Server-side (Node.js) only.
 */
export async function generateQrCodeDataUrl(opts: QrOptions): Promise<string> {
  const { url, size = 500 } = opts;
  const buffer = await buildBrandedQr(url, size);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

/**
 * Returns a raw PNG Buffer for the "Download print-ready PNG" endpoint.
 * Default 800 px — prints cleanly at up to 5×5 cm @ 150 dpi.
 */
export async function generateQrCodeBuffer(opts: QrOptions): Promise<Buffer> {
  const { url, size = 800 } = opts;
  return buildBrandedQr(url, size);
}

/**
 * Builds the canonical QR redirect URL for a product.
 * Short /qr/<id> path keeps the URL compact → denser modules → easier scanning.
 */
export function buildProductQrUrl(baseUrl: string, qrCodeId: string): string {
  return `${baseUrl}/qr/${qrCodeId}`;
}
