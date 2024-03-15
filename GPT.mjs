#!/usr/bin/env node

import process from "process";
import OpenAI from "openai";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { encode } from "gpt-tokenizer/esm/model/davinci-codex"; // tokenizer

const openai = new OpenAI({apiKey: await get_token()});

export async function get_token() {
  const token = process.env.OPENAI_API_KEY;
  if (token) {
    return token.trim();
  } else {
    console.error("Error: OPENAI_TOKEN environment variable is not set.");
    console.error("Please make sure to export your OpenAI API token as an environment variable.");
    process.exit(1);
  }
}

export async function ask({system, prompt, model, temperature}) {
  const stream = await openai.chat.completions.create({
    model: model || "gpt-4-0125-preview",
    messages: [
      {role: "system", content: system || "You're a helpful assistant." },
      {role: "user", content: prompt || "What time is it?" }
    ],
    stream: true,
    temperature: temperature || 0,
  });
  var result = "";
  for await (const chunk of stream) {
    var text = chunk.choices[0]?.delta?.content || "";
    process.stdout.write(text);
    result += text;
  }
  process.stdout.write("\n");
  return result;
}

export function token_count(inputText) {
  // Encode the input string into tokens
  const tokens = encode(inputText);

  // Get the number of tokens
  const numberOfTokens = tokens.length;

  // Return the number of tokens
  return numberOfTokens;
}
