class PartySparkleMonar {
    static setup() {
        party.resolvableShapes['monar'] = PartySparkleMonar.img().outerHTML
        console.debug(party.resolvableShapes['monar'])
    }
    static async svgText() {
        const res = await fetch(`./asset/image/monacoin/svg/monar.svg`)
        const svg = await res.text()
        const shape = document.createElement("span")
        shape.innerHTML = svg
        return shape.innerHTML
        //return shape.querySelector(`svg`)
    }
    static img() {
        const img = document.createElement("img")
        img.setAttribute('src', `./asset/image/monacoin/svg/monar.svg`)
        img.setAttribute('width', '32')
        img.setAttribute('height', '32')
        return img
    }
    static animate(runButton) {
        const img = this.img()
        party.scene.current.createEmitter({
            emitterOptions: {
                loops: 1,
                useGravity: false,
                modules: [
                    new party.ModuleBuilder()
                        .drive("rotation")
                        .by((t) => new party.Vector(0, 0, 100).scale(t))
                        .relative()
                        .build(),
                    new party.ModuleBuilder()
                        .drive("opacity")
                        .by(
                            new party.NumericSpline(
                            { time: 0, value: 1 },
                            { time: 0.5, value: 1 },
                            { time: 1, value: 0 },
                            )
                        )
                        .through("relativeLifetime")
                        .build(),
                    ],
            },
            emissionOptions: {
                rate: 0,
                bursts: [{ time: 0, count: party.variation.range(30, 40), }],
                sourceSampler: party.sources.dynamicSource(runButton),
                angle: party.variation.range(0, 360),
                initialLifetime: party.variation.range(1, 4), 
                initialSpeed: party.variation.range(100, 700),
                initialRotation: new party.Vector(0, 0, party.random.randomRange(0, 360)),
                initialColor: party.variation.gradientSample(
                    party.Gradient.simple(party.Color.fromHex("#ffa68d"), party.Color.fromHex("#fd3a84"))
                ),
            },
            rendererOptions: {
                shapeFactory: img,
                applyLighting: undefined,
            },
        });
    }
}
