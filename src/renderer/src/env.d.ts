/// <reference types="vite/client" />

interface Window {
  mcp: {
    read: (path: string) => Promise<string>;
    write: (path: string, content: string) => Promise<void>;
    search: (query: string, limit?: number) => Promise<any>;
    list: (path: string) => Promise<any>;
    summarize: (path: string) => Promise<string>;
    batchTag: (tag: string, pattern: string) => Promise<void>;
  };
}
