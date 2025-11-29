# appendJSONL(path, data)

Appends JSON data as JSON Line format to a file, _creates file and parent directories automatically if needed._

## Signature

```typescript
/**
 * @param {string} path File path relative to the root directory.
 * @param {unknown} data Data to write.
 *
 * @throws
 */
appendJSONL(path: string, data: unknown): Promise<void>
```

## Example

```typescript
const opfs = await OPFS.open();

await opfs.appendJSONL("/data/logs.jsonl", { id: 1, message: "First" });
await opfs.appendJSONL("/data/logs.jsonl", { id: 2, message: "Second" });
await opfs.appendJSONL("/data/logs.jsonl", { id: 3, message: "Third" });

const items = await opfs.readJSONL("/data/logs.jsonl");
console.log(items); // [{ id: 1, ... }, { id: 2, ... }, { id: 3, ... }]
```
