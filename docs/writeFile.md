# writeFile(path, data[, options])

Writes data to a file, _creates file and parent directories automatically if needed._

## Parameters

- `path` `<string>`: File path relative to the root directory
- `data` `<FileSystemWriteChunkType>`: Data to write
- `options` `<FileSystemCreateWritableOptions>`: _[Optional]_ Options for writing file

## Example

```typescript
const opfs = await OPFS.open();

// Write string
await opfs.writeFile("/data/hello.txt", "Hello World");

// Write binary data
const buffer = new Uint8Array([1, 2, 3, 4]);
await opfs.writeFile("/data/data.bin", buffer);
```
