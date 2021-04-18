import { GeneralErrors } from "../model"

export class RequestResponseState {
    
    private error : boolean = false
    private msg : string = 'Success'
    private errorCode : number = 0
    private extra : any

    setErrorState(msg:string, errorCode: number) {

       this.error = true
       this.msg = msg
       this.errorCode = errorCode

    }

    getError() : boolean {
        return this.error
    }

    getMessage() : string {
        return this.msg
    }

    setExtra(extra:any) {
        this.extra = extra
    }

    getErrorCode() {
        return this.errorCode
    }

    getExtra() {
        return this.extra
    }
    
}

export class RequestResponse {

    private state : RequestResponseState = new RequestResponseState()
    private result : any

    get = () => {
        return {state: this.state, result: this.result}
    }

    setErrorState = (error : string, errorCode:number = 1) => {
        this.state.setErrorState(error,errorCode)
    }

    setResult = (result : any) => {
        this.result = result
    }

    getState() : RequestResponseState {
        return this.state
    }

    getResult() : any {
        return this.result
    }

    setExtra(extra: any) {
        this.state.setExtra(extra)
    }

}


export const checkParameters = (requiredParams : string[], params : any) : Promise<RequestResponse> => {
    
    return new Promise((resolve,reject) => {

        let result = new RequestResponse()

        if (params == undefined) {
            params = []
        }

        let missingParams : string[] = []
        
        for(let i = 0; i < requiredParams.length; i++) {
            
            if(!params.hasOwnProperty(requiredParams[i])) {
                missingParams.push(requiredParams[i])
            }
        }

        if(missingParams.length > 0) {
            result.setErrorState(`Missing Parameters: ${missingParams.toString()}`, GeneralErrors.general.code)
            reject(result)
        }

        resolve(result)
    
    })

}