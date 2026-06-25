import { LogEntry } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// NOTE: In production, this key should come from a secure backend.
// For demo/MVP the key is read from env.
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

const SYSTEM_PROMPT = `You are a standup assistant. Convert raw work log entries into clean, structured daily standup updates. Be concise and professional. Always return valid JSON.`;

const USER_PROMPT = (rawLog: string) => `Convert the following raw work log into a standup update.

Return ONLY a valid JSON object in this exact format:
{
  "yesterday": ["bullet 1", "bullet 2"],
  "today": ["bullet 1", "bullet 2"],
  "blockers": ["blocker 1"]
}

If there are no blockers, return: "blockers": ["None"]
Keep bullets short (under 10 words each). Maximum 4 bullets per section.

Raw log:
"${rawLog}"`;

export async function generateStandup(rawLog: string): Promise<LogEntry['formattedStandup']> {
  if (!API_KEY) {
    // Demo mode — generate mock standup
    return mockGenerateStandup(rawLog);
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: USER_PROMPT(rawLog) }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    yesterday: parsed.yesterday || [],
    today: parsed.today || [],
    blockers: parsed.blockers || ['None'],
  };
}

function mockGenerateStandup(rawLog: string): LogEntry['formattedStandup'] {
  const words = rawLog.toLowerCase();
  return {
    yesterday: [
      words.includes('fix') ? 'Fixed reported bugs in main module' : 'Completed feature development tasks',
      'Updated documentation and tests',
    ],
    today: [
      'Continue with sprint backlog items',
      'Code review and PR feedback',
    ],
    blockers: words.includes('block') || words.includes('stuck') || words.includes('wait')
      ? ['Waiting on API access from backend team']
      : ['None'],
  };
}
