# open()

Opens access to the Origin Private File System, _throws if OPFS is not supported._

## Signature

```typescript
/**
 * @throws
 */
static open(): Promise<OPFS>
```

## Example

```typescript
import { OPFS } from "opfs-extra";

const opfs = await OPFS.open();
```
