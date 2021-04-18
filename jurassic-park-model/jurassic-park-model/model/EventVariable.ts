import { FunctionBlock } from "./FunctionBlock";

export enum InOutType {
    in= 'IN',
    out= 'OUT'
}

export enum DataType {
    dtString='STRING',
    dtInt='INT',
    dtUint='UINT',
    dtReal='REAL',
    dtLReal='LREAL',
    dtBool='BOOL'
}

export interface EventVariable {
    evEventId?: number
    evVariableId?: number
    evVariableName: string
    evEventName: string
    evValid?: boolean
}

export interface Event {
    eventId?: number
    eventType: string
    eventName: string
    eventOpcua?: string
    eventInoutType: InOutType
    functionBlock?: FunctionBlock
    eventVariables: EventVariable[]
    eventFbId?: number
}


export interface Variable {
    variableId?: number
    variableName: string
    variableOpcua?: string
    variableInoutType: InOutType
    functionBlock?: FunctionBlock
    variableDataType: '' | DataType
    variableFbId?: number
}