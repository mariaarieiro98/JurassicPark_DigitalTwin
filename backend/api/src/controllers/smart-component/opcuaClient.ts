import {OPCUAClient,MessageSecurityMode, 
    SecurityPolicy, 
    ClientSubscription, 
    ClientSession, 
    ReadValueIdLike, MonitoringParametersOptions, ClientMonitoredItem, TimestampsToReturn, DataValue, OPCUAClientOptions, MonitoredItem, AttributeIds, constructBrowsePathFromQualifiedName, VariableTypeIds} from 'node-opcua'

export enum OPCUA_MONITORING_ITEM {

    scName = 'SMART_OBJECT_NAME',
    scDeviceType = 'DEVICE_TYPE',
    diac4Port = '4DIAC_PORT',
    state = 'STATE',
    hwMonitoring = 'HardwareMonitoring'
}

export enum OPCUA_HW_MONITORING {
    cpuFreqCurrent = 'CPU_FREQ_CURRENT',
    cpuFreqMax = 'CPU_FREQ_MAX',
    cpuFreqMin = 'CPU_FREQ_MIN',
    cpuPercentage = 'CPU_PERCENT',
    memAvailable = 'MEM_AVAILABLE',
    memCached = 'MEM_CACHED',
    memPercentage = 'MEM_PERCENTAGE',
    memShared = 'MEM_SHARED',
    memTotal = 'MEM_TOTAL',
    memUsed = 'MEM_USED',
}


export enum FUNCTION_BLOCK_FOLDERS {
    SENSORS = 'DeviceSet',
    INTERFACE = 'PointSet',
    SERVICES = 'ServiceInstanceSet'
}

export const HARDWARE_MONITORING_FOLDER = 'HardwareMonitoring'


export interface ItemNotifier {
    itemToObserve: OPCUA_MONITORING_ITEM | OPCUA_HW_MONITORING
    notifyValueChanged: (variable:OPCUA_MONITORING_ITEM | OPCUA_HW_MONITORING, value:any) => void
}

export interface OpcuaClientObserver {
    observerId?: number
    itemsToObserve: ItemNotifier[]
    notifyFunctionBlockInstanceStateChanged : (functionBlockInstance: string, value: number) => void
    notifyMonitoredVariablesCurrentValueChanged : (fb: string, value: number, variable:string) => void
}

export interface QualquerCoisa{
    notifyMonitoredVariablesCurrentValueChanged : (fb: string, value: number, variable:string) => void
}

export class OpcUaClient {

    static observerCount = 0
    
    observers : OpcuaClientObserver[] = []
    registerObserver(observer:OpcuaClientObserver) {
        observer.observerId = OpcUaClient.observerCount++
        this.observers.push(observer)
    }

    removeObserver(observer:OpcuaClientObserver) {
        this.observers = this.observers.filter((cObserver: OpcuaClientObserver) => observer.observerId !== cObserver.observerId)
    }

    static clientOptions : OPCUAClientOptions = {
        connectionStrategy: {
            initialDelay: 1000,
            maxRetry: 1,
        },
        securityMode: MessageSecurityMode.None,
        securityPolicy: SecurityPolicy.None,
        endpointMustExist: false,
        keepSessionAlive: true,

    }

    static subscriptionOptions = {
        requestedPublishingInterval: 5000,
        requestedLifetimeCount:      100,
        requestedMaxKeepAliveCount:   10,
        maxNotificationsPerPublish:  100,
        publishingEnabled: true,
        priority: 10
    }

    static monitoringParametersOptions : MonitoringParametersOptions = {samplingInterval: 1000, discardOldest: true, queueSize: 10}

    opcUaClient : OPCUAClient
    opcuaSession : ClientSession
    subscription : ClientSubscription
    endPoint : string

    connected = false
    device : string = ''

    monitoredItems : any = {}
    monitoredVariableInstances : any = {}
    monitoredFunctionBlockInstances : any = {}

    static NAME_SPACE = 'ns=2'
    static NODE_ID = `${OpcUaClient.NAME_SPACE};i=1`

    constructor(address: string, port: number) {
        this.endPoint = `opc.tcp://${address}:${port}`
        this.opcUaClient = OPCUAClient.create(OpcUaClient.clientOptions)
    }

    private buildNodeId = (item: OPCUA_MONITORING_ITEM) => `${OpcUaClient.NAME_SPACE};s=${this.device}.${item}`

    private buildHardWareMonitoringNodeId = (item: OPCUA_HW_MONITORING) => `${OpcUaClient.NAME_SPACE};s=${this.device}:${HARDWARE_MONITORING_FOLDER}:${item}`

