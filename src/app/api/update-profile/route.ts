import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { userId, username, displayName } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .update({
        username,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    console.error("Error in update profile API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
