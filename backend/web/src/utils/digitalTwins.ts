import { DigitalTwin, Functionality } from "../model/index"
import { getDigitalTwins, getFunctionalities } from "../services/api/digital-twin"
import { RequestResponseState } from "../services/api/api"

export const getOrDownloadDigitalTwins = (dts: DigitalTwin[]) :  Promise<DigitalTwin[]> => {

    return new Promise((res: Function, rej:Function) => {

        if(dts.length) 
            res(dts)
        else 
            getDigitalTwins()
                .then((result: DigitalTwin[]) => res(result))
                .catch((error: RequestResponseState) => rej(error))
    })

}

export const getOrDownloadFunctionalities = (functionalities: Functionality[]) :  Promise<Functionality[]> => {

    return new Promise((res: Function, rej:Function) => {

        if(functionalities.length) 
            res(functionalities)
        else 
            getFunctionalities ()
                .then((result:Functionality[]) => res(result))
                .catch((error: RequestResponseState) => rej(error))
    })

}

