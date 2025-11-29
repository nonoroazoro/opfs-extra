# exists(path)

Tests whether a file or directory exists at the given path.

## Signature

```typescript
/**
 * @param {string} path File or directory path relative to the root directory.
 */
exists(path: string): Promise<boolean>
```

## Example

```typescript
const opfs = await OPFS.open();

await opfs.writeFile("/data/file.txt", "content");

console.log(await opfs.exists("/data")); // true
console.log(await opfs.exists("/data/file.txt")); // true
console.log(await opfs.exists("/data/missing.txt")); // false
```
