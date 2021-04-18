import { Event, Variable } from "./EventVariable";
import { User } from "./User";

export interface DigitalTwin {
    dtId?: number
    dtName: string
    dtUser?: User
    dtUserId: number
    functionalities? : string[]
    associatedSmartComponents? : string[]
} 

export interface Functionality {
    funcId?: number
    funcName: string
    dt?: DigitalTwin
    funcdtName?: string
    funcdtId: number
    //state:number
    funcUser?: User
    funcUserId: number
    funcscId: number 
    funcscName: string
    /* funcMonitoredInputEvents: Event[]
    funcMonitoredOutputEvents: Event[]
    funcMonitoredInputVariables: Variable[]
    funcMonitoredOutputVariables: Variable[] */
} 