import {MatrixMultiplyVector} from "../math/matrixOperations";
import {
    crossProduct,
    dotProduct,
    normalise,
    projectVector,
    scaleIntoView,
    subtractVectors
} from "../math/vectorOperations";
import Triangle from "../elements/Triangle";
import Vertex from "../elements/Vertex";
import {clipAgainstPlane} from "./clippingHandler";

function createToRender(vecA, vecB, vecC) {
    return [new Vertex(vecA[0][0], vecA[1][0], vecA[2][0]), new Vertex(vecB[0][0], vecB[1][0], vecB[2][0]), new Vertex(vecC[0][0], vecC[1][0], vecC[2][0])]
}

export default function trianglesToRaster({
                                              camera,
                                              lightSource,
                                              zNear,
                                              fieldOfView,
                                              aspectRatio,
                                              zScale,
                                              zOffset
                                          },
                                          canvasWidth,
                                          canvasHeight,
                                          shading,
                                          triangles,
                                          indexBuffer,
                                          visibleClipping
                                          ) {
    let response = []
    for (let current = 0; current < triangles.length; current++) {

        let vecInit = indexBuffer[triangles[current].vertices[0]].worldMatrix,
            vecA = indexBuffer[triangles[current].vertices[1]].worldMatrix,
            vecB = indexBuffer[triangles[current].vertices[2]].worldMatrix

        let normalA, normalB
        normalA = subtractVectors(vecA, vecInit)
        normalB = subtractVectors(vecB, vecInit)

        let crossP = crossProduct(normalA, normalB)
        crossP = normalise(crossP[0][0], crossP[1][0], crossP[2][0])

        const vCameraRay = subtractVectors(vecInit, camera.vector.matrix)
        const dotProd = dotProduct(crossP, vCameraRay)

        if (dotProd < 0) { // Culling part 1
            const normalisedLightVec = normalise(lightSource[0][0], lightSource[1][0], lightSource[2][0])
            const dotProdLightVec = Math.max(.1, dotProduct(crossP, normalisedLightVec))

            vecInit = indexBuffer[triangles[current].vertices[0]].viewMatrix
            vecA = indexBuffer[triangles[current].vertices[1]].viewMatrix
            vecB = indexBuffer[triangles[current].vertices[2]].viewMatrix

            triangles[current].color = `hsl(0, 10%, ${shading ? ((Math.abs(dotProdLightVec).toFixed(2) * 50)) : 50}%)`
            triangles[current].toRender = createToRender(vecInit, vecA, vecB)

            const clipped = clipAgainstPlane([[0], [0], [zNear], [0]], [[0], [0], [1], [0]], triangles[current], visibleClipping) // Culling part 2 (Frustum Z axis)
            for (let currentClipped = 0; currentClipped < clipped.quantity; currentClipped++) {
                let updatedA, updatedB, updatedC
                if (clipped.quantity > 1) {
                    updatedA = scaleIntoView(projectVector(clipped.triangles[currentClipped].toRender[0].matrix, fieldOfView, aspectRatio, zScale, zOffset), canvasWidth, canvasHeight)
                    updatedB = scaleIntoView(projectVector(clipped.triangles[currentClipped].toRender[1].matrix, fieldOfView, aspectRatio, zScale, zOffset), canvasWidth, canvasHeight)
                    updatedC = scaleIntoView(projectVector(clipped.triangles[currentClipped].toRender[2].matrix, fieldOfView, aspectRatio, zScale, zOffset), canvasWidth, canvasHeight)
                } else {
                    updatedA = indexBuffer[triangles[current].vertices[0]].projectedMatrix
                    updatedB = indexBuffer[triangles[current].vertices[1]].projectedMatrix
                    updatedC = indexBuffer[triangles[current].vertices[2]].projectedMatrix


                }
                clipped.triangles[currentClipped].toRender = createToRender(updatedA, updatedB, updatedC)

                response.push(clipped.triangles[currentClipped])
            }
        }
    }

    return response
}