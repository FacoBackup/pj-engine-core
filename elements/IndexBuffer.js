import {MatrixMultiplyVector} from "../math/matrixOperations";

export default class IndexBuffer {
    vertices = []
    length = 0
    buffer = []

    constructor(vertices) {
        this.vertices = vertices
        this.length = vertices.length
    }

    findTriangle(vertA, vertB, vertC) {
        return [this.vertices[vertA], this.vertices[vertB], this.vertices[vertC]]
    }

    processVertices(worldMatrix, viewMatrix) {
        let verticesProcessed = []
        for (let i = 0; i < this.length; i++) {
            let current = MatrixMultiplyVector(worldMatrix, this.vertices[i])
            current = MatrixMultiplyVector(viewMatrix, current)
            verticesProcessed.push(current)
        }

        this.buffer = verticesProcessed
    }
}