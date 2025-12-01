# readJSON(path, encoding?)

Reads a file as a JSON object.

## Signature

```typescript
/**
 * @param {string} path File path relative to the root directory.
 * @param {string} [encoding] Text encoding.
 *
 * @throws
 */
readJSON<T extends object>(path: string, encoding?: string): Promise<T>
```

## Example

```typescript
const opfs = await OPFS.open();

const data = await opfs.readJSON("/data/config.json");
console.log(data); // { name: "example", version: "1.0.0" }
```
