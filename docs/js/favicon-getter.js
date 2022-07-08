class FaviconGetter {
    static async get(domain) {
        const [src, mime] = await this.#src(domain)
        console.debug(src, mime)
        if (src) {
            const res = await fetch(src)
            const ext = src.split('.').slice(-1)[0].toLowerCase()
            const content = ('svg'===ext || mime?.includes('svg')) ? await res.text() : await res.blob()
            return {content:content, url:src, ext:ext, mime:mime, domain:domain}
        }
    }
    static async #src(domain) {
        const res = await fetch(`https://${domain}/`)
        const html = await res.text()
        console.debug(html)
        const p = document.createElement('p')
        p.innerHTML = html
        const link = p.querySelector(`link[rel=icon]`)
        console.debug(link)
        //return p.querySelector(`head link[rel=icon]`)?.getAttribute('href')
        if (link) { return [link.getAttribute('href'), link.getAttribute('type')] }
        return [null, null]
        /*
        */
     }

    /*
    async request(domain, size=64) {
        const res = await fetch(this.url(domain, size))
        const 
    }
    url(domain, size=64) {
        if (domain) { return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=${size}` }
    }
    */
}
