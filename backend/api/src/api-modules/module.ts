import { Api } from '../Api'

export interface MountRoute {
    (app: Api) : void
}

export interface MountModuleRoutes {
    (app: Api) : void
}

export interface ApiRoute {
    path: RegExp,
    method: string,
    withAuthentication: boolean,
    mountRoute: MountRoute
}

export class ApiModule {

    apiRoutes : ApiRoute[]
    moduleNamespaces : string[] = []

    constructor(apiRoutes : ApiRoute[]) {
        this.apiRoutes = apiRoutes
    }

    addRoute = (apiRoute: ApiRoute) => this.apiRoutes.push(apiRoute)
    addNamespace = (namespace: string) => this.moduleNamespaces.push(namespace)

    mountRoutes = (api: Api) => {
        this.apiRoutes.forEach(route => this.mountRoute(route,api))
    }

    mountRoute = (apiRoute : ApiRoute, api: Api) => {

        if(!apiRoute.withAuthentication) {
            
            const findRegex = api.URLS_FILTERS_NO_COOKIE.find(regex => regex.toString() === apiRoute.path.toString())
            const index = api.URLS_FILTERS_NO_COOKIE.indexOf(findRegex)

            if(index == -1) {
    
                api.URLS_FILTERS_NO_COOKIE.push(apiRoute.path)
                api.METHODS_FILTERS_NO_COOKIE.push([apiRoute.method.toUpperCase()])
    
            }
    
            else 
                api.METHODS_FILTERS_NO_COOKIE[index].push(apiRoute.method.toUpperCase())
        }

        apiRoute.mountRoute(api)

    }

}

