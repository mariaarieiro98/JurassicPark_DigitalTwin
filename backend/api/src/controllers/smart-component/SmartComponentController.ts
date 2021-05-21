import {SmartComponent as SmartComponentData, FunctionBlock, FbInstance, MonitoredVariableInstance, MonitoredVariable} from '../../model'
import { OpcUaClient, OPCUA_MONITORING_ITEM, OPCUA_HW_MONITORING, OpcuaClientObserver, ItemNotifier } from './opcuaClient'
import {socketEngine} from '../../index'
import { SocketEngineInterface } from '../../SocketEngine'
import { functionBlockMainController } from '../function-block/functionBlockMainController'
import { RequestResponse } from '../../utils/request'
import { digitalTwinMainController } from '../digital-twin/digitalTwinMainController'

export class SmartComponentController implements SocketEngineInterface,OpcuaClientObserver {

    static EDITED_SC_EVENT = 'smart-component-updated'
    static EDITED_FBI_EVENT = 'smart-component-fbi-updated'
    static BASE_NAME_SPACE = 'smart-component'
    static EDITED_MVI_EVENT = 'smart-component-mvi-updated'

    data : SmartComponentData
    opcuaController : OpcUaClient
    namespace : string

    initializer = {
        data: () => {
            return this.data
        } 
    }

    private constructor(address: string, port: number, id: number, name?:string, type?:string) {
        this.opcuaController = new OpcUaClient(address,port)
        this.opcuaController.registerObserver(this)
        this.namespace = `${SmartComponentController.BASE_NAME_SPACE}/${id}`
        this.data = {
            scAddress:address,
            scPort: port,
            scName: name ?? '',
            scType: type ?? '',
            scId: id,
        }
    }

    static buildSmartComponentController = (address: string, port: number, id: number, name?:string, type?:string) : Promise<SmartComponentController> => {

        return new Promise((res:Function, rej:Function) => {

            const smartComponentController : SmartComponentController = new SmartComponentController(address,port,id,name,type)            
            smartComponentController.opcuaController.connect(smartComponentController.setConnected, smartComponentController.setDisconnected)

                .then(async (result: string) => {
                    try {
                        await smartComponentController.readMainValuesAndNotifyClient()
                        await smartComponentController.readFunctionBlocksAndNotifyClient()
                        await smartComponentController.readMonitoredVariablesAndNotifyClient()
                        res(smartComponentController)
                    }
                    catch(err) {
                        res(smartComponentController)
                    }
                })

                .catch(err => {
                    console.error(err)
                    res(smartComponentController)
                })

                .finally(() => {
                    socketEngine.createNamespace(smartComponentController)
                })

        })

    }

    setConnected = () => {
        this.data.scState = 'connected'
        this.notifyClientScUpdated()
    } 
    
    setDisconnected = () => {
        this.data.scState = 'disconnected'
        this.notifyClientScUpdated()
    }

    private buildHWNotifier(item: OPCUA_MONITORING_ITEM | OPCUA_HW_MONITORING, key: keyof SmartComponentData) : ItemNotifier {
        return {
            itemToObserve: item,
            notifyValueChanged: (item: OPCUA_MONITORING_ITEM | OPCUA_HW_MONITORING, value:any) => {
                this.data[`${key}`] = value
                this.notifyClientScUpdated()
            }
        }
    }

    itemsToObserve = [
        this.buildHWNotifier(OPCUA_HW_MONITORING.cpuFreqCurrent, 'cpuFreqCurrent'),
        this.buildHWNotifier(OPCUA_HW_MONITORING.cpuFreqMax, 'cpuFreqMax'),
        this.buildHWNotifier(OPCUA_HW_MONITORING.cpuFreqMin, 'cpuFreqMin'),
        this.buildHWNotifier(OPCUA_HW_MONITORING.cpuPercentage, 'cpuPercent'),
        this.buildHWNotifier(OPCUA_HW_MONITORING.memAvailable, 'memAvailable'),
        this.buildHWNotifier(OPCUA_HW_MONITORING.memCached, 'memCached'),
        this.buildHWNotifier(OPCUA_HW_MONITORING.memPercentage, 'memPercentage'),
        this.buildHWNotifier(OPCUA_HW_MONITORING.memShared, 'memShared'),
        this.buildHWNotifier(OPCUA_HW_MONITORING.memTotal, 'memTotal'),
        this.buildHWNotifier(OPCUA_HW_MONITORING.memUsed, 'memUsed'),
    ]
    
    private readMainValuesAndNotifyClient = async () => {

        try {

            const type = await this.opcuaController.readMainValue(OPCUA_MONITORING_ITEM.scDeviceType)
            const name = await this.opcuaController.readDeviceName()
            this.data.scType = type
            this.data.scName = name
            this.data.scState = 'connected'
            this.notifyClientScUpdated()

        }

        catch(err) {
            console.error(err)
            console.error("Error reading main values")
        }

    }
    
    notifyClientScUpdated = () => {
        socketEngine.sendMessageToClient([SmartComponentController.BASE_NAME_SPACE, this.namespace],SmartComponentController.EDITED_SC_EVENT,{sc:this.data})
    }
    
    notifyClientFBIUpdated = () => {
        socketEngine.sendMessageToClient([SmartComponentController.BASE_NAME_SPACE, this.namespace],SmartComponentController.EDITED_FBI_EVENT,this.data.fbInstances)
    }

