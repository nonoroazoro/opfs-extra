/**
 * Fix the types of OPFS API.
 */
interface FileSystemDirectoryHandle
{
    /**
     * Returns an async iterator of [name, handle] pairs for the entries in the directory.
     *
     * @example
     * for await (const [name, handle] of directoryHandle.entries()) {
     *   console.log(name, handle.kind);
     * }
     */
    entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>;

    /**
     * Returns an async iterator of entry names in the directory.
     *
     * @example
     * for await (const name of directoryHandle.keys()) {
     *   console.log(name);
     * }
     */
    keys(): AsyncIterableIterator<string>;

    /**
     * Returns an async iterator of entry handles in the directory.
     *
     * @example
     * for await (const handle of directoryHandle.values()) {
     *   console.log(handle.kind, handle.name);
     * }
     */
    values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;

    /**
     * Makes the directory handle iterable, same as calling entries().
     *
     * @example
     * for await (const [name, handle] of directoryHandle) {
     *   console.log(name, handle.kind);
     * }
     */
    [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>;
}
