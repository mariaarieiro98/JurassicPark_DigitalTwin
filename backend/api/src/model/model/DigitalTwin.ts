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
    //state:number
    funcUser?: User
    funcUserId: number
    funcdtId: number
    funcscId: number 
    funcscName: string
} 