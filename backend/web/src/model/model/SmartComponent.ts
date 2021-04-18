import { FBGeneralCategory } from "./FunctionBlock"

export interface FbInstance {
    id:string
    fbType: string
    fbCategory: string
    fbGeneralCategory: FBGeneralCategory
    state: number
}

export interface SmartComponent {
    scId?: number
    scName:string
    scAddress:string
    scPort:number
    scState?: string
    scType?: string,
    cpuPercent?: number
    cpuFreqCurrent?: number
    cpuFreqMin?: number
    cpuFreqMax?: number
    cpuFreq?: number
    memAvailable?: number
    memCached?: number
    memPercentage?: number
    memShared?: number
    memTotal?: number
    memUsed?: number

    fbInstances?: FbInstance []
}