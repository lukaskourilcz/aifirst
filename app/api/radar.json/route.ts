import { buildRadar } from "@/lib/radar";
import { brand } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const radar = await buildRadar("en");
  return Response.json({ schema_version: 1, publication: brand.name, ...radar });
}
