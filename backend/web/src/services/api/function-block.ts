import {FunctionBlock, FBCategory} from '../../model'
import { apiRoutes, RequestResponseState, RouteMethod, fetchRequest } from './api'

export const getFunctionBlocks = () : Promise<FunctionBlock[]> => fetchRequest(apiRoutes.getFunctionBlockPath(RouteMethod.get))  

export const getFunctionBlockCategories = () : Promise<FBCategory[]> => fetchRequest(apiRoutes.getFunctionBlockCategoryPath(RouteMethod.get))  

export const createFunctionBlock = (functionBlock:FunctionBlock, fileB64: string) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getFunctionBlockPath(RouteMethod.post),false,{functionBlock,fileB64})            

export const createFunctionBlockCategory = (categoryName:string) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getFunctionBlockCategoryPath(RouteMethod.post),false,{categoryName})            

export const deleteFunctionBlock = (id:number) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getFunctionBlockPath(RouteMethod.delete,id))            

export const deleteFunctionBlockCategory = (id:number) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getFunctionBlockCategoryPath(RouteMethod.delete,id))            

export const updateFunctionBlock = (functionBlock:FunctionBlock, fileB64?: string) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getFunctionBlockPath(RouteMethod.put,functionBlock.fbId),false,{functionBlock,fileB64})            

export const updateFunctionBlockCategory = (id: number, categoryName: string) : Promise<RequestResponseState> => fetchRequest(apiRoutes.getFunctionBlockCategoryPath(RouteMethod.put,id),false,{categoryName})            