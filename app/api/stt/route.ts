import { NextRequest, NextResponse } from 'next/server';

const ASSEMBLY_API_BASE = 'https://api.assemblyai.com/v2';
const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 700;

async function uploadAudio(apiKey: string, audioBuffer: ArrayBuffer) {
  const response = await fetch(`${ASSEMBLY_API_BASE}/upload`, {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'content-type': 'application/octet-stream',
    },
    body: Buffer.from(audioBuffer),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload audio: ${errorText || response.statusText}`);
  }

  const data = (await response.json()) as { upload_url?: string };
  if (!data.upload_url) {
    throw new Error('Upload URL missing in AssemblyAI response');
  }

  return data.upload_url;
}

async function requestTranscript(apiKey: string, audioUrl: string) {
  const response = await fetch(`${ASSEMBLY_API_BASE}/transcript`, {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ audio_url: audioUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to request transcript: ${errorText || response.statusText}`);
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) {
    throw new Error('Transcript ID missing from AssemblyAI response');
  }

  return data.id;
}

async function pollTranscript(apiKey: string, transcriptId: string) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${ASSEMBLY_API_BASE}/transcript/${transcriptId}`, {
      headers: {
        authorization: apiKey,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch transcript status: ${errorText || response.statusText}`);
    }

    const data = (await response.json()) as { status?: string; text?: string; error?: string };
    if (data.status === 'completed') {
      return data.text ?? '';
    }

    if (data.status === 'error') {
      throw new Error(data.error || 'AssemblyAI failed to transcribe audio');
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error('Transcription timed out');
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ASSEMBLYAI_API_KEY is not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('audio');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Audio blob is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Received empty audio data' }, { status: 400 });
    }

    const uploadUrl = await uploadAudio(apiKey, arrayBuffer);
    const transcriptId = await requestTranscript(apiKey, uploadUrl);
    const text = await pollTranscript(apiKey, transcriptId);

    return NextResponse.json({ text });
  } catch (error) {
    console.error('STT API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to transcribe audio' },
      { status: 500 },
    );
  }
}
