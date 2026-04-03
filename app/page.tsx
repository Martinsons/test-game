import { supabase } from "@/lib/supabase";
import { Place } from "@/lib/places";
import GameClient from "@/components/GameClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data, error } = await supabase.from("places").select("*");

  if (error || !data) {
    throw new Error(`Failed to load places: ${error?.message ?? "no data"}`);
  }

  return <GameClient places={data as Place[]} />;
}
