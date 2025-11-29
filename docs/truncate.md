# truncate(path, size)

Truncates a file to a specified size, _creates file and parent directories automatically if needed._

## Parameters

- `path` `<string>`: File path relative to the root directory
- `size` `<number>`: Number of bytes to resize to

## Example

```typescript
const opfs = await OPFS.open();

await opfs.writeFile("/data/file.txt", "Hello World");

// Truncate to 5 bytes
await opfs.truncate("/data/file.txt", 5);

const content = await opfs.readText("/data/file.txt");
console.log(content); // "Hello"
```
