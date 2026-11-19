/**
 * Turns an uploaded image file (iPhone photo library, Files app or desktop)
 * into a small data URL that is safe to keep in browser storage.
 * The image is scaled so its longest side is at most `maxSide` px.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That file couldn't be read as an image."));
    img.src = src;
  });
}

export async function fileToLogoDataUrl(file: File, maxSide = 480): Promise<string> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG, JPG, SVG or WebP).");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("That image is too large. Please choose one under 15 MB.");
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const w0 = img.naturalWidth || img.width;
    const h0 = img.naturalHeight || img.height;
    if (!w0 || !h0) throw new Error("That image has no readable size. Try a PNG or JPG.");

    const isSvg = file.type === "image/svg+xml";
    const longest = Math.max(w0, h0);
    const scale = isSvg ? maxSide / longest : Math.min(1, maxSide / longest);
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't process the image.");
    ctx.drawImage(img, 0, 0, w, h);

    // PNG keeps transparency (best for logos). If it is heavy, fall back to JPEG on white.
    let out = canvas.toDataURL("image/png");
    if (out.length > 600_000) {
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      out = canvas.toDataURL("image/jpeg", 0.88);
    }
    if (out.length > 1_500_000) throw new Error("That image is still too large after resizing. Try a simpler logo.");
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}