    public connect(onConnect: () => void, onConnectionLost : () => void) : Promise<string> {

        return new Promise(async (res:Function, rej: Function) => {

            this.opcUaClient.on('connected',() => {
                onConnect()
            })
            this.opcUaClient.on('connection_reestablished',() => {
                onConnect()
            })
            this.opcUaClient.on('connection_lost', () => {
                onConnectionLost()
            })
            this.opcUaClient.on('connection_failed', () => {
                console.log("connection failed")
                onConnectionLost()
            })
            
            try {
                if(!this.connected) {
                    await this.opcUaClient.connect(this.endPoint)
                    this.connected = true
                    this.opcuaSession = await this.opcUaClient.createSession()
                    this.device = (await this.opcuaSession.read({nodeId:OpcUaClient.NODE_ID, attributeId: AttributeIds.DisplayName})).value.value.text
                    this.subscription = ClientSubscription.create(this.opcuaSession,OpcUaClient.subscriptionOptions)
                    this.initializeMonitoredItems()

                }
                res(this.device)
            }
            catch(err) {
                console.error(err)
                rej(`could not connect to ${this.endPoint}`)
            }

        })
    }

    public readDeviceName = () : Promise<string> => {

        return new Promise(async(res:Function, rej:Function) => {

            try {
                this.device = (await this.opcuaSession.read({nodeId:OpcUaClient.NODE_ID, attributeId: AttributeIds.DisplayName})).value.value.text
                res(this.device)

            }
            catch(err) {
                console.error(err)
                rej(err.toString())
            }

        })

    }

    public readMainValue = (item: OPCUA_MONITORING_ITEM) : Promise<any> => {

        return new Promise(async(res:Function, rej:Function) => {

            try {

                const result = await this.opcuaSession.readVariableValue(this.buildNodeId(item))
                res(result.value.value)

            }
            catch(err) {
                console.error(err)
                rej(err.toString())
            }

        })

    }
    
    public disconnect() : Promise<boolean> {

        return new Promise(async (res:Function, rej: Function) => {

            try {
                if(this.connected) {
                    Object.values(this.monitoredItems).forEach((item:MonitoredItem) => {
                        item.removeAllListeners()
                    })
                    Object.values(this.monitoredFunctionBlockInstances).forEach((item:MonitoredItem) => {
                        item.removeAllListeners()
                    })
                    this.subscription.removeAllListeners()
                    this.opcuaSession.removeAllListeners()
                    this.opcUaClient.removeAllListeners()
                    await this.subscription.terminate()
                    await this.opcuaSession.close()
                    await this.opcUaClient.disconnect()
                    this.connected = false
                }
                res(true)
            }
            catch(err) {
                console.error(err)
                rej(false)
            }

        })
    }
    
