# exists(path)

Tests whether a file or directory exists at the given path.

## Parameters

- `path` `<string>`: File or directory path relative to the root directory

## Returns

- `<Promise<boolean>>`: `true` if the file or directory exists, `false` otherwise

## Example

```typescript
const opfs = await OPFS.open();

await opfs.writeFile("/data/file.txt", "content");

console.log(await opfs.exists("/data")); // true
console.log(await opfs.exists("/data/file.txt")); // true
console.log(await opfs.exists("/data/missing.txt")); // false
```
