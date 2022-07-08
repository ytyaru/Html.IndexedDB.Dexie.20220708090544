class Sqlite3DbFile { // FileSystemAccess API は Chromeでしか使えない
    #dirHandle = null
    constructor() {
        //this.PATH_WASM = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.7.0`
        this.PATH_WASM = `lib/sql.js/1.7.0`
        this.name = 'users.db'
        this.#makeDexie()
    }
    #makeDexie() {
        this.dexie = new Dexie(`UsersDb`);
        this.dexie.version(1).stores({
            dirs: `++id`  // 一番最初に来るnameがキー。ageがインデックス。
        });
    }
    async load() {
        //const dirs = await this.dexie.dirs.toArray()
        //console.debug(dirs)
        //this.#dirHandle = (0 < dirs.length) ? dirs[0] : null
        const dirs = await this.dexie.dirs.toArray()
        this.#dirHandle = (0 < dirs.length) ? dirs[0] : null
        console.debug(this.#dirHandle)
        if (this.#dirHandle) { await this.read() }
    }
    get DirHandle() { return this.#dirHandle }
    async write() {
        const dirHandle = await this.#getDirectoryPicker()
        if (!dirHandle) return
        try {
            const fileHandle = await dirHandle.getFileHandle(this.name, {
                create: true,
            })
            const writable = await fileHandle.createWritable()
            await writable.write(this.db.export())
            await writable.close()
        } catch (e) {
            console.error(e)
        }
    }
    async read() {
        const dirHandle = await this.#getDirectoryPicker()
        if (!dirHandle) { return }
        console.debug(dirHandle)
        const fileHandle = await dirHandle.getFileHandle(this.name)
        const file = await fileHandle.getFile()
        const arrayBuffer = await file.arrayBuffer()
        const dbAsUint8Array = new Uint8Array(arrayBuffer)
        if (!this.SQL) {
            //this.SQL = await initSqlJs({locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`})
            this.SQL = await initSqlJs({locateFile: file => `${this.PATH_WASM}/${file}`})
        }
        this.db = new this.SQL.Database(dbAsUint8Array)
        document.getElementById(`update`).disabled = false
        return this.db
    }
    /*
    async SQL() {
        if (!this.SQL) {
            //this.SQL = await initSqlJs({locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`})
            this.SQL = await initSqlJs({locateFile: file => `${this.PATH_WASM}/${file}`})
        }
        return this.SQL
    }
    */
    async #getDirectoryPicker() {
        if (this.#dirHandle) { return this.#dirHandle }
        try {
            this.#dirHandle = await window.showDirectoryPicker()
            this.dexie.dirs.put({handle:this.#dirHandle}).catch((e)=>{console.error(e);});
            return this.#dirHandle
        } catch (e) {
            console.error(e)
        }
    }
    async newSql() {
        //this.SQL = await initSqlJs({locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`})
        return await initSqlJs({locateFile: file => `${this.PATH_WASM}/${file}`})
    }
}