    private initializeMonitoredItems() {
        this.addHwMonitorItem(OPCUA_HW_MONITORING.cpuFreqCurrent)
        this.addHwMonitorItem(OPCUA_HW_MONITORING.cpuFreqMax)
        this.addHwMonitorItem(OPCUA_HW_MONITORING.cpuFreqMin)
        this.addHwMonitorItem(OPCUA_HW_MONITORING.cpuPercentage)
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memAvailable)
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memCached)
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memPercentage)
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memShared)
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memTotal)
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memUsed)
    }

    private addHwMonitorItem(item:OPCUA_HW_MONITORING) {
        
        const itemToMonitor : ReadValueIdLike= {nodeId: this.buildHardWareMonitoringNodeId(item)}
        this.monitoredItems[item] = ClientMonitoredItem.create(this.subscription,itemToMonitor,OpcUaClient.monitoringParametersOptions,TimestampsToReturn.Both)
        this.addMonitorItemObserver(item)
    }

    private addFunctionBlockStateMonitorItem(fbInstanceId: string) {

        const itemToMonitor : ReadValueIdLike= {nodeId: `${OpcUaClient.NAME_SPACE};s=${fbInstanceId}:FBState`}
        this.monitoredFunctionBlockInstances[fbInstanceId] = ClientMonitoredItem.create(this.subscription,itemToMonitor,OpcUaClient.monitoringParametersOptions,TimestampsToReturn.Both)
        
        this.monitoredFunctionBlockInstances[fbInstanceId].on('changed', (dataValue:DataValue) => {

            this.observers.forEach((observer: OpcuaClientObserver) => {

                observer.notifyFunctionBlockInstanceStateChanged(fbInstanceId, dataValue.value.value)

            })

        })

    }

    private addMonitoredVariableCurrentValueMonitorItem(fb: string, variable:string) {
    
        const itemToMonitor : ReadValueIdLike= {nodeId: `${OpcUaClient.NAME_SPACE};s=${fb}:Variables:${variable}`}

        //Cria mesmo a ligação a monitorizar
        this.monitoredVariableInstances[fb] = ClientMonitoredItem.create(this.subscription,itemToMonitor,OpcUaClient.monitoringParametersOptions,TimestampsToReturn.Both)
        
        this.monitoredVariableInstances[fb].on('changed', (dataValue:DataValue) => {
            //console.log(fb, variable, dataValue.value.value)
          
            this.observers.forEach((observer: OpcuaClientObserver) => {
                
                observer.notifyMonitoredVariablesCurrentValueChanged(fb, dataValue.value.value, variable)
    
            })   
        })
    }
    
    public addMonitorItemObserver(item:OPCUA_MONITORING_ITEM | OPCUA_HW_MONITORING) {

        const monitoredItem = this.monitoredItems[item] as MonitoredItem

        monitoredItem.on("changed", (dataValue: DataValue) => {

            this.observers.forEach((observer: OpcuaClientObserver) => {

                observer.itemsToObserve.forEach((itemToObserve: ItemNotifier) => {

                    if(itemToObserve.itemToObserve === item)
                        itemToObserve.notifyValueChanged(item,dataValue.value.value)

                })

            })

        })   
    }

    public getAllFunctionBlockInstances() : Promise<{id:string, state: number, fbType: string}[]> {

        return new Promise(async(res:Function, rej:Function) => {

            try {

                const sensors = await this.getFunctionBlockInstances(FUNCTION_BLOCK_FOLDERS.SENSORS)
                const services = await this.getFunctionBlockInstances(FUNCTION_BLOCK_FOLDERS.SERVICES)
                const interfaces = await this.getFunctionBlockInstances(FUNCTION_BLOCK_FOLDERS.INTERFACE)
                res([...sensors,...services,...interfaces])

            }

            catch(err) {
                console.error(err)
                rej(err)
            }

        })

    }

    public getAllMonitoredVariableInstances(variable: any[], fb: any[], dinasore: string) : Promise<{id:string, monitoredVariableName: string, currentValue: number}[]> {
       
        return new Promise(async(res:Function, rej:Function) => {

            try {
                const variables = await this.getMonitoredVariableInstances(FUNCTION_BLOCK_FOLDERS.SENSORS, variable, fb, dinasore)
                res([...variables])

            }

            catch(err) {
                console.error(err)
                rej(err)
            }
  
        })

    }

    //Lê a informação relativa à variável VALUE
    private getMonitoredVariableInstances(folder: string, variables: any[], fb: any[], dinasore: string) : Promise<{id:string, monitoredVariableName: string, currentValue: number, sc: string}[]> {
       
        return new Promise(async(res:Function, rej:Function) => {
    
            try {
    
                const result : {id:string, monitoredVariableName: string, currentValue: number, sc: string}[] = []
                
                let i = 0
           
                for(const variable of variables){
                    const id = fb[i]
                    const currentValue = (await this.opcuaSession.read({nodeId:`${OpcUaClient.NAME_SPACE};s=${fb[i]}:Variables:${variable}`})).value.value
                    const monitoredVariableName = variable            
                    const sc = this.device
                    this.addMonitoredVariableCurrentValueMonitorItem(fb[i],variable)
                    result.push({id,currentValue,monitoredVariableName,sc})
                    i++
                }
    
                res(result)
    
            }
    
            catch(err) {
                rej(err)
            }
    
        })

    }

    private getFunctionBlockInstances(folder: string) : Promise<{id:string, state: number, fbType: string}[]> {

        return new Promise(async(res:Function, rej:Function) => {

            try {

                const deviceSetNodeId = `${OpcUaClient.NAME_SPACE};s=${this.device}:${folder}`
                const browseResult = await this.opcuaSession.browse(deviceSetNodeId);
                
                const result : {id:string, state: number,fbType:string}[] = []
        
                for(const reference of browseResult.references) {
                    const id = reference.displayName.text
                    const state = (await this.opcuaSession.read({nodeId:`${OpcUaClient.NAME_SPACE};s=${reference.browseName.name}:FBState`})).value.value
                    const fbType = (await this.opcuaSession.read({ nodeId:`${OpcUaClient.NAME_SPACE};s=${reference.browseName.name}.dID`})).value.value
                    this.addFunctionBlockStateMonitorItem(reference.browseName.name)
                    result.push({id,state,fbType})
                }

                res(result)

            }

            catch(err) {
                rej(err)
            }

        })

    }
   
}
