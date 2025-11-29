# readBinary(path)

Reads a file as an ArrayBuffer containing binary data.

## Parameters

- `path` `<string>`: File path relative to the root directory

## Returns

- `<Promise<ArrayBuffer>>`

## Example

```typescript
const opfs = await OPFS.open();

const buffer = await opfs.readBinary("/data/image.png");
console.log(`Read ${buffer.byteLength} bytes`);
```
