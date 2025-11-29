# createAppendable(path)

Creates a writable stream ready for `high-performance` appending, _creates file and parent directories automatically if needed._

## Parameters

- `path` `<string>`: File path relative to the root directory

## Returns

- `<Promise<FileSystemWritableFileStream>>`: Writable stream positioned at end of file

## Example

```typescript
const opfs = await OPFS.open();

const appendable = await opfs.createAppendable("/data/stream.txt");

await appendable.write("Line 1\n");
await appendable.write("Line 2\n");
await appendable.write("Line 3\n");

await appendable.close();
```
