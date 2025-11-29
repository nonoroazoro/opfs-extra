# readText(path[, encoding])

Reads a file as plain text.

## Parameters

- `path` `<string>`: File path relative to the root directory
- `encoding` `<string>`: _[Optional]_ Text encoding

## Returns

- `<Promise<string>>`

## Example

```typescript
const opfs = await OPFS.open();

const text = await opfs.readText("/data/hello.txt");
console.log(text); // "Hello World"
```
