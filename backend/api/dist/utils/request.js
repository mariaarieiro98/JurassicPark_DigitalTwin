"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model");
class RequestResponseState {
    constructor() {
        this.error = false;
        this.msg = 'Success';
        this.errorCode = 0;
    }
    setErrorState(msg, errorCode) {
        this.error = true;
        this.msg = msg;
        this.errorCode = errorCode;
    }
    getError() {
        return this.error;
    }
    getMessage() {
        return this.msg;
    }
    setExtra(extra) {
        this.extra = extra;
    }
    getErrorCode() {
        return this.errorCode;
    }
    getExtra() {
        return this.extra;
    }
}
exports.RequestResponseState = RequestResponseState;
class RequestResponse {
    constructor() {
        this.state = new RequestResponseState();
        this.get = () => {
            return { state: this.state, result: this.result };
        };
        this.setErrorState = (error, errorCode = 1) => {
            this.state.setErrorState(error, errorCode);
        };
        this.setResult = (result) => {
            this.result = result;
        };
    }
    getState() {
        return this.state;
    }
    getResult() {
        return this.result;
    }
    setExtra(extra) {
        this.state.setExtra(extra);
    }
}
exports.RequestResponse = RequestResponse;
exports.checkParameters = (requiredParams, params) => {
    return new Promise((resolve, reject) => {
        let result = new RequestResponse();
        if (params == undefined) {
            params = [];
        }
        let missingParams = [];
        for (let i = 0; i < requiredParams.length; i++) {
            if (!params.hasOwnProperty(requiredParams[i])) {
                missingParams.push(requiredParams[i]);
            }
        }
        if (missingParams.length > 0) {
            result.setErrorState(`Missing Parameters: ${missingParams.toString()}`, model_1.GeneralErrors.general.code);
            reject(result);
        }
        resolve(result);
    });
};
//# sourceMappingURL=request.js.map