class CircleSvgGenerator {
    constructor(myAddress, profiles) { // my:自分のアドレス、全登録アドレス＆プロフィール情報
        this.profiles = profiles
        console.debug(myAddress, this.profiles)
        this.my = this.#makeUserData(myAddress)
        //this.my = this.profiles.find(p=>p.address==myAddress)
        //if (!this.my) { this.my = {address:myAddress, name:null, url:null, avatar:'./asset/image/user/kkrn_icon_user_3_resize_min.svg'} }
        this.userIconSizes = [96,72,64,48,32,24,20] // 差24,8,16,16,8,4
        this.userIconNum = [1,8,16,32,48,64,88]
        //this.size = this.userIconSizes[0] + this.userIconSizes.slice(1).reduce((sum,v)=>sum+v)*2
    }
    generate(partners) { // partners: 取引相手のアドレスとプロフィール情報の配列
    //generate() { // 中央ユーザの表示サイズ、周辺ユーザの表示数＆表示サイズ
        this.partners = partners
        console.debug(this.partners)
        // 外周に並べる画像数の合計[8, 24, 56, 104, 168, 256]
        this.outerNums = this.userIconNum.slice(1).map((v,i)=>this.userIconNum.slice(1,i+2).reduce((sum,v)=>sum+v))
        console.debug(this.outerNums)
        const find = this.outerNums.findIndex(sum=>this.partners.length < sum)
        console.debug(find)
        const idx = (-1 == find) ? this.outerNums[this.userIconNum.length-1] : find
        // 外周数
        this.outerLen = idx+1
        console.debug(this.outerLen)
        // 画像全体サイズ
        this.size = this.userIconSizes[0] + ((this.outerLen < 1) ? 0 : this.userIconSizes.slice(1,this.outerLen+1).reduce((sum,v)=>sum+v)*2)
        console.debug(this.size)
        return this.#makeSvg(this.#makeCss()+this.#makeBackground()+this.#makeUsers())
    }
    #makeSvg(content) { return `<svg width="${this.size}" height="${this.size}">${content}</svg>` }
    #makeCss() { return `<defs><style type="text/css"><![CDATA[${this.#makeClipCss()}]]></style></defs>` }
    #makeClipCss() { return this.userIconSizes.map(size=>`.clip-${size}{ clip-path: circle(${size/2}px at center); }`).join('\n') }
    #makeBackground() { return `<rect x="0" y="0" width="${this.size}" height="${this.size}" style="fill:green" />` }
    #makeUsers() {
        //this.userIconSizes.slice(1).reduce((sum,v)=>sum+v)
        // 自分より前までの値を加算した配列
        // [8,16,32,48,64,88]
        // [8,24,56,104,168,256]
        //const find = this.userIconNum.slice(1).findIndex(n=>n < partners.length)
        /*
        const find = this.outerNums.findIndex(sum=>this.partners.length < sum)
        console.debug(find)
        const idx = (-1 == find) ? this.outerNums[this.userIconNum.length-1] : find
        this.outerLen = idx+1
        console.debug(this.outerLen)
        this.size = this.userIconSizes[0] + ((this.outerLen < 1) ? 0 : this.userIconSizes.slice(1,this.outerLen+1).reduce((sum,v)=>sum+v)*2)
        console.debug(this.size)
        */
        const imgs = Array.from({length: this.outerLen}, (v, k) => k).map(i=>this.#makeOuter(i))
        imgs.push(this.#makeCenter())
        return imgs.join('')
    }
    #makeUser(site, src, size, x, y) { return `<a href="${site}"><image href="${src}" width="${size}" height="${size}" x="${x}" y="${y}" class="clip-${size}" /></a>` }
    #makeUserData(address) {
        console.debug(this.profiles)
        let user = this.profiles.find(p=>p.address==address)
        console.debug(user)
        if (!user) { user = {address:address, name:null, url:null, avatar:null} }
        else { user = user.profile }
        console.debug(user)
        if (!user.avatar) { user.avatar = './asset/image/user/kkrn_icon_user_3_resize_min.svg' }
        return user
    }
    #makeCenter() {
        const center = (this.size / 2)
        const size = this.userIconSizes[0]
        const leftTop = center - (size / 2)
        //return this.#makeUser('https://ytyaru.github.io/', './asset/image/avator.png', size, leftTop, leftTop)
        this.profiles.find(p=>p.address==this.my)
        return this.#makeUser(this.my.url, this.my.avatar, size, leftTop, leftTop)
        //return this.#makeUser(this.my.profile.url, this.my.profile.avatar, size, leftTop, leftTop)
    }
    #makeOuter(i) { // i=0,1,2,3...
        console.debug(`----- makeOuter ${i} -----`)
        const imgs = []
        //const itemNum = this.userIconNum[i+1]
        const itemNum = (i == this.outerLen-1) ? this.partners.length - ((i==0) ? 0 : this.outerNums[i-1]) : this.outerNums[i]
        console.debug(itemNum, this.outerLen, this.partners.length)
        const deg = 360 / itemNum
        const start = (deg * Math.PI / 180.0)
        const size = this.userIconSizes[i+1]
        const middles = this.userIconSizes.slice(1,i+1)
        const r = ((this.userIconSizes[0]+this.userIconSizes[i+1])/2) + ((0==middles.length) ? 0 : middles.reduce((sum,v)=>sum+v))
        const center = (this.size / 2)
        const leftTop = center - ((this.userIconSizes[0]/2) + this.userIconSizes.slice(1,i+2).reduce((sum,v)=>sum+v))
        // 取引相手配列の開始位置
        const nums = this.userIconNum.slice(1).map((v,i)=>this.userIconNum.slice(1,i+2).reduce((sum,v)=>sum+v))
        const p = (i==0) ? 0 : nums[i-1]
        for (let n=0; n<itemNum; n++) {
            const x = Math.cos(start * n - Math.PI / 2) * r + r + leftTop;
            const y = Math.sin(start * n - Math.PI / 2) * r + r + leftTop;
            //imgs.push(this.#makeUser('', './asset/image/user/kkrn_icon_user_3_resize_min.svg', size, x, y))
            //imgs.push(this.#makeUser(this.partners[p+i].profile.url, this.partners[p+i].profile.avatar, size, x, y))
            console.debug(n)
            console.debug(this.partners)
            console.debug(this.partners[p+n])
            console.debug(this.partners[p+n].address)
            const partner = this.#makeUserData(this.partners[p+n].address)
            console.debug(partner)
            imgs.push(this.#makeUser(partner.url, partner.avatar, size, x, y))
        }
        return imgs.join('')
    }
}
