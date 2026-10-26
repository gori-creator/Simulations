// @ts-check
/**
 * Kleiner PNG-Leser/-Schreiber ohne Fremdpakete (nur node:zlib) für die
 * Bildtests. Liest 8-Bit-PNGs ohne Zeilensprung (Graustufen, RGB, RGBA – so
 * speichert Playwright Bildschirmfotos) und schreibt RGBA-PNGs.
 */
import { crc32, deflateSync, inflateSync } from 'node:zlib';

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
/** Bytes pro Pixel je Farbtyp (nur 8 Bit). */
const CHANNELS = /** @type {Record<number, number>} */ ({ 0: 1, 2: 3, 4: 2, 6: 4 });

/** @typedef {{ width: number, height: number, data: Uint8Array }} Rgba */

/** @param {number} a @param {number} b @param {number} c */
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/**
 * Liest ein PNG in RGBA-Pixel (4 Byte je Pixel).
 * @param {Uint8Array} file
 * @returns {Rgba}
 */
export function decodePng(file) {
  const buf = Buffer.from(file.buffer, file.byteOffset, file.byteLength);
  if (!buf.subarray(0, 8).equals(SIGNATURE)) throw new Error('Keine PNG-Datei');
  let width = 0;
  let height = 0;
  let colorType = -1;
  /** @type {Buffer[]} */
  const idat = [];
  for (let pos = 8; pos < buf.length; ) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('latin1', pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const depth = body[8];
      colorType = body[9] ?? -1;
      if (depth !== 8 || body[12] !== 0 || !(colorType in CHANNELS)) {
        throw new Error(`Nicht unterstütztes PNG (Tiefe ${depth}, Farbtyp ${colorType}, Zeilensprung ${body[12]})`);
      }
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  const bpp = CHANNELS[colorType] ?? 4;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const px = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const row = y * stride;
    for (let x = 0; x < stride; x++) {
      const v = raw[src + x] ?? 0;
      const a = x >= bpp ? (px[row + x - bpp] ?? 0) : 0;
      const b = y > 0 ? (px[row - stride + x] ?? 0) : 0;
      const c = x >= bpp && y > 0 ? (px[row - stride + x - bpp] ?? 0) : 0;
      let out = v;
      if (filter === 1) out = v + a;
      else if (filter === 2) out = v + b;
      else if (filter === 3) out = v + ((a + b) >> 1);
      else if (filter === 4) out = v + paeth(a, b, c);
      else if (filter !== 0) throw new Error(`Unbekannter PNG-Filter ${filter}`);
      px[row + x] = out & 0xff;
    }
  }
  if (bpp === 4) return { width, height, data: px };
  const data = new Uint8Array(width * height * 4);
  for (let i = 0, j = 0; i < data.length; i += 4, j += bpp) {
    const gray = bpp <= 2;
    data[i] = px[j] ?? 0;
    data[i + 1] = (gray ? px[j] : px[j + 1]) ?? 0;
    data[i + 2] = (gray ? px[j] : px[j + 2]) ?? 0;
    data[i + 3] = bpp === 2 ? (px[j + 1] ?? 255) : 255;
  }
  return { width, height, data };
}

/** @param {string} type @param {Buffer} body */
function chunk(type, body) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])) >>> 0, 0);
  return Buffer.concat([head, body, crc]);
}

/**
 * Schreibt RGBA-Pixel als PNG.
 * @param {Rgba} image
 * @returns {Buffer}
 */
export function encodePng({ width, height, data }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    raw.set(data.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  return Buffer.concat([SIGNATURE, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
