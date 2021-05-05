class ContainerError extends Error {
    constructor(message, errorObject){
        super(message);
        this.errorObject = errorObject
    }


    errorObject() {
        return this.errorObject;
    }

}

module.exports = ContainerError
