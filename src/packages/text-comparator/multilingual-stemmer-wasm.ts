/**
 * Browser-compatible wrapper for multilingual-stemmer
 *
 * The original multilingual-stemmer package is compiled with --target nodejs
 * which uses synchronous WASM loading via fs.readFileSync, which doesn't work
 * in browsers. This wrapper provides async initialization by loading the WASM
 * file from the public folder and instantiating it with proper browser APIs.
 */

// Import Languages from local copy (stripped of Node.js dependencies)
import { Languages } from './multilingual-stemmer/index.js';

// Path to the WASM file in the public folder. See `scripts/copy-multilingual-stemmer.ts`
const WASM_PATH = '/multilingual-stemmer/index_bg.wasm';

// Type definitions for the WASM exports
interface WasmExports {
  memory: WebAssembly.Memory;
  stemmer_new: (lang: number) => number;
  stemmer_stem: (retptr: number, stemmerPtr: number, textPtr: number, textLen: number) => void;
  __wbindgen_malloc: (size: number) => number;
  __wbindgen_free: (ptr: number, size: number) => void;
  __wbindgen_global_argument_ptr: () => number;
  __wbg_stemmer_free: (ptr: number) => void;
}

let wasmInstance: WasmExports | null = null;
let initPromise: Promise<WasmExports> | null = null;
let wasmMemory: WebAssembly.Memory | null = null;

/**
 * Get error message from WASM memory
 */
function getErrorMessage(ptr: number, len: number): string {
  if (!wasmMemory) {
    return `WASM error at ${ptr}:${len}`;
  }
  const memoryView = new Uint8Array(wasmMemory.buffer);
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(memoryView.subarray(ptr, ptr + len));
}

/**
 * Initialize the WASM module for browser environment
 * This fetches the WASM file from the public folder and instantiates it
 */
async function initWasm(): Promise<WasmExports> {
  if (wasmInstance) {
    return wasmInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Fetch the WASM file from the public folder
      const response = await fetch(WASM_PATH);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM module: ${response.status} ${response.statusText}`);
      }
      const wasmBuffer = await response.arrayBuffer();

      // The WASM module needs some imports
      const imports: WebAssembly.Imports = {
        './index': {
          __wbindgen_throw: function (ptr: number, len: number): never {
            const msg = getErrorMessage(ptr, len);
            throw new Error(msg);
          },
        },
      };

      // Instantiate the WASM module
      const { instance } = await WebAssembly.instantiate(wasmBuffer, imports);

      // Store the memory reference for error messages
      wasmMemory = instance.exports.memory as WebAssembly.Memory;
      wasmInstance = instance.exports as unknown as WasmExports;
      return wasmInstance;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize multilingual-stemmer WASM:', error);
      debugger; // eslint-disable-line no-debugger
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Get the initialized WASM exports
 */
export async function getWasmExports(): Promise<WasmExports> {
  await initWasm();
  return wasmInstance!;
}

/**
 * Browser-compatible Stemmer wrapper class
 * Ensures WASM is loaded before creating instances
 */
export class Stemmer {
  private ptr: number = 0;
  private static wasmInitialized = false;

  /**
   * Initialize the WASM module (call once before creating Stemmer instances)
   */
  static async init(): Promise<void> {
    if (Stemmer.wasmInitialized) {
      return;
    }
    await initWasm();
    Stemmer.wasmInitialized = true;
  }

  /**
   * Create a new stemmer for the specified language
   * @param language - Language enum value from Languages
   */
  constructor(language: number) {
    if (!wasmInstance) {
      throw new Error(
        'Stemmer WASM not initialized. Call Stemmer.init() before creating instances.',
      );
    }
    // Call the WASM export to create a new stemmer
    this.ptr = wasmInstance.stemmer_new(language);
  }

  /**
   * Stem a single word
   * @param input - The word to stem (should be lowercase)
   * @returns The stemmed word
   */
  stem(input: string): string {
    if (!wasmInstance) {
      throw new Error('WASM not initialized');
    }

    const memory = wasmInstance.memory;
    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8');

    // Encode the input string
    const inputBytes = encoder.encode(input);

    // Allocate memory for the input string
    const inputPtr = wasmInstance.__wbindgen_malloc(inputBytes.length);
    new Uint8Array(memory.buffer).set(inputBytes, inputPtr);

    // Get the global argument pointer for return values
    const retptr = wasmInstance.__wbindgen_global_argument_ptr();

    // Call the stem function
    wasmInstance.stemmer_stem(retptr, this.ptr, inputPtr, inputBytes.length);

    // Read the result from memory
    const mem = new Uint32Array(memory.buffer);
    const rustptr = mem[retptr / 4];
    const rustlen = mem[retptr / 4 + 1];

    // Get the result string
    const result = decoder.decode(
      new Uint8Array(memory.buffer).subarray(rustptr, rustptr + rustlen),
    );

    // Free the allocated memory
    wasmInstance.__wbindgen_free(rustptr, rustlen);
    wasmInstance.__wbindgen_free(inputPtr, inputBytes.length);

    return result;
  }

  /**
   * Free the stemmer resources
   */
  free(): void {
    if (this.ptr && wasmInstance) {
      wasmInstance.__wbg_stemmer_free(this.ptr);
      this.ptr = 0;
    }
  }
}

// Re-export Languages as a named export
export { Languages };

// Default export
export default {
  Languages,
  Stemmer,
  init: initWasm,
  getWasmExports,
};
