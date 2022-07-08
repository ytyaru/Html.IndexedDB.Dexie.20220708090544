class UseDexie {
    constructor() {
        this.createDb()
    }
    createDb() {
        this.dexie = new Dexie(`UsersDb`);
        this.dexie.version(1).stores({
            users: `++id, name`
        });
    }
    async insert() {
        const now = new Date()
        this.dexie.users.add({name:'ytyaru', created:now, updated:now}).catch((e)=>{console.error(e);});
    }
    async upsert() {
        const now = new Date()
        this.dexie.users.put({name:'hoge', updated:now}).catch((e)=>{console.error(e);});
    }
    async update() {
        const now = new Date()
        this.dexie.users.where(`name`).equals(`hoge`).modify({name:'hoge-update', updated:now}).catch((e)=>{console.error(e);});
    }
    async clear() { await this.dexie.users.clear() }
    async delete() {
        const ids = await this.dexie.users.where(`name`).equals(`ytyaru`).toArray()
        console.debug(ids)
        this.dexie.users.bulkDelete(ids.map(r=>r.id))
    }
    async gets() { return await this.dexie.users.toArray() }
    async get() { return await this.dexie.users.get(`1`) }
    async where() { return await this.dexie.users.where(`name`).equal(`ytyaru`).toArray() }
}
