import { User } from "./User";
import { Event, Variable } from "./EventVariable";

export enum FBGeneralCategory {
    sensor='DEVICE.SENSOR',
    service='SERVICE',
    startPoint='POINT.STARTPOINT',
    endPoint='POINT.ENDPOINT',
    equipment='DEVICE.EQUIPMENT'
}

export interface FBCategory {
    fbcId?: number
    fbcName:string
    fbcUser?: User
    fbcUserId: number
    functionBlocks? : string[]
}

export interface ExternalDependency {
    edId?: number
    edName: string
    edVersion?: string
}

export interface FunctionBlock {
    fbId?: number
    fbType:string
    fbDescription:string
    fbCategory?: FBCategory
    fbFbcId: number
    fbCategoryName?: string
    fbUser?: User
    fbUserId: number
    fbGeneralCategory: '' | FBGeneralCategory
    fbInputEvents: Event[]
    fbOutputEvents: Event[]
    fbInputVariables: Variable[]
    fbOutputVariables: Variable[]
    fbExternalDependencies: ExternalDependency[]
    fbFile?: string
}