    notifyClientMonitoredVariableValueUpdated = () => {
        socketEngine.sendMessageToClient([SmartComponentController.BASE_NAME_SPACE, this.namespace],SmartComponentController.EDITED_MVI_EVENT,this.data.monitoredVariableInstances)
    }

    reconnectToOpcUa() {
        
        return new Promise(async (res:Function, rej:Function) => {

            try {
                await this.opcuaController.disconnect()
                await this.opcuaController.connect(this.setConnected,this.setDisconnected)
                await this.readMainValuesAndNotifyClient()
                await this.readFunctionBlocksAndNotifyClient()
                await this.readMonitoredVariablesAndNotifyClient()
                res()
            }

            catch(err) {
                console.error(err)
                rej()
            }


        })
    }

    private async readFunctionBlocksAndNotifyClient() {

        try {
            
            const functionBlockInstances = await this.opcuaController.getAllFunctionBlockInstances()
    
            const promisesFB = []
    
            functionBlockInstances.forEach((element:{id:string, state:number, fbType: string}) => {
                promisesFB.push(functionBlockMainController.getFunctionBlocks(new RequestResponse(),[{key: 'fbType', value: element.fbType}]))
            })
    
            const fbs = await Promise.all(promisesFB)

            this.data.fbInstances = functionBlockInstances.map((element:{id:string, state:number, fbType: string}, index:number) => {
                
                const fb : FunctionBlock = fbs[index].result[0] ?? undefined
                return {
                    id:element.id, 
                    state: element.state[1], 
                    fbCategory: fb?.fbCategoryName,
                    fbGeneralCategory: fb?.fbGeneralCategory,
                    fbType: element.fbType
                }
            })

            //console.log("this.data.fbInstances", this.data.fbInstances)
            
            this.notifyClientFBIUpdated()
        }

        catch(err) {
            console.error(err)
        }
    }

    notifyFunctionBlockInstanceStateChanged(functionBlockInstanceId: string, value: number) {
      
        this.data.fbInstances = this.data.fbInstances.map((instance: FbInstance) => {

            if(instance.id === functionBlockInstanceId)
                instance.state = value[1]
            return instance

        })

        this.notifyClientFBIUpdated()

    }

    notifyMonitoredVariablesCurrentValueChanged(fb: string, value: number, variable:string) {
        
        this.data.monitoredVariableInstances = this.data.monitoredVariableInstances.map((instance: MonitoredVariableInstance) => {
            if((instance.id === fb) && (instance.monitoredVariableName === variable))
                instance.currentValue = value
            return instance

        })

        this.notifyClientMonitoredVariableValueUpdated()
    }

    public readMVandNotify() {

        this.readMonitoredVariablesAndNotifyClient()
    }

    //Lê a informação relativa à variável VALUE
    private async readMonitoredVariablesAndNotifyClient() {

        try {
        
            const monitoredVariables : {idMonitoredVariable: number, monitoredVariableName:string,scAssociated:string, fbAssociated:string}[] = (await digitalTwinMainController.getMonitoredVariable(new RequestResponse())).getResult().map((monVar:MonitoredVariable) => ({idMonitoredVariable: monVar.idMonitoredVariable, monitoredVariableName: monVar.monitoredVariableName, scAssociated:monVar.scAssociated, fbAssociated:monVar.fbAssociated}))
            
            let dinasore = this.namespace.slice(this.namespace.length-1,this.namespace.length)
            dinasore="dinasore"+dinasore
        
            let i=0
            let monitoredVariablesName = []
            let monitoredVariablesFb = []
            let afterFilterMonFB = []
            let afterFilterMonName = []
        
            while(i<monitoredVariables.length){

                if(dinasore === monitoredVariables[i].scAssociated){
                    monitoredVariablesName[i] = monitoredVariables[i].monitoredVariableName
                    monitoredVariablesFb[i] = monitoredVariables[i].fbAssociated
                }
                

                i++
            }
           
            i=0
           
            for (const monVarName of monitoredVariablesName) {

                if(monVarName){
                   afterFilterMonName.push(monVarName) 
                }
                

                i++
            }
            
            i=0
           
            for (const monVarFb of monitoredVariablesFb) {

                if(monVarFb){
                    afterFilterMonFB.push(monVarFb) 
                }
                i++
                

            }

            const monitoredVariableValues = await this.opcuaController.getAllMonitoredVariableInstances(afterFilterMonName, afterFilterMonFB)
            const promisesMVI = []
           
            monitoredVariableValues.forEach((element:{id:string, monitoredVariableName: string, currentValue: number}) => {
                promisesMVI.push(digitalTwinMainController.getMonitoredVariable(new RequestResponse(),[{key: 'monitoredVariableName', value: element.monitoredVariableName}]))
            })
    
            const mvis = await Promise.all(promisesMVI)

            this.data.monitoredVariableInstances = monitoredVariableValues.map((element:{id:string, monitoredVariableName: string, currentValue: number, sc: string}, index:number) => {
                
                const monVar : MonitoredVariableInstance = mvis[index].result[0] ?? undefined
                
                return {
                    id: element.id, 
                    currentValue: element.currentValue,
                    monitoredVariableName: element.monitoredVariableName,
                    sc: element.sc
                }
            })  
          
            this.notifyClientMonitoredVariableValueUpdated()
        }

        catch(err) {
            console.error(err)
        }
    }

}