# Blueprint — knowledge

**Route:** `/_app/knowledge`
**Source:** `apps/frontend/src/routes/_app/knowledge.tsx`
**Lines:** 1259 | **Size:** 36KB
**API:** `knowledge.list()`, `knowledge.createSource()`, `knowledge.uploadSourceFile()`, `knowledge.retrievalTest()`, `ai.getProviders()`

## Fungsi
Knowledge base management — CRUD sources (markdown, PDF, website, image, audio, sheet), FAQs, file uploads, drag-and-drop, RAG retrieval testing.

## Layout
```
┌────────────────────┬─────────────────────────────────────┐
│ Source List         │ RAG Retrieval Testing               │
│ (left panel)       │                                     │
│ • Source cards      │ [Embedding model selector]          │
│   - Type icon      │ [Retrieval model selector]          │
│   - Name, size     │ [Query input] [Run Query]           │
│   - Chunks count   │                                     │
│   - Status badge   │ Answer + Retrieval Chunks           │
│                    │ • Score, source, snippet             │
│ [Upload] [URL]     │ • Meta (latency, tokens, cost)      │
└────────────────────┴─────────────────────────────────────┘
```

## Source types
| Type | Icon | Color |
|------|------|-------|
| `md` | BookText | Blue |
| `pdf` | FileText | Rose |
| `site` | Globe | Violet |
| `img` | Image | Amber |
| `sheet` | Sheet | Emerald |
| `audio` | AudioLines | Purple |

## Key behaviors
- File upload: click or drag-and-drop → `uploadSourceFile()`
- URL source: prompt → validate http/https → `createSource()`
- Embedding model: persisted localStorage (`opencrm.knowledge.embedding_model`)
- RAG test: query → `retrievalTest()` → answer + top chunks with scores
- Chunk estimation: `ceil(content.length / 220)`
