import { openai } from './client';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Convert speech (audio) to text using Whisper
export async function speechToText(audioBuffer: Buffer): Promise<string> {
  // Write buffer to temp file (Whisper API needs a file)
  const tempPath = join(tmpdir(), `audio-${randomUUID()}.webm`);
  
  try {
    await writeFile(tempPath, audioBuffer);
    
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      language: 'en',
    });

    return transcription.text;
  } finally {
    // Clean up temp file
    try {
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// Convert text to speech using OpenAI TTS
export async function textToSpeech(text: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova', // Friendly female voice, good for customer service
    input: text,
    response_format: 'mp3',
    speed: 1.0,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Available voices for TTS
export const AVAILABLE_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
export type Voice = typeof AVAILABLE_VOICES[number];
