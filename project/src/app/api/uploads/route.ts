import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { uploadImage, validateImage } from "@/lib/storage";

// Upload-endpoint voor afbeeldingen. Toegankelijk voor zowel teams (antwoorden)
// als admins (voorbeeldfoto's), mits ingelogd. Geeft een URL terug.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session.teamId && !session.adminId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Geen bestand ontvangen" },
      { status: 400 },
    );
  }

  const validationError = validateImage(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const url = await uploadImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Uploaden mislukt" }, { status: 500 });
  }
}
