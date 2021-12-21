import {MatrixMultiplyVector} from "../math/matrixOperations";
import {projectVector, scaleIntoView} from "../math/vectorOperations";
import rotationMatrix from "../math/rotationMatrix";

export default class IndexBuffer {
    buffer = []
    length = 0

    constructor(buffer) {
        this.buffer = buffer
        this.length = buffer.length
    }

    findTriangle(vertA, vertB, vertC) {
        return [this.buffer[vertA], this.buffer[vertB], this.buffer[vertC]]
    }
    rotateVertices(axis, angle){
        const rotationM = rotationMatrix(axis, angle)
        this.buffer.forEach((vec) => {
            let newMatrix = MatrixMultiplyVector(rotationM, vec.matrix)
            vec.update(newMatrix[0][0], newMatrix[1][0], newMatrix[2][0])
        })
    }
    processVertices(worldMatrix, viewMatrix, fieldOfView, aspectRatio, zScale, zOffset, canvasWidth, canvasHeight) {

        for (let i = 0; i < this.length; i++) {
            let world = MatrixMultiplyVector(worldMatrix, this.buffer[i].matrix),
                view = MatrixMultiplyVector(viewMatrix, world),
                projected = scaleIntoView(projectVector(view, fieldOfView, aspectRatio, zScale, zOffset), canvasWidth, canvasHeight)

            this.buffer[i].viewMatrix = view
            this.buffer[i].worldMatrix = world
            this.buffer[i].projectedMatrix = projected
        }
    }
}