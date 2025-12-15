export const fetchWithTimeout = async (
  resource: RequestInfo | URL,
  options: RequestInit = {}
) => {
  const { timeout = 5000 } = options as any;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};
