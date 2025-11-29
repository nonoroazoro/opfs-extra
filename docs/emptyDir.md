# emptyDir(path)

Empties a directory by deleting all its contents while keeping the directory itself, _creates directory automatically if needed._

## Signature

```typescript
/**
 * @param {string} path Directory path relative to the root directory.
 *
 * @throws
 */
emptyDir(path: string): Promise<void>
```

## Example

```typescript
const opfs = await OPFS.open();

await opfs.writeFile("/data/file1.txt", "content");
await opfs.writeFile("/data/file2.txt", "content");

await opfs.emptyDir("/data");

const files = await opfs.readdir("/data");
console.log(files); // []
```
