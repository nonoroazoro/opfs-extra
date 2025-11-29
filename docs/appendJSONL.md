# appendJSONL(path, data)

Appends JSON data as JSON Line format to a file, _creates file and parent directories automatically if needed._

## Parameters

- `path` `<string>`: File path relative to the root directory
- `data` `<unknown>`: Data to append

## Example

```typescript
const opfs = await OPFS.open();

await opfs.appendJSONL("/data/logs.jsonl", { id: 1, message: "First" });
await opfs.appendJSONL("/data/logs.jsonl", { id: 2, message: "Second" });
await opfs.appendJSONL("/data/logs.jsonl", { id: 3, message: "Third" });

const items = await opfs.readJSONL("/data/logs.jsonl");
console.log(items); // [{ id: 1, ... }, { id: 2, ... }, { id: 3, ... }]
```
