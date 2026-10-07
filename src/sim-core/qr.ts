import qrcode from 'qrcode-generator';

/**
 * Erzeugt einen QR-Code als SVG (läuft komplett im Browser, ohne externen
 * Dienst). Fehlerkorrektur "M" ist robust genug für Beamer und Handykameras.
 */
export function qrSvg(text: string, options: { margin?: number; title?: string } = {}): string {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const margin = options.margin ?? 2;
  const size = count + margin * 2;
  let path = '';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) path += `M${col + margin} ${row + margin}h1v1h-1z`;
    }
  }
  const title = options.title ? `<title>${options.title.replace(/[<&]/g, '')}</title>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img">${title}<rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}
