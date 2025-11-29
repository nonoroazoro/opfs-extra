# estimate()

Estimates storage usage and quota.

## Returns

- `<Promise<StorageEstimate>>`: Object containing `usage` and `quota` in bytes

## Example

```typescript
const opfs = await OPFS.open();

const { usage, quota } = await opfs.estimate();

console.log(`Using ${usage} bytes of ${quota} bytes`);
```
