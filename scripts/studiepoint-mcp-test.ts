/**
 * PHASE 1d FINAL PROBE. Throwaway script, not imported by any route, page,
 * or component. Run with: npx tsx scripts/studiepoint-mcp-test.ts
 *
 * Discovery only, nothing stored. Tries up to three convert_gpa formats for
 * the nigerian scale, stopping at the first success, then (only if one
 * succeeded) makes one match_scholarships call using that real converted
 * value. No auth header, no writes, no fabricated data.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const SERVER_URL = 'https://studiepoint.ai/api/mcp';
const CONNECT_TIMEOUT_MS = 30_000;

const GPA_ATTEMPTS = [
  { scale: 'nigerian', grade: '4.5' },
  { scale: 'nigerian', grade: 'first_class' },
  { scale: 'nigerian', grade: '3.8/5.0' },
];

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`FAILED: ${label} did not complete within ${ms}ms`)), ms);
    }),
  ]);
}

function extractText(result: unknown): string {
  const content = (result as { content?: Array<{ type: string; text?: string }> })?.content;
  return content?.find((c) => c.type === 'text')?.text ?? '';
}

// Only used to read a number back out of convert_gpa's own prose response
// for the match_scholarships call in Step 2, never to invent one.
function extractConvertedGpa(text: string): number | null {
  const match = text.match(/(\d\.\d+)/);
  return match ? Number(match[1]) : null;
}

async function main() {
  console.log('--- StudiePoint MCP test (Phase 1d) ---');
  console.log('Server URL:', SERVER_URL);
  console.log('Auth: none (no header sent)');
  console.log('');

  const transport = new StreamableHTTPClientTransport(new URL(SERVER_URL));
  const client = new Client({ name: 'bursa-studiepoint-test', version: '0.0.1' });

  try {
    await withTimeout(client.connect(transport), CONNECT_TIMEOUT_MS, 'connect()');
    console.log('Connection: SUCCESS');
  } catch (err) {
    console.log('Connection: FAILED');
    console.error(err);
    return;
  }

  // --- STEP 1: up to 3 bounded convert_gpa attempts ---
  console.log('');
  console.log('--- STEP 1: convert_gpa, nigerian scale, up to 3 tries ---');

  let convertedGpa: number | null = null;

  for (let i = 0; i < GPA_ATTEMPTS.length; i++) {
    const params = GPA_ATTEMPTS[i];
    console.log('');
    console.log(`Attempt ${i + 1}:`, JSON.stringify(params));

    let result;
    try {
      result = await withTimeout(
        client.callTool({ name: 'convert_gpa', arguments: params }),
        CONNECT_TIMEOUT_MS,
        'convert_gpa call'
      );
    } catch (err) {
      console.log('Call FAILED (transport error):');
      console.error(err);
      continue;
    }

    console.log('Raw response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.isError === false) {
      convertedGpa = extractConvertedGpa(extractText(result));
      console.log(`SUCCESS on attempt ${i + 1}. Stopping GPA attempts.`);
      break;
    }
  }

  if (convertedGpa === null) {
    console.log('');
    console.log('All 3 attempts failed (or none returned a readable number). nigerian grade format: UNKNOWN.');
    console.log('Skipping Step 2 (match_scholarships requires converted_gpa).');
    return;
  }

  // --- STEP 2: one match_scholarships call using the real converted value ---
  console.log('');
  console.log('--- STEP 2: match_scholarships (one call) ---');
  const matchParams = {
    nationality: 'Nigeria',
    converted_gpa: convertedGpa,
    field: 'Computer Science',
    degree_level: 'masters',
    limit: 5,
  };
  console.log('Params:', JSON.stringify(matchParams));

  try {
    let result = await withTimeout(
      client.callTool({ name: 'match_scholarships', arguments: matchParams }),
      CONNECT_TIMEOUT_MS,
      'match_scholarships call'
    );
    console.log('Raw response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.isError) {
      const errorText = extractText(result);
      console.log('');
      console.log('First attempt errored. Error text:', errorText);
      const retryParams = { ...matchParams, nationality: 'Nigerian' };
      console.log('Retrying once with nationality: "Nigerian" instead of "Nigeria".');
      console.log('Params:', JSON.stringify(retryParams));

      result = await withTimeout(
        client.callTool({ name: 'match_scholarships', arguments: retryParams }),
        CONNECT_TIMEOUT_MS,
        'match_scholarships retry'
      );
      console.log('Raw response:');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.log('match_scholarships: FAILED');
    console.error(err);
  }
}

main()
  .catch((err) => {
    console.log('Unexpected top-level error:');
    console.error(err);
  })
  .finally(() => process.exit(0));
