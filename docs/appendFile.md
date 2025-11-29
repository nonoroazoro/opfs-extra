# appendFile(path, data)

Appends data to a file, _creates file and parent directories automatically if needed._

## Parameters

- `path` `<string>`: File path relative to the root directory
- `data` `<FileSystemWriteChunkType>`: Data to append

## Example

```typescript
const opfs = await OPFS.open();

await opfs.appendFile("/data/log.txt", "Line 1\n");
await opfs.appendFile("/data/log.txt", "Line 2\n");
await opfs.appendFile("/data/log.txt", "Line 3\n");

const content = await opfs.readText("/data/log.txt");
console.log(content); // "Line 1\nLine 2\nLine 3\n"
```
