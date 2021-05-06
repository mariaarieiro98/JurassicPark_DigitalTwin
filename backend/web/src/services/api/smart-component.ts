import { MonitoredVariableInstance, SmartComponent } from "../../model";
import { fetchRequest, apiRoutes, RouteMethod , RequestResponseState} from "./api";

export const getSmartComponents = () : Promise<SmartComponent[]> => fetchRequest(apiRoutes.getSmartObjectPath(RouteMethod.get))  

export const getMonitoredVariableInstances = () : Promise<MonitoredVariableInstance[]> => fetchRequest(apiRoutes.getMonitoredVariableInstancePath(RouteMethod.get))  

export const createOrUpdateSmartObject = (sc: SmartComponent) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getSmartObjectPath(RouteMethod.post),false, sc)            
