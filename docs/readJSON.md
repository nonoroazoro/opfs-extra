# readJSON(path[, encoding])

Reads a file as a JSON object.

## Parameters

- `path` `<string>`: File path relative to the root directory
- `encoding` `<string>`: _[Optional]_ Text encoding

## Returns

- `<Promise<T>>`: Parsed JSON object

## Example

```typescript
const opfs = await OPFS.open();

const data = await opfs.readJSON("/data/config.json");
console.log(data); // { name: "example", version: "1.0.0" }
```
