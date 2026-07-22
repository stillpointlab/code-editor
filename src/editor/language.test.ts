import { afterEach, describe, expect, it, vi } from 'vitest';

import { findLanguage, loadLanguage } from './language';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('findLanguage', () => {
  it('resolves popular languages by name', () => {
    for (const name of ['python', 'javascript', 'json', 'html', 'css']) {
      expect(findLanguage(name), name).not.toBeNull();
    }
  });

  it('matches case-insensitively and via aliases', () => {
    expect(findLanguage('Python')).not.toBeNull();
    expect(findLanguage('TypeScript')).not.toBeNull();
    // "ts" is a registered alias/extension for TypeScript.
    expect(findLanguage('ts')).not.toBeNull();
  });

  it('returns null for unknown names', () => {
    expect(findLanguage('not-a-real-language')).toBeNull();
  });

  it('returns null for empty or missing input', () => {
    expect(findLanguage('')).toBeNull();
    expect(findLanguage(null)).toBeNull();
    expect(findLanguage(undefined)).toBeNull();
  });
});

describe('loadLanguage', () => {
  it('silently falls back when Firefox reports an interrupted dynamic import', async () => {
    const description = findLanguage('python');
    expect(description).not.toBeNull();
    if (!description) return;

    vi.spyOn(description, 'load').mockRejectedValueOnce(
      new TypeError('error loading dynamically imported module: http://localhost/chunk.js')
    );
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(loadLanguage('python')).resolves.toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('reports other grammar load failures while falling back to plain text', async () => {
    const description = findLanguage('python');
    expect(description).not.toBeNull();
    if (!description) return;

    const loadError = new TypeError('grammar initialization failed');
    vi.spyOn(description, 'load').mockRejectedValueOnce(loadError);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(loadLanguage('python')).resolves.toEqual([]);
    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith('Failed to load code editor language', loadError);
  });
});
