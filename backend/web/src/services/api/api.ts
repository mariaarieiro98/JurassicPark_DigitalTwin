export enum RouteMethod {
    get='get',
    post='post',
    put='put',
    delete='delete',
    patch='patch'
}

export interface Route {
    path: string
    method: RouteMethod
}

class API {

    private host : string 
    private port : number 
    private base : string

    private resources = {
        functionBlocks: 'function-block',
        functionBlockCategories: 'function-block-category',
        digitalTwins: 'digital-twin',
        functionalities: 'functionality',
        smartComponents: 'smart-component',
        images: 'images',
        icons: 'icons',
        file: 'public',
        associatedSmartComponents: 'associated-smart-components',
        monitoredVariables: 'monitored-variable',
        monitoredEvents: 'monitored-event'
    }

    
    constructor(host: string | undefined, port: string | undefined) {
        this.host = host === undefined ? 'localhost' : host
        this.port = port === undefined ? 3000 : parseInt(port)
        this.base = `${this.host}:${this.port}/`
    }
    
    public getBase = () => this.base
   
    public getImage = (code: string, resource: string) : Route => this.getFile(code,this.resources.images,resource)
    
    public getIcon = (code: string, resource: string) : Route => this.getFile(code,this.resources.icons,resource)

    public getFile = (code: string, type: string, resource: string) : Route => ({
        path: `${this.base}${this.resources.file}/${type}/${resource}/${code}.jpg`,
        method: RouteMethod.get
    })
    
    public getFunctionBlockPath = (method: RouteMethod, id?: number) : Route => ({
        
        path: `${this.base}${this.resources.functionBlocks}/${id ? id : ''}`,
        method: method
        
    })

    public getFunctionBlockCategoryPath = (method: RouteMethod, id?: number) : Route => ({
        
        path: `${this.base}${this.resources.functionBlockCategories}/${id ? id : ''}`,
        method: method
        
    })

    public getDigitalTwinPath = (method: RouteMethod, id?: number) : Route => ({
        
        path: `${this.base}${this.resources.digitalTwins}/${id ? id : ''}`,
        method: method
        
    })

    public getFunctionalityPath = (method: RouteMethod, id?: number) : Route => ({
        
        path: `${this.base}${this.resources.functionalities}/${id ? id : ''}`,
        method: method
        
    })

    public getSmartObjectPath = (method: RouteMethod, id?: number) : Route => ({
        
        path: `${this.base}${this.resources.smartComponents}/${id ? id : ''}`,
        method: method 
    })

    public getAssociatedSmartComponentPath = (method: RouteMethod, id?: number) : Route => ({
        
        path: `${this.base}${this.resources.associatedSmartComponents}/${id ? id : ''}`,
        method: method 
    })

    public getMonitoredVariablePath = (method: RouteMethod, id?: number) : Route => ({
        
        path: `${this.base}${this.resources.monitoredVariables}/${id ? id : ''}`,
        method: method 
    })

    public getMonitoredEventPath = (method: RouteMethod, id?: number) : Route => ({
        
        path: `${this.base}${this.resources.monitoredEvents}/${id ? id : ''}`,
        method: method 
    })
}

/**
 * 
 * @param route 
 * @param body 
 * @param cors 
 * @param headers
 * 
 * @returns Promise that resolves to a RequestResponseState in case of a post,put or delete and a result in case of get, and rejects to a RequestResponseState
 */

export const fetchRequest = (route:Route, hasData:boolean=true, body: Object | undefined = undefined, cors: boolean = true, headers: any = {'Content-Type':'application/json'}) : Promise<any> => {

    let options : RequestInit = {}

    if(cors)
        options.credentials = 'include'

    if(route.method !== RouteMethod.get) {
        options.headers = headers
        options.body = JSON.stringify(body)
        options.method = route.method
    }
 
    return new Promise((res:Function, rej:Function) => {

        fetch(route.path,options).then(result => {

            if(result.ok)
                result.json()
                    .then((json: RequestResponse) => hasData ? res(json.result) : res(json.state))
                    .catch(error =>  rej(unknowErrorState(error)))
            else {
                result.json()
                    .then((json: RequestResponse) => rej(json.state))
                    .catch(error => rej(unknowErrorState(error)))
            }
                
        })
        
        .catch(error => rej(unknowErrorState(error)))

    })

}


const unknowErrorState = (error:any) : RequestResponseState => ({
    
    error: true,
    msg: error.toString ? error.toString() : 'Unknown error',
    errorCode: 0,
    extra: {}
    
})

export interface RequestResponseState {
    error: boolean
    msg: string
    errorCode: number
    extra: any
}

export interface RequestResponse {
    state:RequestResponseState
    result: any
}

export const apiRoutes = new API(process.env.REACT_APP_BACKEND_HOST, process.env.REACT_APP_BACKEND_PORT)