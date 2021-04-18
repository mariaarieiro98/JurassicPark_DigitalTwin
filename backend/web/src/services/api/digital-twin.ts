import { DigitalTwin, Functionality} from '../../model'
import { apiRoutes, RequestResponseState, RouteMethod, fetchRequest } from './api'
import { AssociatedSmartComponent } from "../../model/model/AssociatedSmartComponent";

export const getDigitalTwins = () : Promise<DigitalTwin[]> => fetchRequest(apiRoutes.getDigitalTwinPath(RouteMethod.get))  

export const getFunctionalities = () : Promise<Functionality[]> => fetchRequest(apiRoutes.getFunctionalityPath(RouteMethod.get))  

export const createDigitalTwin= (digitalTwinName: string) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getDigitalTwinPath(RouteMethod.post),false,{digitalTwinName})            

export const createFunctionality = (functionality: Functionality) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getFunctionalityPath(RouteMethod.post),false, functionality)            

export const deleteDigitalTwin = (id:number) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getDigitalTwinPath(RouteMethod.delete,id))            

export const deleteFunctionality= (id:number) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getFunctionalityPath(RouteMethod.delete,id))   

export const updateDigitalTwin = (id: number, digitalTwinName: string) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getDigitalTwinPath(RouteMethod.put,id),false,{digitalTwinName})            

export const updateFunctionality = (functionality: Functionality) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getFunctionalityPath(RouteMethod.put,functionality.funcId),false,functionality)     

export const getAssociatedSmartComponents = () : Promise<AssociatedSmartComponent[]> => fetchRequest(apiRoutes.getAssociatedSmartComponentPath(RouteMethod.get))  

export const createAssociatedSmartComponents= (assSc: string, scDtId: number) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getAssociatedSmartComponentPath(RouteMethod.post),false, {assSc, scDtId})            