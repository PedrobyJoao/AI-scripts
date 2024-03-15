import { Anthropic } from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

async function getAnthropicKey() {
  const token = process.env.Claude_API_KEY;
  if (token) {
    return token.trim();
  } else {
    console.error("Error: Claude_API_KEY environment variable is not set.");
    console.error("Please make sure to export your Anthropic token as an environment variable.");
    process.exit(1);
  }
}

export async function ask({ system, prompt, max_tokens, model = 'claude-3-opus-20240229', temperature = 1, debug = true }) {
  const anthropic = new Anthropic({ apiKey: await getAnthropicKey() });
  if (debug) {
    const stream = anthropic.messages.stream({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: max_tokens || 4096,
      temperature,
      ...(system && { system }),
    }).on('text', (text) => process.stdout.write(text));
    const message = await stream.finalMessage();
    console.log(); // Add a newline at the end
    return message.content[0].text;
  } else {
    const message = await anthropic.messages.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: max_tokens || 4096,
      temperature,
      ...(system && { system }),
    });
    return message.content[0].text;
  }
}
