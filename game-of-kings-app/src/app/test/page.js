"use client";

import { supabase } from "../../lib/supabase";

export default function TestPage() {
  async function saveTest() {
    if (!supabase) {
      alert("Supabase is not configured yet.");
      return;
    }

    const { data, error } = await supabase
      .from("players")
      .insert([
        {
          house_name: "House Rider",
          castle_name: "King's Landing",
          gold: 1000,
          troops: 500,
          prestige: 100,
        },
      ]);

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      alert("Error updating!");
    } else {
      alert("Updated successfully!");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <button
        onClick={saveTest}
        className="bg-emerald-700 px-8 py-4 rounded-xl text-xl font-bold"
      >
        Update Test Player
      </button>
    </main>
  );
}
