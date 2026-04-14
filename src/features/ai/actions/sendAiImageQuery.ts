'use server';

import * as fs from 'fs';
import { detectImage } from 'gigachat';
import { ChatCompletion, WithXHeaders } from 'gigachat/interfaces';

import { TAiClientType } from '@/lib/ai';
import { getGigaChatClient } from '@/lib/ai/server-actions';

import { TPlainMessage } from '../types/messages';

const __demoDataFile = './test-data/sendAiImageQuery-sample-data.json';
const __demoImageFile = './test-data/sendAiImageQuery-sample-image.jpg';

type TResponse = ChatCompletion & WithXHeaders;

/** Could be used for debug purposes externally */
export async function loadDemoImage() {
  const imageData = await new Promise<string>((resolve, reject) => {
    fs.readFile(__demoImageFile, (err, data) => {
      if (err) return reject(err);
      resolve(data.toString('binary'));
    });
  });
  return imageData;
}

async function loadDemoData() {
  const rawData = await new Promise<string>((resolve, reject) => {
    fs.readFile(__demoDataFile, 'utf-8', (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
  return JSON.parse(rawData) as TResponse;
}

async function saveDemoData(response: TResponse) {
  await new Promise<void>((resolve, reject) => {
    fs.writeFile(__demoDataFile, JSON.stringify(response, null, 2), 'utf-8', (error) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[sendAiImageQuery] Data saving error:', error);
        // eslint-disable-next-line no-debugger
        debugger;
        return reject(error);
      }
      resolve();
    });
  });
}

async function saveDemoImage(imageData: string) {
  await new Promise<void>((resolve, reject) => {
    fs.writeFile(__demoImageFile, imageData, 'binary', (error) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[sendAiImageQuery] Image saving error:', error);
        // eslint-disable-next-line no-debugger
        debugger;
        return reject(error);
      }
      resolve();
    });
  });
}

export async function sendAiImageQuery(
  clientType: TAiClientType = 'GigaChat',
  messages: TPlainMessage[],
  __useDebugData: boolean = false,
) {
  try {
    if (clientType !== 'GigaChat') {
      throw new Error('Currently only GigaChat model is supported for image queries.');
    }
    let response: TResponse | undefined;
    let imageData: string | undefined;
    const client = getGigaChatClient();
    if (__useDebugData && fs.existsSync(__demoDataFile)) {
      await new Promise((r) => setTimeout(r, 1000));
      response = await loadDemoData();
    } else {
      response = await client.chat({
        messages: messages,
        function_call: 'auto',
      });
      // Save the debug data...
      if (__useDebugData && response) {
        saveDemoData(response);
      }
    }
    const { choices } = response;
    const firstResult = choices[0]?.message.content;
    const detectedImage = firstResult ? detectImage(firstResult) : null;
    if (__useDebugData && fs.existsSync(__demoImageFile)) {
      imageData = await loadDemoImage();
    } else if (detectedImage?.uuid) {
      const image = await client.getImage(detectedImage.uuid);
      imageData = image?.content;
      // Save the image, if any...
      if (__useDebugData && imageData) {
        saveDemoImage(imageData);
      }
    }

    if (!imageData) {
      throw new Error('No image found in the response.');
    }

    return { imageData, response };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[sendAiImageQuery] ❌ Error:', error);
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
