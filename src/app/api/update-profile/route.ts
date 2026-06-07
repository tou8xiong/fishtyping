import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, unauthorized } from "@/lib/auth/verifyAuth";

export async function PUT(request: NextRequest) {
  const authUser = await verifyAuth(request);
  if (!authUser) return unauthorized();

  try {
    const { userId, username, displayName, avatarUrl } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Users can only update their own profile
    if (userId !== authUser.uid) {
      return unauthorized("Forbidden");
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .update({
        username,
        display_name: displayName,
        avatar_url: avatarUrl,
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
