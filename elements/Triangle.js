import conf from '../../config.json'

export default class Triangle {
    vertices = []
    color = 'rgba(0,0,0,0)'
    toRender = new Array(3)


    constructor(vertices,  noColor=false) {
        this.noColor = noColor
        this.vertices = vertices
    }

    draw(ctx, wireframe, texturing, vertex) {
        if (vertex) {
            this.toRender.forEach((vec, index) => {
                ctx.beginPath()

                ctx.moveTo(vec.x, vec.y)

                ctx.arc(vec.x, vec.y, conf.vertexRadius ? conf.vertexRadius : 2, 0, Math.PI * 2)
                ctx.fillStyle = conf.vertexColor ? conf.vertexColor : 'blue'
                ctx.fill()
            })
        }
        ctx.beginPath()
        this.toRender.forEach((vec, index) => {
            if (index === 0)
                ctx.moveTo(vec.x, vec.y)
            else
                ctx.lineTo(vec.x, vec.y)
        })
        if (texturing && !this.noColor) {
            ctx.fillStyle = this.color
            ctx.fill()
        }
        if (wireframe || this.noColor)
            ctx.strokeStyle = conf.wireframeColor ? conf.wireframeColor : 'green'
        else
            ctx.strokeStyle = this.color
        ctx.closePath()
        if (texturing || wireframe)
            ctx.stroke()
    }

}