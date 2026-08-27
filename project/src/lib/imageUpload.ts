/**
 * Client-side beeldverwerking voor uploads.
 *
 * - resizeImage: schaalt telefoonfoto's terug en hercodeert naar JPEG, zodat er
 *   geen 2–10 MB bestanden over het netwerk gaan (vooral belangrijk op mobiel/4G).
 * - uploadImageWithProgress: upload met echte voortgang via XHR.
 */

export async function resizeImage(
  file: File,
  maxDimension = 1600,
  quality = 0.8,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const largestSide = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, maxDimension / largestSide);

    // Al klein genoeg → niet onnodig hercoderen.
    if (scale === 1 && file.size < 1_000_000) {
      bitmap.close();
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
    );
    if (!blob) return file;

    const name = `${file.name.replace(/\.[^.]+$/, "")}.jpg`;
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    // Bv. HEIC dat de browser niet kan decoderen: val terug op het origineel.
    return file;
  }
}

export function uploadImageWithProgress(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads");
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error || "Uploaden mislukt"));
      } catch {
        reject(new Error("Uploaden mislukt"));
      }
    };
    xhr.onerror = () => reject(new Error("Uploaden mislukt"));
    xhr.send(form);
  });
}
