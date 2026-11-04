/** Accept a hostname or a root HTTP(S) URL; store only the normalized hostname. */
export function normalizeCompanyDomain(value: string): string | null {
  const input = value.trim();
  if (!input) return null;
  const invalid = () => new Error("example.co.jp のようなドメイン名を入力してください。");
  if (/[\s\\?#]/.test(input)) throw invalid();
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`);
  } catch { throw invalid(); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || url.pathname !== '/') throw invalid();
  const domain = url.hostname.toLowerCase().replace(/\.$/, '');
  const labels = domain.split('.');
  if (domain.length > 253 || labels.length < 2 || labels.some(label => !/^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/.test(label)) || /^\d+$/.test(labels[labels.length - 1])) throw invalid();
  return domain;
}
