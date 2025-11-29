# readBinary(path)

Reads a file as an ArrayBuffer containing binary data.

## Signature

```typescript
/**
 * @param {string} path File path relative to the root directory.
 *
 * @throws
 */
readBinary(path: string): Promise<ArrayBuffer>
```

## Example

```typescript
const opfs = await OPFS.open();

const buffer = await opfs.readBinary("/data/image.png");
console.log(`Read ${buffer.byteLength} bytes`);
```
