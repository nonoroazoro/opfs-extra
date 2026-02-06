# readText(path)

Reads a file as plain text.

## Signature

```typescript
/**
 * @param {string} path File path relative to the root directory.
 *
 * @throws
 */
readText(path: string): Promise<string>
```

## Example

```typescript
const opfs = await OPFS.open();

const text = await opfs.readText("/data/hello.txt");
console.log(text); // "Hello World"
```
