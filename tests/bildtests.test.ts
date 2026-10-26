import { deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { decodePng, encodePng } from '../scripts/bildtests/png.mjs';
import { compareImages, TOLERANCE } from '../scripts/bildtests/vergleich.mjs';

/** Einfarbiges RGBA-Bild. */
function solid(width: number, height: number, rgba: [number, number, number, number]) {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < data.length; i += 4) data.set(rgba, i);
  return { width, height, data };
}

/** RGB-PNG (Farbtyp 2) mit vorgegebenem Filter je Zeile, wie es andere Programme schreiben. */
function rgbPng(width: number, rows: number[][], filters: number[]): Uint8Array {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (bytes: Buffer) => {
    let c = 0xffffffff;
    for (const b of bytes) c = (crcTable[(c ^ b) & 0xff] ?? 0) ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, body: Buffer) => {
    const out = Buffer.alloc(12 + body.length);
    out.writeUInt32BE(body.length, 0);
    out.write(type, 4, 'latin1');
    body.copy(out, 8);
    out.writeUInt32BE(crc(out.subarray(4, 8 + body.length)), 8 + body.length);
    return out;
  };
  const bpp = 3;
  const raw: number[] = [];
  rows.forEach((row, y) => {
    const filter = filters[y] ?? 0;
    raw.push(filter);
    const prev = rows[y - 1];
    row.forEach((v, x) => {
      const a = x >= bpp ? (row[x - bpp] ?? 0) : 0;
      const b = prev?.[x] ?? 0;
      const c = x >= bpp ? (prev?.[x - bpp] ?? 0) : 0;
      const p = a + b - c;
      const paeth = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
      const pred = [0, a, b, (a + b) >> 1, paeth][filter] ?? 0;
      raw.push((v - pred) & 0xff);
    });
  });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(rows.length, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.from(raw))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

describe('PNG lesen und schreiben', () => {
  it('liest geschriebene RGBA-Bilder unverändert zurück', () => {
    const image = { width: 3, height: 2, data: new Uint8Array([...Array(24).keys()].map((i) => (i * 37) % 256)) };
    const back = decodePng(encodePng(image));
    expect(back.width).toBe(3);
    expect(back.height).toBe(2);
    expect([...back.data]).toEqual([...image.data]);
  });

  it('liest RGB-Bilder mit allen Zeilenfiltern', () => {
    const rows = [
      [10, 20, 30, 200, 100, 50],
      [11, 22, 33, 199, 101, 52],
      [250, 5, 7, 3, 240, 9],
      [12, 200, 90, 90, 200, 12],
      [0, 255, 128, 128, 255, 0],
    ];
    const image = decodePng(rgbPng(2, rows, [0, 1, 2, 3, 4]));
    const expected = rows.flatMap((row) => [...row.slice(0, 3), 255, ...row.slice(3, 6), 255]);
    expect([...image.data]).toEqual(expected);
  });

  it('lehnt andere Dateien ab', () => {
    expect(() => decodePng(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))).toThrow('Keine PNG-Datei');
  });
});

describe('Bildvergleich', () => {
  it('gleiche Bilder sind gleich', () => {
    const result = compareImages(solid(100, 100, [20, 30, 40, 255]), solid(100, 100, [20, 30, 40, 255]));
    expect(result.ok).toBe(true);
    expect(result.different).toBe(0);
  });

  it('kleine Farbabweichungen (Kantenglättung) zählen nicht', () => {
    const shade = TOLERANCE.channel;
    const result = compareImages(solid(100, 100, [100, 100, 100, 255]), solid(100, 100, [100 + shade, 100, 100, 255]));
    expect(result.different).toBe(0);
  });

  it('erlaubt wenige verschiedene Pixel, meldet mehr', () => {
    const reference = solid(200, 200, [255, 255, 255, 255]);
    const allowed = Math.floor(200 * 200 * TOLERANCE.share);
    const changed = (count: number) => {
      const image = solid(200, 200, [255, 255, 255, 255]);
      for (let i = 0; i < count; i++) image.data.set([0, 0, 0, 255], i * 4);
      return image;
    };
    expect(compareImages(reference, changed(allowed)).ok).toBe(true);
    const result = compareImages(reference, changed(allowed + 1));
    expect(result.ok).toBe(false);
    expect(result.different).toBe(allowed + 1);
    expect(result.diff?.data.slice(0, 4)).toEqual(new Uint8Array([230, 0, 40, 255]));
  });

  it('andere Bildgröße ist immer eine Abweichung', () => {
    const result = compareImages(solid(10, 10, [0, 0, 0, 255]), solid(10, 11, [0, 0, 0, 255]));
    expect(result.ok).toBe(false);
    expect(result.sizeMismatch).toBe(true);
  });
});
