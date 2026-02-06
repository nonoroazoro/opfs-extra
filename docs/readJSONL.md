# readJSONL(path)

Reads a JSONL file as a JSON Array.

## Signature

```typescript
/**
 * @param {string} path File path relative to the root directory.
 *
 * @throws
 */
readJSONL<T extends object>(path: string): Promise<T[]>
```

## Example

```typescript
const opfs = await OPFS.open();

const items = await opfs.readJSONL("/data/logs.jsonl");
console.log(items); // [{ id: 1 }, { id: 2 }, { id: 3 }]
```
