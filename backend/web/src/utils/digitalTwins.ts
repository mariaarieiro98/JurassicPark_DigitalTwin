import { DigitalTwin, Functionality, MonitoredEvent, MonitoredVariable } from "../model/index"
import { getDigitalTwins, getFunctionalities, getMonitoredEvents, getMonitoredVariables } from "../services/api/digital-twin"
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


export const getOrDownloadMonitoredVariables = (monitoredVariables: MonitoredVariable[]) :  Promise<MonitoredVariable[]> => {

    return new Promise((res: Function, rej:Function) => {

        if(monitoredVariables.length) 
            res(monitoredVariables)
        else 
            getMonitoredVariables()
                .then((result: MonitoredVariable[]) => res(result))
                .catch((error: RequestResponseState) => rej(error))
    })

}

export const getOrDownloadMonitoredEvents = (monitoredEvents: MonitoredEvent[]) :  Promise<MonitoredEvent[]> => {

    return new Promise((res: Function, rej:Function) => {

        if(monitoredEvents.length) 
            res(monitoredEvents)
        else 
            getMonitoredEvents()
                .then((result: MonitoredEvent[]) => res(result))
                .catch((error: RequestResponseState) => rej(error))
    })

}


