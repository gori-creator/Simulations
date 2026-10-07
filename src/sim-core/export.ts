/**
 * Speichert den aktuellen Zustand der Bühne als PNG (z. B. für Arbeitsblätter).
 * Mehrere Canvas-Elemente werden an ihrer Position zusammengesetzt.
 */
export async function exportStagePng(stage: HTMLElement, filename: string, background: string): Promise<void> {
  const canvases = [...stage.querySelectorAll('canvas')];
  if (!canvases.length) return;
  const stageRect = stage.getBoundingClientRect();
  const scale = Math.max(2, window.devicePixelRatio || 1);
  const out = document.createElement('canvas');
  out.width = Math.round(stageRect.width * scale);
  out.height = Math.round(stageRect.height * scale);
  const g = out.getContext('2d');
  if (!g) return;
  g.fillStyle = background;
  g.fillRect(0, 0, out.width, out.height);
  for (const canvas of canvases) {
    const rect = canvas.getBoundingClientRect();
    g.drawImage(
      canvas,
      (rect.left - stageRect.left) * scale,
      (rect.top - stageRect.top) * scale,
      rect.width * scale,
      rect.height * scale,
    );
  }
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
