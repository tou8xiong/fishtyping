# Fix User Profile Not Loading Issue

## Problem
User is logged in but username and avatar don't show in the header. The display name shows as "-" in Supabase.

## Root Cause
The `users` table either:
1. Doesn't have the correct RLS (Row Level Security) policies
2. The user profile row was never created in the `users` table

## Solution

### Step 1: Fix Database Policies (REQUIRED)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the SQL script in `scripts/fix-users-table.sql`

This will:
- Create the `users` table if it doesn't exist
- Set up proper RLS policies so users can create/update their profiles
- Allow public read access for leaderboard functionality

### Step 2: Fix Existing User Profile

**Option A: Use the Fix Profile Page**
1. While logged in, visit: http://localhost:3000/fix-profile
2. Click "Fix My Profile" button
3. This will create your profile in the database
4. You'll be redirected to the home page with your profile showing

**Option B: Log out and log back in**
1. Log out of the application
2. Log back in
3. The `ensureUserProfile` function will create your profile automatically

### Step 3: Verify

After completing the steps above:
1. Refresh the page
2. Your username and avatar should now appear in the header
3. Check the browser console for any errors

## What Was Fixed

1. **Added error logging** to `ensureUserProfile` functions in:
   - `src/app/register/actions.ts`
   - `src/app/auth/callback/route.ts`

2. **Created fix-profile page** at `src/app/fix-profile/page.tsx`
   - Allows users to manually create their profile
   - Shows detailed status messages

3. **Created SQL script** at `scripts/fix-users-table.sql`
   - Sets up proper RLS policies
   - Ensures users can insert/update their own profiles

## Testing

After applying the fix:
1. Check browser console for logs starting with `ensureUserProfile:`
2. Check Supabase Dashboard → Authentication → Users
3. The "Display name" column should now show the username
4. Header should display the profile name and avatar

## Future Prevention

The RLS policies are now set up correctly, so:
- New users will automatically get profiles created on signup
- OAuth users will get profiles created on first login
- Users can update their own profiles in settings
