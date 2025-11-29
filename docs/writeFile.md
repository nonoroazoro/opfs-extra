# writeFile(path, data[, options])

Writes data to a file, _creates file and parent directories automatically if needed._

## Signature

```typescript
/**
 * @param {string} path File path relative to the root directory.
 * @param {FileSystemWriteChunkType} data Data to write.
 * @param {FileSystemCreateWritableOptions} [options] Options for writing file.
 *
 * @throws
 */
writeFile(
  path: string,
  data: FileSystemWriteChunkType,
  options?: FileSystemCreateWritableOptions
): Promise<void>
```

## Example

```typescript
const opfs = await OPFS.open();

// Write string
await opfs.writeFile("/data/hello.txt", "Hello World");

// Write binary data
const buffer = new Uint8Array([1, 2, 3, 4]);
await opfs.writeFile("/data/data.bin", buffer);
```
