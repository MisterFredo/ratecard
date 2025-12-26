import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "public", "media");

async function listFiles(folder: string) {
  try {
    const folderPath = path.join(BASE_DIR, folder);
    const files = await readdir(folderPath);

    return files.map((f) => `/media/${folder}/${f}`);
  } catch (e) {
    console.error(`Erreur listage ${folder}:`, e);
    return [];
  }
}

export async function GET() {
  try {
    const logos = await listFiles("logos");
    const logosCropped = await listFiles("logos-cropped");
    const articles = await listFiles("articles");
    const generics = await listFiles("generics");

    return NextResponse.json({
      status: "ok",
      media: {
        logos,
        logosCropped,
        articles,
        generics,
      },
    });
  } catch (e: any) {
    console.error("Erreur API media/list:", e);
    return NextResponse.json(
      { status: "error", message: e.message },
      { status: 500 }
    );
  }
}
