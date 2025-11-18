import { NetworkError } from '@/lib/errors/NetworkError';

import { getErrorText } from './errors';

/** fetchJson -- a json data request sample. */
export async function fetchJson<T = unknown>(input: RequestInfo, init?: RequestInit): Promise<T> {
  let data: T | undefined = undefined;
  let dataStr: string = '';

  try {
    const res = await fetch(input, init);
    const { ok, status, statusText } = res;

    try {
      dataStr = await res.text();
      data = JSON.parse(dataStr) as T;
    } catch (
      _e // eslint-disable-line @typescript-eslint/no-unused-vars
    ) {
      // NOOP // TODO: To generate an error?
    }

    if (!ok || status !== 200) {
      const errMsg = [`Error: ${status}`, statusText].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[requests:fetchJson] response error', errMsg, {
        data,
        dataStr,
        statusText,
        status,
        ok,
        res,
        input,
        init,
      });
      // debugger; // eslint-disable-line no-debugger
      throw new NetworkError(errMsg);
    }
    if (data == undefined) {
      const errMsg = 'No data returned';
      // eslint-disable-next-line no-console
      console.error('[requests:fetchJson] data error', errMsg, {
        data,
        dataStr,
        statusText,
        status,
        res,
        input,
        init,
      });
      // debugger; // eslint-disable-line no-debugger
      throw new NetworkError(errMsg);
    }

    return data;
  } catch (error) {
    const errMsg = [
      // Get combined error message
      'Can not fetch network data',
      getErrorText(error),
    ]
      .filter(Boolean)
      .join(': ');
    // eslint-disable-next-line no-console
    console.error('[api/methods/fetchServerData] caught error', errMsg, {
      error,
      data,
      dataStr,
      input,
      init,
    });
    // debugger; // eslint-disable-line no-debugger
    throw new NetworkError(errMsg);
  }
}
