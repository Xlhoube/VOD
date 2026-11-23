import { NextRequest, NextResponse } from "next/server";
import { discoverMedia } from "@/lib/tmdb";
import { MediaType } from "@/types/media";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") as MediaType) || "movie";
  const genre = searchParams.get("genre") || undefined;
  const year = searchParams.get("year") || undefined;
  const sortBy = searchParams.get("sortBy") || "popularity.desc";
  const page = Number(searchParams.get("page") || "1");
  const providersParam = searchParams.get("providers");
  const providers = providersParam
    ? providersParam
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !Number.isNaN(id) && id > 0)
    : undefined;

  try {
    const data = await discoverMedia({
      type,
      genre,
      year,
      sortBy,
      providers,
      page,
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao descobrir conteúdos no TMDB.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
