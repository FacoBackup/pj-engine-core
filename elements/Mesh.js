import trianglesToRaster from "../helpers/trianglesToRaster";
import {clipAgainstPlane} from "../helpers/clippingHandler";
import IndexBuffer from "./IndexBuffer";

export default class Mesh {
    constructor(triangles, vertices) {
        this.indexBuffer = new IndexBuffer(vertices)
        this.triangles = triangles
    }

    rotate(axis, angle) {
        this.indexBuffer.rotateVertices(axis, angle)
    }

    draw(ctx, engineAttrs, wireframe, texturing, shading, vertex, visibleClipping, callback) {
        const sortTriangles = (triangleA, triangleB, buffer) => {

            let z1 = Math.abs(buffer[triangleA.vertices[0]].projectedMatrix[2][0] + buffer[triangleA.vertices[1]].projectedMatrix[2][0] + buffer[triangleA.vertices[2]].projectedMatrix[2][0]) / 3
            let z2 = Math.abs((buffer[triangleB.vertices[0]].projectedMatrix[2][0] + buffer[triangleB.vertices[1]].projectedMatrix[2][0] + buffer[triangleB.vertices[2]].projectedMatrix[2][0])) / 3

            if (z1 < z2) {
                return -1;
            }
            if (z2 > z1) {
                return 1;
            }
            return 0;
        }
        // const startTriangleMapping = performance.now()
        this.indexBuffer.processVertices(
            engineAttrs.camera.worldMatrix,
            engineAttrs.camera.viewMatrix,
            engineAttrs.fieldOfView,
            engineAttrs.aspectRatio,
            engineAttrs.zScale,
            engineAttrs.zOffset,
            ctx.canvas.width,
            ctx.canvas.height
        )

        let toRaster = trianglesToRaster(engineAttrs, ctx.canvas.width, ctx.canvas.height, shading, this.triangles, this.indexBuffer.buffer, visibleClipping)
        // const endTriangleMapping = performance.now()
        // const startSort = performance.now()
        toRaster = toRaster.sort((a, b) => sortTriangles(a, b, this.indexBuffer.buffer))
        // const endSort = performance.now()

        let pInt = 0//, startDrawing = 0, endDrawing = 0, startClipping = 0, endClipping = 0
        for (let current = 0; current < toRaster.length; current++) {
            let listTriangles = []

            listTriangles.push(toRaster[current])
            let nNewTriangles = 1;
            // startClipping = performance.now()

            // Culling part 3 (Frustum)
            for (pInt = 0; pInt < 4; pInt++) {

                let nTrisToAdd = {quantity: 0, triangles: []}
                while (nNewTriangles > 0) {
                    let test = listTriangles[listTriangles.length - 1];

                    listTriangles.pop();
                    nNewTriangles--;
                    switch (pInt) {
                        case 0: {
                            nTrisToAdd = clipAgainstPlane(
                                [[0], [0], [0]],
                                [[0], [1], [0]],
                                test, visibleClipping)

                            break
                        }
                        case 1: {
                            nTrisToAdd = clipAgainstPlane(
                                [[1], [ctx.canvas.height - 1], [0]],
                                [[0], [-1], [0]],
                                test, visibleClipping)
                            break
                        }
                        case 2: {
                            nTrisToAdd = clipAgainstPlane(
                                [[0], [0], [0]],
                                [[1], [0], [0]],
                                test, visibleClipping)
                            break
                        }
                        case 3: {
                            nTrisToAdd = clipAgainstPlane(
                                [[ctx.canvas.width - 1], [0], [0]],
                                [[-1], [0], [0]],
                                test, visibleClipping
                            )
                            break
                        }
                        default:
                            break
                    }

                    for (let w = 0; w < nTrisToAdd.quantity; w++)
                        listTriangles.push(nTrisToAdd.triangles[w]);
                }

                nNewTriangles = listTriangles.length;
            }
            // endClipping = performance.now()
            // startDrawing = performance.now()
            listTriangles.forEach(tri => {
                tri.draw(ctx, wireframe, texturing, vertex)
            })
            // endDrawing = performance.now()
        }

        // callback({
        //     drawing: endDrawing - startDrawing,
        //     sort: endSort - startSort,
        //     mapping: endTriangleMapping - startTriangleMapping,
        //     clipping: endClipping - startClipping
        // })
    }
}