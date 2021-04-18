import { AssociatedSmartComponent} from "../model/index"
import { getAssociatedSmartComponents } from "../services/api/digital-twin"
import { RequestResponseState } from "../services/api/api"


export const getOrDownloadAssociatedSmartComponents = (associatedSmartComponents: AssociatedSmartComponent[]) :  Promise<AssociatedSmartComponent[]> => {
    
    return new Promise((res: Function, rej:Function) => {

        if(associatedSmartComponents.length) 
            res(associatedSmartComponents)
        else 
            getAssociatedSmartComponents ()
                .then((result: AssociatedSmartComponent[]) => res(result))
                .catch((error: RequestResponseState) => rej(error))
    })

}

