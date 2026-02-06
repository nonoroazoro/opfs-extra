import { EOL_LF, EOL_REGEX } from "./constants";

export class OPFS
{
    private static _instance: OPFS | undefined;

    private _root: FileSystemDirectoryHandle;
    private constructor(root: FileSystemDirectoryHandle)
    {
        this._root = root;
    }

    /**
     * Opens access to the Origin Private File System.
     *
     * @throws
     */
    static async open(): Promise<OPFS>
    {
        if (!OPFS._instance)
        {
            const root = await navigator.storage.getDirectory();
            OPFS._instance = new OPFS(root);
        }
        return OPFS._instance;
    }

    /**
     * Gets the root directory handle.
     */
    get root()
    {
        return this._root;
    }

    /**
     * Estimates storage usage and quota.
     */
    async estimate(): Promise<StorageEstimate>
    {
        try
        {
            return navigator.storage.estimate();
        }
        catch
        {
            return { quota: 0, usage: 0 };
        }
    }

    /**
     * Gets a handle to a file.
     *
     * @param {string} path File path relative to the root directory.
     * @param {FileSystemGetFileOptions} [options] Options for retrieving the file handle.
     *
     * @throws
     */
    async getFileHandle(path: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>
    {
        const segments = this._pathToSegments(path);
        if (segments.length === 0)
        {
            throw new Error("File path is not valid");
        }
        const dir = await this._getLastDirectoryHandle(segments, options?.create);
        return dir.getFileHandle(segments[segments.length - 1], { create: options?.create });
    }

    /**
     * Gets a handle to a directory.
     *
     * @param {string} path Directory path relative to the root directory.
     * @param {FileSystemGetDirectoryOptions} [options] Options for retrieving the directory handle.
     *
     * @throws
     */
    async getDirectoryHandle(path: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>
    {
        const segments = this._pathToSegments(path);
        if (segments.length === 0)
        {
            return this._root;
        }
        const dir = await this._getLastDirectoryHandle(segments, options?.create);
        return dir.getDirectoryHandle(segments[segments.length - 1], { create: options?.create });
    }

    /**
     * Creates a writable stream that is ready for high-performance appending.
     *
     * This is equivalent to call {@link FileSystemFileHandle.createWritable} under the following conditions:
     * - create with `keepExistingData: true`;
     * - set `cursor` to the end of the file.
     *
     * @param {string} path File path relative to the root directory.
     *
     * @throws
     */
    async createAppendable(path: string)
    {
        const handle = await this.getFileHandle(path, { create: true });
        const writable = await handle.createWritable({ keepExistingData: true });
        try
        {
            const position = (await handle.getFile()).size;
            await writable.seek(position);
        }
        catch (error)
        {
            await writable.abort();
            throw error;
        }
        return writable;
    }

    /**
     * Reads a file as an {@link ArrayBuffer} that contains the file data in binary form.
     *
     * @param {string} path File path relative to the root directory.
     *
     * @throws
     */
    async readBinary(path: string): Promise<ArrayBuffer>
    {
        const handle = await this.getFileHandle(path);
        const file = await handle.getFile();
        return file.arrayBuffer();
    }

    /**
     * Reads a file as plain text.
     *
     * @param {string} path File path relative to the root directory.
     *
     * @throws
     */
    async readText(path: string): Promise<string>
    {
        const handle = await this.getFileHandle(path);
        const file = await handle.getFile();
        return file.text();
    }

    /**
     * Reads a file as a JSON object.
     *
     * @template T Type of the JSON object.
     * @param {string} path File path relative to the root directory.
     *
     * @throws
     */
    async readJSON<T extends object>(path: string): Promise<T>
    {
        const text = await this.readText(path);
        return JSON.parse(text) as T;
    }

    /**
     * Reads a JSONL file as a JSON Array.
     *
     * @template T Type of the JSON object.
     * @param {string} path File path relative to the root directory.
     *
     * @throws
     */
    async readJSONL<T extends object>(path: string): Promise<T[]>
    {
        const text = await this.readText(path);
        return text.trim().split(EOL_REGEX).reduce<T[]>((acc, line) =>
        {
            const trimmed = line.trim();
            if (trimmed !== "")
            {
                acc.push(JSON.parse(trimmed));
            }
            return acc;
        }, []);
    }

    /**
     * Writes to a file.
     *
     * Creates the parent directories and file if they do not exist.
     *
     * @param {string} path File path relative to the root directory.
     * @param {FileSystemWriteChunkType} data Data to write.
     * @param {FileSystemCreateWritableOptions} [options] Options for writing file.
     *
     * @throws
     */
    async writeFile(
        path: string,
        data: FileSystemWriteChunkType,
        options?: FileSystemCreateWritableOptions
    ): Promise<void>
    {
        const handle = await this.getFileHandle(path, { create: true });
        const writable = await handle.createWritable(options);
        try
        {
            await writable.write(data);
            await writable.close();
        }
        catch (error)
        {
            await writable.abort();
            throw error;
        }
    }

    /**
     * Appends data to a file.
     *
     * Creates the file if it does not exist.
     *
     * @param {string} path File path relative to the root directory.
     * @param {FileSystemWriteChunkType} data Data to append.
     *
     * @throws
     */
    async appendFile(path: string, data: FileSystemWriteChunkType): Promise<void>
    {
        const handle = await this.getFileHandle(path, { create: true });
        const writable = await handle.createWritable({ keepExistingData: true });
        try
        {
            const position = (await handle.getFile()).size;
            await writable.seek(position);
            await writable.write(data);
            await writable.close();
        }
        catch (error)
        {
            await writable.abort();
            throw error;
        }
    }

    /**
     * Appends JSON data to a JSONL file.
     *
     * @param {string} path File path relative to the root directory.
     * @param {unknown} data Data to write.
     *
     * @throws
     */
    async appendJSONL(path: string, data: unknown): Promise<void>
    {
        await this.appendFile(path, JSON.stringify(data) + EOL_LF);
    }

    /**
     * Writes JSON data to a file.
     *
     * Creates the parent directories and file if they do not exist.
     *
     * @param {string} path File path relative to the root directory.
     * @param {unknown} data Data to write.
     * @param {({ pretty?: boolean; } & FileSystemCreateWritableOptions)} [options] Options for writing file.
     *
     * @throws
     */
    async writeJSON(
        path: string,
        data: unknown,
        options?: { pretty?: boolean; } & FileSystemCreateWritableOptions
    ): Promise<void>
    {
        const json = options?.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        await this.writeFile(path, json, { keepExistingData: options?.keepExistingData });
    }

    /**
     * Truncates a file to a specified size.
     *
     * @param {string} path File path relative to the root directory.
     * @param {number} size A number specifying the number of bytes to resize to.
     *
     * @throws
     */
    async truncate(path: string, size: number): Promise<void>
    {
        const handle = await this.getFileHandle(path, { create: true });
        const writable = await handle.createWritable({ keepExistingData: true });
        try
        {
            await writable.truncate(size);
            await writable.close();
        }
        catch (error)
        {
            await writable.abort();
            throw error;
        }
    }

    /**
     * Creates a directory.
     *
     * Creates parent directories if they do not exist.
     *
     * @param {string} path Directory path relative to the root directory.
     *
     * @throws
     */
    async mkdir(path: string): Promise<void>
    {
        await this.getDirectoryHandle(path, { create: true });
    }

    /**
     * Reads the directory contents as names.
     *
     * @param {string} path Directory path relative to the root directory.
     *
     * @throws
     */
    async readdir(path: string): Promise<string[]>
    {
        const handle = await this.getDirectoryHandle(path);
        return Array.fromAsync(handle.keys());
    }

    /**
     * Reads the directory contents as handles.
     *
     * @param {string} path Directory path relative to the root directory.
     *
     * @throws
     */
    async readdirHandles(path: string): Promise<Array<FileSystemDirectoryHandle | FileSystemFileHandle>>
    {
        const handle = await this.getDirectoryHandle(path);
        return Array.fromAsync(handle.values());
    }

    /**
     * Tests whether or not the file or directory at the given path exists.
     *
     * @param {string} path File or directory path relative to the root directory.
     */
    async exists(path: string): Promise<boolean>
    {
        const segments = this._pathToSegments(path);
        if (segments.length === 0)
        {
            return true;
        }
        try
        {
            const parent = await this._getLastDirectoryHandle(segments);
            const name = segments[segments.length - 1];
            try
            {
                await parent.getFileHandle(name);
                return true;
            }
            catch
            {
                await parent.getDirectoryHandle(name);
                return true;
            }
        }
        catch
        {
            return false;
        }
    }

    /**
     * Removes a file or directory.
     *
     * If the path is the root directory or the path does not exist, silently does nothing.
     *
     * @param {string} path File or directory path relative to the root directory.
     *
     * @throws
     */
    async remove(path: string): Promise<void>
    {
        const segments = this._pathToSegments(path);
        if (segments.length === 0)
        {
            return;
        }
        try
        {
            const parent = await this._getLastDirectoryHandle(segments);
            await parent.removeEntry(segments[segments.length - 1], { recursive: true });
        }
        catch (error)
        {
            // Ignore NotFoundError.
            if (error instanceof DOMException && error.name === "NotFoundError")
            {
                return;
            }
            throw error;
        }
    }

    /**
     * Empties a directory by deleting all its contents while keeping the directory itself.
     *
     * Creates the directory if it does not exist.
     *
     * @param {string} path Directory path relative to the root directory.
     *
     * @throws
     */
    async emptyDir(path: string): Promise<void>
    {
        const handle = await this.getDirectoryHandle(path, { create: true });
        for await (const name of handle.keys())
        {
            await handle.removeEntry(name, { recursive: true });
        }
    }

    /**
     * Gets the handle of the last directory in the path segments.
     */
    private async _getLastDirectoryHandle(segments: string[], create = false): Promise<FileSystemDirectoryHandle>
    {
        let dir = this._root;
        for (let i = 0; i < segments.length - 1; i++)
        {
            dir = await dir.getDirectoryHandle(segments[i], { create });
        }
        return dir;
    }

    /**
     * Converts a path into segments.
     *
     * Note: Path is always relative to the root directory.
     * The `..` segments are resolved, and the path is clamped to the root directory.
     *
     * Examples:
     * - "/foo/bar/baz.txt" -> ["foo", "bar", "baz.txt"] -> root/foo/bar/baz.txt
     * - "/foo/bar/" -> ["foo", "bar"] -> root/foo/bar/
     * - "/foo/bar" -> ["foo", "bar"] -> root/foo/bar
     * - "foo/bar/../../baz" -> ["baz"] -> root/baz
     * - "../../foo" -> ["foo"] -> root/foo
     * - "/" -> [] -> root
     * - "." -> [] -> root
     * - "./" -> [] -> root
     * - ".." -> [] -> root
     */
    private _pathToSegments(path: string): string[]
    {
        const parts = path.split("/").filter(s => s !== "." && s !== "");
        const segments: string[] = [];
        for (const part of parts)
        {
            if (part === "..")
            {
                if (segments.length > 0)
                {
                    segments.pop();
                }
            }
            else
            {
                segments.push(part);
            }
        }
        return segments;
    }
}
