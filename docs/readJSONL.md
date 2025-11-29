# readJSONL(path[, encoding])

Reads a file as JSON lines (JSONL format).

## Parameters

- `path` `<string>`: File path relative to the root directory
- `encoding` `<string>`: _[Optional]_ Text encoding

## Returns

- `<Promise<T[]>>`: Array of parsed JSON objects

## Example

```typescript
const opfs = await OPFS.open();

const items = await opfs.readJSONL("/data/logs.jsonl");
console.log(items); // [{ id: 1 }, { id: 2 }, { id: 3 }]
```
