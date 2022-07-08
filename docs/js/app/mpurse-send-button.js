class MpurseSendButton extends HTMLElement {
    constructor(options) {
        super();
        try {
            window.mpurse.updateEmitter.removeAllListeners()
              .on('stateChanged', isUnlocked => this.stateChanged(isUnlocked))
              .on('addressChanged', address => this.addressChanged(address));
        } catch(e) { console.debug(e) }
        this.title = options.title
        this.src = options.src
        this.size = options.size || 64
        this.to = options.to
        this.asset = options.to || 'MONA'
        this.amount = options.amount || 0.11411400
        this.memo = options.memo || ''
        this.ok = options.ok || '投げモナしました！\nありがとうございます！（ ´∀｀）'
        this.cancel = options.cancel || 'キャンセルしました(´・ω・｀)'
        this.baseUrl = options.baseUrl || './asset/image/monacoin'
        this.party = options.party.method || 'confetti' // confetti,sparkle-star,sparkle-hart,sparkle-image
        this.partySrc = options.party.src // sparkle-imageのとき使う画像
        this.partySize = options.party.size // 画像サイズ
    }
    static get observedAttributes() {
        return ['to', 'asset', 'amount', 'memo', 'src', 'size', 'title', 'ok', 'cancel'];
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) { return; }
        else if ('size' === property || 'amount' === property) { this[property] = Number(newValue) }
        else if ('base-url' === property) { this.baseUrl = newValue }
        else if ('party-src' === property) { this.partySrc = newValue }
        else if ('party-size' === property) { this.partySize = Number(newValue) }
        else { this[property] = newValue; }
    }
    async connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' }); // マウスイベント登録に必要だった。CSS的にはclosedにしたいのに。
        const button = await this.#make()
        await this.#makeClickEvent()
        console.debug(button.innerHTML)
        shadow.innerHTML = `<style>${this.#cssBase()}${this.#cssAnimation()}</style>${button.innerHTML}` 
        this.shadowRoot.querySelector('img').addEventListener('animationend', (e)=>{ e.target.classList.remove('jump'); }, false);
    }
    #cssBase() { return `img{cursor:pointer; text-align:center; vertical-align:middle; user-select:none;}` }
    #cssAnimation() { return `
@keyframes jump {
  from {
    position:relative;
    bottom:0;
    transform: rotateY(0);
  }
  45% {
    position:relative;
    bottom: ${this.size*2}px;
  }
  55% {
    position:relative;
    bottom: ${this.size*2}px;
  }
  to {
    position:relative;
    bottom: 0;
    transform: rotateY(720deg);
  }
}
.jump {
  transform-origin: 50% 50%;
  animation: jump .5s linear alternate;
}
`; }
    stateChanged(isUnlocked) {
        console.debug(`Mpurseのロック状態が変更されました：${isUnlocked}`)
    }
    addressChanged(address) {
        console.debug(`Mpurseのログイン中アドレスが変更されました：${address}`)
        this.to = address
        this.#make().then(
            result=>{this.innerHTML = ''; this.appendChild(result); }, 
            error=>{console.debug('アドレス変更に伴いボタン更新を試みましたが失敗しました。', e);})
    }
    async #make() {
        const a = await this.#makeSendButtonA()
        const img = this.#makeSendButtonImg()
        a.appendChild(img)
        return a
    }
    async #makeClickEvent() {
        const to = this.to || await window.mpurse.getAddress()
        const asset = this.asset
        const amount = Number(this.amount)
        const memoType = (this.memo) ? 'plain' : 'no' // 'no', 'hex', 'plain'
        const memo = this.memo
        this.addEventListener('pointerdown', async(event) => {
            console.debug(`クリックしました。\n宛先：${to}\n金額：${amount} ${asset}\nメモ：${memo}`)
            console.debug(event.target)
            event.target.shadowRoot.querySelector('img').classList.add('jump')
            const txHash = await window.mpurse.sendAsset(to, asset, amount, memoType, memo).catch((e) => null);
            console.debug(txHash)
            if (!txHash) { Toaster.toast(this.cancel); }
            else {
                console.debug(txHash)
                console.debug(`送金しました。\ntxHash: ${txHash}\n宛先：${to}\n金額：${amount} ${asset}\nメモ：${memo}`)
                this.#party()
                Toaster.toast(this.okMsg);
            }
        });
    }
    #party() {
        if (!party) { return }
        const target = this.shadowRoot.querySelector('img')
        switch(this.party) {
            case 'confetti':
                party.confetti(target,{
                    lifetime: party.variation.range(5, 7),
                    count: party.variation.range(80, 100),
                    speed: party.variation.range(100, 700),
                }); break;
            case 'sparkle-star':
                party.sparkles(target,{
                    lifetime: party.variation.range(2, 3),
                    count: party.variation.range(30, 40),
                    speed: party.variation.range(100, 500),
                    //size: party.variation.range(1, 3),
                }); break;
            case 'sparkle-hart': PartySparkleHart.setup(target); break;
            case 'sparkle-image': PartySparkleImage.setup(target, {src:this.partySrc || this.src, size:this.size}); break;
            default: break;
        }
    }
    #makeSendButtonA() {
        const a = document.createElement('a')
        a.setAttribute('title', this.title)
        return a
    }
    #makeSendButtonImg() {
        const img = document.createElement('img')
        img.setAttribute('width', `${this.size}`)
        img.setAttribute('height', `${this.size}`)
        img.setAttribute('src', `${this.#getImgSrc()}`)
        return img
    }
}
window.addEventListener('DOMContentLoaded', (event) => {
    customElements.define('mpurse-send-button', MpurseSendButton);
});

