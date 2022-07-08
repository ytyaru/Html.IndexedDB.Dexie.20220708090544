class ZipDownloader {
    constructor() {
        this.dependents = ['lib/toastify/1.11.2/min.css', 'lib/toastify/1.11.2/min.js', 'js/toaster.js', 'lib/party/party.min.js', 'js/party-sparkle-image.js', 'js/party-sparkle-hart.js']
    }
    async download(selectedImgId=null) {
        Loading.show()
        this.zip = new JSZip()
        await Promise.all([this.#makeHtmlFiles(), this.#makeJsFiles(), this.#makeImageFiles()])
        const file = await this.zip.generateAsync({type:'blob', platform:this.#getOs()})
        const url = (window.URL || window.webkitURL).createObjectURL(file);
        const download = document.createElement('a');
        download.href = url;
        download.download = 'mpurse-send-button.zip';
        download.click();
        (window.URL || window.webkitURL).revokeObjectURL(url);
        Loading.hide()
        this.#toast(`ZIPファイルをダウンロードしました！`)
    }
    async #makeHtmlFiles() {
        const head = `<head><meta charset="UTF-8"><title>投げモナボタン</title>${this.#makeLoad()}</head>`
        const docs = await this.#makeNote()
        const body = `<body>
${docs}
</body>`
        const html = `<!DOCTYPE html>
${head}
${body}`
        this.zip.file('index.html', html)
        this.zip.file('article-1.html', html)
    }
    async #makeJsFiles() {
        for (const file of this.dependents) {
            this.zip.file(file, await this.#getData(file))
        }
        this.zip.file('js/mpurse-send-button.js', await new MpurseSendButtonGenerator().getScript())
        //this.zip.file('server.sh', await this.#getData('server.sh'), {unixPermissions: "755"})
        this.zip.file('server.sh', await this.#getData('server.sh'), {unixPermissions: "0100755"})
        this.zip.file('run_server.py', await this.#getData('run_server.py'))
    }
    async #makeImageFiles() {
        const base = document.getElementById(`base-url`).value.split('/').filter(v=>v).filter(v=>'.'!==v && '..'!==v).join('/')
        //if (!base.endsWith('/')) { base += '/' }
        const files = Array.prototype.slice.call(document.querySelectorAll(`input[type=checkbox][name=img-files]`)).filter(e=>e.checked).map(e=>e.value)
        console.debug(files)
        const formats = Array.prototype.slice.call(document.querySelectorAll(`input[type=radio][name=img-format]`)).filter(e=>e.checked)[0].value.split(',')
        const sizes = document.querySelector(`#img-file-sizes`).value.split(',')
        const promises = []
        for (const file of files) {
            for (const format of formats) {
                const [createPaths, sourcePaths] = this.#getImgPaths(base, file, format, sizes)
                console.debug(createPaths, sourcePaths)
                for (let i=0; i<createPaths.length; i++) {
                    //this.zip.file(createPaths[i], await this.#getData(sourcePaths[i], ('svg'!==format)))
                    promises.push(this.#getDataWithPath(sourcePaths[i], ('svg'!==format), createPaths[i]))
                }
            }
        }
        const contents = await Promise.all(promises)
        for (const content of contents) {
            this.zip.file(content.path, content.content)
        }
    }
    #getImgPaths(base, file, format, sizes) {
        const hasSizeDir = ('svg'===format) ? false : true
        const createFilePaths = sizes.map(size=>`${base}/${format}/${(hasSizeDir) ? size+"/" : ''}${file}.${format}`)
        const sourceFilePaths = sizes.map(size=>`./asset/image/monacoin/${format}/${(hasSizeDir) ? size+"/" : ''}${file}.${format}`)
        return [createFilePaths, sourceFilePaths]
    }
    async #getData(url, isBin=false) {
        const res = await fetch(url)
        return await res[(isBin) ? 'blob' : 'text']()
        //return (isBin) ? await res.blob() : await res.text()
    }
    async #getDataWithPath(url, isBin, path) {
        const res = await fetch(url)
        const obj = {}
        obj.path = path
        obj.content = await res[(isBin) ? 'blob' : 'text']()
        return obj
    }
    #toast(message) {
        if (Toastify) { Toastify({text: message, position:'center'}).showToast(); }
        else { alert(message) }
    }
    #makeLoad() {
        const depends = this.dependents.map(f=>(f.endsWith('css')) ? this.#makeLinkCss(f) : this.#makeScript(f))
        depends.push(this.#makeScript(`js/mpurse-send-button.js`)) 
        return depends.join('\n')
    }
    #makeScript(path) { return `<script src="${path}"></script>` }
    #makeLinkCss(path) { return `<link rel="stylesheet" type="text/css" href="${path}">` }
    #makeMpurseSendButtons() {
        const simple = `<mpurse-send-button></mpurse-send-button>`
        const fullAttrs = new MpurseSendButtonGenerator().makeMpurseSendButton()
        return `${simple}${fullAttrs}`
    }
    async #makeNote() {
        const res = await fetch(`/asset/content/document.md`)
        console.debug(res)
        let md = await res.text()
        const table = this.#makeInnerImageTable()
        console.debug(table)
        md = md.replace('//-----inner-img-table-----//', table)
        md = md.replace('//-----mpurse-send-button-----//', this.#makeMpurseSendButtons())
        console.debug(md)
        await markdown.ready;
        return markdown.parse(md);
    }
    #makeInnerImageTable() {
        const base = document.getElementById(`base-url`).value.split('/').filter(v=>v).filter(v=>'.'!==v && '..'!==v).join('/')
        const files = Array.prototype.slice.call(document.querySelectorAll(`input[type=checkbox][name=img-files]`)).filter(e=>e.checked).map(e=>e.value)
        const formats = Array.prototype.slice.call(document.querySelectorAll(`input[type=radio][name=img-format]`)).filter(e=>e.checked)[0].value.split(',')
        const sizes = document.querySelector(`#img-file-sizes`).value.split(',')

        const ths = [`<th><code>src-id</code></th>`]
        for (const format of formats) {
            if ('svg'===format) { ths.push(`<th>${format}</th>`) }
            else {
                for (const size of sizes) {
                    ths.push(`<th>${format} ${size}</th>`) 
                }
            }
        }
        const trs = []
        for (const file of files) {
            const tds = [`<th>${file}</th>`]
            for (const format of formats) {
                const hasSizeDir = ('svg'===format) ? false : true
                if (hasSizeDir) {
                    for (const size of sizes) {
                        const path = `${base}/${format}/${size}/${file}.${format}`
                        //tds.push(`<td><img src="${path}" width="64" height="64"></td>`)
                        tds.push(`<td><mpurse-send-button format="${format}" src-id="${file}" size="64"></mpurse-send-button></td>`)
                    }
                } else {
                    const path = `${base}/${format}/${file}.${format}`
                    //tds.push(`<td><object type="image/svg+xml" data="${path}" width="64" height="64"></object></td>`)
                    tds.push(`<td><mpurse-send-button format="${format}" src-id="${file}" size="64"></mpurse-send-button></td>`)
                }
            }
            trs.push(`<tr>${tds.join('')}</tr>`)
        }
        return `<table><tr>${ths.join('')}</tr>${trs.join('')}<table>`
    }
    #getOs() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("windows nt") !== -1) { return 'DOS' }
        return 'UNIX'
    }
}
