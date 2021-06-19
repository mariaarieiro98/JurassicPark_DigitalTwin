import { RequestResponse } from "../../utils/request"
import {SmartComponentController} from './SmartComponentController'
import {SocketEngineInterface} from '../../SocketEngine'
import { appendLineToFile, getLinesOfFiles } from "../../utils/utils"

class SmartComponentMainController implements SocketEngineInterface {
    
    static RUNNING_SC_FILE = './.running_sc.csv'
    
    namespace: string = 'smart-component'
    smartComponentIndividualControllers : SmartComponentController [] = []
    fetched : boolean = false
    private static id = 1
    
    constructor() {
        
        getLinesOfFiles(SmartComponentMainController.RUNNING_SC_FILE)
        .then(async (runningSmartComponents:string[]) => {
            
            for(let i = 0; i < runningSmartComponents.length; i++) {
                const runningSmartComponent : string = runningSmartComponents[i]
                const [address,port,lastName,lastType] = runningSmartComponent.split(';')
                console.log("running:", runningSmartComponents)
                await this.createOrUpdateSmartObject(new RequestResponse(),address,parseInt(port),true,lastName,lastType)
            }
            
        })
        .catch(error =>console.error('Error reading running scs file', error))
    }
    
    public initializer = {
        data: () => this.getSmartObjectSData(new RequestResponse())
    }
    
    public getSmartObjectSData(response: RequestResponse, filters?: {key:string, value: number | string | boolean}[]) : RequestResponse {
        const result = this.getSmartObjects(response,filters).getResult().map((sc: SmartComponentController) => sc.data)
        response.setResult(result)
        return response
        
    }
    
    public getSmartObjects(response: RequestResponse, filters?: {key:string, value: number | string | boolean}[]) : RequestResponse {
        
        const finalResult = this.smartComponentIndividualControllers?.filter((sc: SmartComponentController) => {
            let filtered = true
            for(let i = 0; i < filters?.length; i++) {
                let filter = filters[i]
                if(sc.data[filter.key] !== filter.value) {
                    filtered = false
                    break
                }
            } 
            return filtered
            
        })
        
        response.setResult(finalResult)
        
        return response
    }
    
    public createOrUpdateSmartObject(response:RequestResponse, address:string, port:number, previousRunning:boolean = false,  name?:string, type?:string) : Promise<RequestResponse> {
        
        return new Promise(async (res:Function, rej:Function) => {
            
            try {
                
                let scController : SmartComponentController
                let existingSCS = this.getSmartObjects(new RequestResponse(),[{key: 'scAddress', value: address},{key: 'scPort', value: port}])
                //console.log("existingSCS:", existingSCS)
                
                if(existingSCS.getResult().length) {
                    
                    scController = existingSCS.getResult()[0] as SmartComponentController                    
                    await scController.reconnectToOpcUa()
                    response.setResult(`Smart Object ${scController.data.scName} updated`)
                    res(response)
                }
                
                else {
                    
                    //let id = name.match(/\d+/g).map(Number)
                    let id =  SmartComponentMainController.id++
                    //console.log("adress, name, type, port:", address, name, type, port)
                    
                    scController = await SmartComponentController.buildSmartComponentController(address, port, id, name,type)
                    
                    this.smartComponentIndividualControllers.push(scController)
                    response.setResult('Smart Object Registered')
                    res(response)
                    if(!previousRunning)
                    await appendLineToFile(`${address};${port};${scController.data.scName};${scController.data.scType}`,SmartComponentMainController.RUNNING_SC_FILE)     
                }
                
                
            }
            
            catch(err) {
                console.error('Error during creating or updating Smart Component')
                console.error(err)
                response.setErrorState(err)
                rej(response)
            }
        })
        
    }

   public killAllSubsctiptions(){
        
        let existingSCS = this.getSmartObjects(new RequestResponse())
            
        let smartComponentController = existingSCS.getResult()

        for(const scc of smartComponentController){
            scc.killSubsctiptions()
        }

   }
    
    public readAllFunctions(){

        let existingSCS = this.getSmartObjects(new RequestResponse())
        
        const smartComponentController = existingSCS.getResult()
        
        for(const scc of smartComponentController){

            if((scc.data.scState === 'connected')){
            
                scc.readMVandNotify()
            }
        }
        
    }
    
}

export const smartComponentMainController = new SmartComponentMainController()