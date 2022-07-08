class ImageTableHorizon {
    async make(_tsvs) {
        let baseUrl = `./asset/image/monacoin/`
        const dirs = [`svg/`, `png/64/`, `png/256/`]
        const tsvs = _tsvs
        const [png64s, png256s, svgs, modes, png64Sizes, png256Sizes, svgSizes] = [[],[],[],[],[],[],[]]
        for (let i=0; i<tsvs[0].length; i++) {
            const [svgName, svgSize, svgSize2, svgMode] = tsvs[0][i]
            const [png64Name, png64Size, png64Size2] = tsvs[1][i]
            const [png256Name, png256Size, png256Size2] = tsvs[2][i]
            svgs.push(this.#makeSvgColumns(`${baseUrl}${dirs[0]}`, svgName, svgSize, svgSize2, svgMode))
            png64s.push(this.#makePngColumns(`${baseUrl}${dirs[1]}`, png64Name, png64Size, png64Size2))
            png256s.push(this.#makePngColumns(`${baseUrl}${dirs[2]}`, png256Name, png256Size, png256Size2))
            svgSizes.push(this.#makeSvgSizeColumns(svgName, svgSize, svgSize2, svgMode))
            png64Sizes.push(this.#makePngSizeColumns(png64Name, png64Size, png64Size2))
            png256Sizes.push(this.#makePngSizeColumns(png256Name, png256Size, png256Size2))
            modes.push(this.#makeSvgColorSchemeColumns(svgMode))
        }
        return `<table>
<tr><th rowspan="2">PNG<br>64</th>${png64s.join('')}</tr>
<tr>${png64Sizes.join('')}</tr>
<tr><th rowspan="2">PNG<br>256</th>${png256s.join('')}</tr>
<tr>${png256Sizes.join('')}</tr>
<tr><th rowspan="2">SVG</th>${svgs.join('')}</tr>
<tr>${svgSizes.join('')}</tr>
<tr><th title="light/darkモード対応">明暗</th>${modes.join('')}</tr>
</table>`
    }
    #make(baseUrl, text) { // filename,size(1.0KB),sizw2(1024B),hasSvgColorScheme
        const lines = text.split(/\r\n|\n/).filter(v=>v)
        const [pngs, svgs, modes, pngSizes, svgSizes] = [[],[],[],[],[]]
        for (let i=0; i<lines.length; i+=2) { // i = i + 2
            const [pngName, pngSize, pngSize2, pngMode] = lines[i].split('\t')
            const [svgName, svgSize, svgSize2, svgMode] = lines[i+1].split('\t')
            pngs.push(this.#makePngColumns(baseUrl,pngName, pngSize, pngSize2, pngMode))
            pngSizes.push(this.#makePngSizeColumns(pngName, pngSize, pngSize2, pngMode))
            svgs.push(this.#makeSvgColumns(baseUrl,svgName, svgSize, svgSize2, svgMode))
            svgSizes.push(this.#makeSvgSizeColumns(svgName, svgSize, svgSize2, svgMode))
            modes.push(this.#makeSvgColorSchemeColumns(svgMode))
        }
        const paths = baseUrl.split().filter(v=>v)
        const caption = ('svg'===paths[paths.length-1]) ? 'svg' : paths[paths.length-2] + '.' + paths[paths.length-1]
        return `<table><caption>${caption}</caption>
<tr><th rowspan="2">PNG</th>${pngs.join('')}</tr>
<tr>${pngSizes.join('')}</tr>
<tr><th rowspan="2">SVG</th>${svgs.join('')}</tr>
<tr>${svgSizes.join('')}</tr>
<tr><th title="light/darkモード対応">明暗</th>${modes.join('')}</tr>
</table>`
    }
    #makePngColumns(baseUrl, name, size, size2, mode, width=64, height=64) { return `<td class="checkered-pattern"><img src="${baseUrl}${name}" width="${width}" height="${height}" alt="${name}" title="${name}"></td>` }
    #makePngSizeColumns(pngName, pngSize, pngSize2, pngMode, width=64, height=64) { return `<td title="${pngSize2} B" style="text-align:center;">${pngSize}</td>` }
    #makeSvgColumns(baseUrl, name, size, size2, mode, width=64, height=64) { return `<td class="checkered-pattern"><object data="${baseUrl}${name}" type="image/svg+xml" width="${width}" height="${height}" alt="${name}" title="${name}"></td>` }
    #makeSvgSizeColumns(name, size, size2, mode, width=64, height=64) { return `<td title="${size2} B" style="text-align:center;">${size}</td>` }
    #makeSvgColorSchemeColumns(mode) { return `<td style="text-align:center; vertical-align:middle;">${mode}</td>` }
// SVGを使うときに知っておくといいことをまとめました
// https://qiita.com/manabuyasuda/items/01a76204f97cd73ffc4e
}
