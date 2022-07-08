class ImageFileSize {
    async setup() {
        this.tsvs = []
        const base = `asset/image/monacoin`
        const paths = ['svg', 'png/64', 'png/256'].map(p=>`${base}/${p}/list.tsv`)
        for (const p of paths) {
            const res = await fetch(p)
            const txt = await res.text()
            const tsv = txt.split(/\r\n|\n/).filter(v=>v).map(line=>line.split('\t'))
            this.tsvs.push(tsv)
        }
        console.debug(this.tsvs)
    }
    get Tsvs() { return this.tsvs }
    show(query='#all-file-size') {
        document.querySelector(query).innerText = this.unit(this.calc())
    }
    calc() {
        let sum = 0
        const formats = Array.prototype.slice.call(document.querySelectorAll(`input[type=radio][name=img-format]`)).filter(e=>e.checked)[0].value.split(',')
        const sizes = document.querySelector(`#img-file-sizes`).value.split(',')
        const files = Array.prototype.slice.call(document.querySelectorAll(`input[type=checkbox][name=img-files]`)).filter(e=>e.checked).map(e=>e.value)
        const tsvs = []
        if (formats.includes('svg')) { tsvs.push(this.tsvs[0]) }
        if (formats.includes('png')) {
            if (sizes.includes('64')) { tsvs.push(this.tsvs[1]) }
            if (sizes.includes('256')) { tsvs.push(this.tsvs[2]) }
        }
        for (const file of files) {
            for (const tsv of tsvs) {
                for (const line of tsv) {
                    if (file === line[0].split('.').slice(0, -1).join('.')) {
                        sum += parseInt(line[2])
                    }
                }
            }
        }
        return sum
    }
    unit(value) { // B, KB, MB, GB
        const units = ['G', 'M', 'K']
        //let v = value / (1000*3)
        for (let i=units.length; 0<i; i--) {
            const v = value / (1000**i)
            if (1<=v) { return v.toFixed(2) + ' ' + units[units.length-i] + 'B' }
        }
        return value + ' ' + 'B'
    }
}
