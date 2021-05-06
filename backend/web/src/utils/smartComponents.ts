import { MonitoredVariableInstance, SmartComponent} from "../model/index"
import { getMonitoredVariableInstances, getSmartComponents } from "../services/api/smart-component"
import { RequestResponseState } from "../services/api/api"


export const getOrDownloadSmartComponents = (smartComponents: SmartComponent[]) :  Promise<SmartComponent[]> => {
    
    return new Promise((res: Function, rej:Function) => {

        if(smartComponents.length) 
            res(smartComponents)
        else 
            getSmartComponents ()
                .then((result: SmartComponent[]) => res(result))
                .catch((error: RequestResponseState) => rej(error))
    })

}

export const getOrDownloadMonitoredVariableInstances = (monitoredVariableInstances:  MonitoredVariableInstance[]) :  Promise< MonitoredVariableInstance[]> => {
    
    return new Promise((res: Function, rej:Function) => {

        if(monitoredVariableInstances.length) 
            res(monitoredVariableInstances)
        else 
            getMonitoredVariableInstances()
                .then((result: MonitoredVariableInstance[]) => res(result))
                .catch((error: RequestResponseState) => rej(error))
    })

}

