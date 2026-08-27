/**
 * Utility functions for downloading photos from submissions
 */

/**
 * Download a single photo
 */
export async function downloadSinglePhoto(
  imageUrl: string,
  filename: string
): Promise<void> {
  try {
    // If it's a base64 image
    if (imageUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // If it's a URL, fetch and download
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading photo:", error);
    throw new Error("Kon foto niet downloaden");
  }
}

/**
 * Generate a filename for a submission photo
 */
export function generatePhotoFilename(
  teamName: string,
  assignmentTitle: string,
  timestamp?: string
): string {
  const cleanTeamName = teamName.replace(/[^a-z0-9]/gi, "_");
  const cleanAssignmentTitle = assignmentTitle.replace(/[^a-z0-9]/gi, "_");
  const date = timestamp
    ? new Date(timestamp).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return `${cleanTeamName}_${cleanAssignmentTitle}_${date}.jpg`;
}
