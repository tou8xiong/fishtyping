#!/usr/bin/env node

/**
 * Background worker to pre-generate typing passages
 * Run this script periodically (e.g., every hour) to maintain the passage pool
 *
 * Usage:
 *   node scripts/generate-passages.js
 *
 * Or add to crontab:
 *   0 * * * * cd /path/to/project && node scripts/generate-passages.js
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function generatePassages() {
  try {
    console.log('[Worker] Starting passage generation...');

    const response = await fetch(`${APP_URL}/api/worker/generate-pool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Worker] Generation complete:', result);

    return result;
  } catch (error) {
    console.error('[Worker] Error generating passages:', error);
    throw error;
  }
}

async function checkPoolStatus() {
  try {
    const response = await fetch(`${APP_URL}/api/worker/generate-pool`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Worker] Pool status:', result);

    return result;
  } catch (error) {
    console.error('[Worker] Error checking pool status:', error);
    throw error;
  }
}

async function main() {
  console.log('[Worker] Starting at', new Date().toISOString());

  // Check current pool status
  await checkPoolStatus();

  // Generate passages
  await generatePassages();

  console.log('[Worker] Finished at', new Date().toISOString());
}

main().catch(error => {
  console.error('[Worker] Fatal error:', error);
  process.exit(1);
});
