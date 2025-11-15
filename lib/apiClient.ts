type FetchWithLogsOptions = RequestInit & { label?: string };

function parseRequestBody(body: RequestInit['body']) {
  if (!body) {
    return undefined;
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (_error) {
      return body;
    }
  }

  return body;
}

export async function fetchJsonWithLogs<T = unknown>(
  url: string,
  options: FetchWithLogsOptions = {}
): Promise<{ response: Response; data: T | null }> {
  const { label, ...fetchOptions } = options;
  const logLabel = label ?? url;

  const requestLog = {
    url,
    method: fetchOptions.method ?? 'GET',
    headers: fetchOptions.headers,
    body: parseRequestBody(fetchOptions.body),
  };

  console.log('[API][Request]', logLabel, requestLog);

  const response = await fetch(url, fetchOptions);

  const contentType = response.headers.get('content-type') || '';
  const responseLog: Record<string, unknown> = {
    url,
    status: response.status,
    ok: response.ok,
  };

  let data: T | null = null;

  if (contentType.includes('application/json')) {
    try {
      const cloned = response.clone();
      data = (await cloned.json()) as T;
      responseLog.data = data;
    } catch (error) {
      responseLog.dataParseError =
        error instanceof Error ? error.message : String(error);
    }
  } else {
    responseLog.note = 'Non-JSON response';
  }

  console.log('[API][Response]', logLabel, responseLog);

  return { response, data };
}


