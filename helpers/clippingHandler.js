import Triangle from "../elements/Triangle";
import Vertex from "../elements/Vertex";
import {dotProduct, normalise, vectorIntersectPlane} from "../math/vectorOperations";

export function clipAgainstPlane(planePoint, planeNormal, inputTriangle, visibleClipping) {

    let planeN = normalise(planeNormal[0][0], planeNormal[1][0], planeNormal[2][0]);

    let outputTriA = new Triangle(inputTriangle.vertices, visibleClipping),
        outputTriB = new Triangle(inputTriangle.vertices, visibleClipping)

    const dist = (p) => {
        return (planeN[0][0] * p.x + planeN[1][0] * p.y + planeN[2][0] * p.z - dotProduct(planeN, planePoint))
    }

    let nInsidePointCount = 0,
        nOutsidePointCount = 0,
        outsidePoints = new Array(3),
        insidePoints = new Array(3)

    let d0 = dist(inputTriangle.toRender[0]);
    let d1 = dist(inputTriangle.toRender[1]);
    let d2 = dist(inputTriangle.toRender[2]);

    if (d0 >= 0)
        insidePoints[nInsidePointCount++] = inputTriangle.toRender[0].matrix
    else
        outsidePoints[nOutsidePointCount++] = inputTriangle.toRender[0].matrix

    if (d1 >= 0)
        insidePoints[nInsidePointCount++] = inputTriangle.toRender[1].matrix
    else
        outsidePoints[nOutsidePointCount++] = inputTriangle.toRender[1].matrix

    if (d2 >= 0)
        insidePoints[nInsidePointCount++] = inputTriangle.toRender[2].matrix
    else
        outsidePoints[nOutsidePointCount++] = inputTriangle.toRender[2].matrix

    if (nInsidePointCount === 0) {

        return {quantity: 0, triangles: []}
    }

    if (nInsidePointCount === 3) {
        // inputTriangle.color = 'blue'

        return {quantity: 1, triangles: [inputTriangle]}
    }

    if (nInsidePointCount === 1 && nOutsidePointCount === 2) {
        outputTriA.color = inputTriangle.color //'red'

        outputTriA.toRender[0] = new Vertex(insidePoints[0][0][0], insidePoints[0][1][0], insidePoints[0][2][0])

        const vectorTwo = vectorIntersectPlane(planePoint, planeN, insidePoints[0], outsidePoints[0])
        const vectorThree = vectorIntersectPlane(planePoint, planeN, insidePoints[0], outsidePoints[1])
        outputTriA.toRender[1] = new Vertex(vectorTwo[0][0], vectorTwo[1][0], vectorTwo[2][0])
        outputTriA.toRender[2] = new Vertex(vectorThree[0][0], vectorThree[1][0], vectorThree[2][0])

        return {quantity: 1, triangles: [outputTriA]}
    }

    if (nInsidePointCount === 2 && nOutsidePointCount === 1) {

        outputTriA.color = inputTriangle.color //'red'
        outputTriB.color = inputTriangle.color // 'green'

        outputTriA.toRender[0] = new Vertex(insidePoints[0][0][0], insidePoints[0][1][0], insidePoints[0][2][0])
        outputTriA.toRender[1] = new Vertex(insidePoints[1][0][0], insidePoints[1][1][0], insidePoints[1][2][0])
        const vectorThree = vectorIntersectPlane(planePoint, planeN, insidePoints[0], outsidePoints[0])
        outputTriA.toRender[2] = new Vertex(vectorThree[0][0], vectorThree[1][0], vectorThree[2][0])

        outputTriB.toRender[0] = new Vertex(insidePoints[1][0][0], insidePoints[1][1][0], insidePoints[1][2][0])
        outputTriB.toRender[1] = new Vertex(vectorThree[0][0], vectorThree[1][0], vectorThree[2][0])
        const outTwoVectorThree = vectorIntersectPlane(planePoint, planeN, insidePoints[1], outsidePoints[0])
        outputTriB.toRender[2] = new Vertex(outTwoVectorThree[0][0], outTwoVectorThree[1][0], outTwoVectorThree[2][0])

        return {quantity: 2, triangles: [outputTriA, outputTriB]}
    }
}