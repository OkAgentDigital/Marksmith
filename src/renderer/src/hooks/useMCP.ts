export function useMCP() {
  const read = async (path: string) => window.mcp.read(path);
  const write = async (path: string, content: string) => window.mcp.write(path, content);
  const search = async (query: string, limit?: number) => window.mcp.search(query, limit);
  const list = async (path: string) => window.mcp.list(path);
  const summarize = async (path: string) => window.mcp.summarize(path);
  const batchTag = async (tag: string, pattern: string) => window.mcp.batchTag(tag, pattern);

  return { read, write, search, list, summarize, batchTag };
}