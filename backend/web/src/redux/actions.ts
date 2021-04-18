import { FunctionBlock, FBCategory, DigitalTwin , Functionality, SmartComponent} from "../model"
import { AssociatedSmartComponent } from "../model/model/AssociatedSmartComponent"

export interface Action {
    type: string
    payload: any
}

export const ACTION_TYPES = {

    FUNCTION_BLOCK: {
        UPDATE_FUNCTION_BLOCKS: 'UPDATE_FUNCTION_BLOCKS',
        DELETE_FUNCITON_BLOCK: 'DELETE_FUNCTION_BLOCK',
        ADD_FUNCITON_BLOCK: 'ADD_FUNCTION_BLOCK',
    },

    DIGITAL_TWIN: {
        UPDATE_DIGITAL_TWINS: 'UPDATE_DIGITAL_TWINS',
        DELETE_DIGITAL_TWINS: 'DELETE_DIGITAL_TWINS',
        ADD_DIGITAL_TWINS: 'ADD_DIGITAL_TWINS',
    },

    FUNCTIONALITY: {
        UPDATE_FUNCTIONALITIES: 'UPDATE_FUNCTIONALITIES',
        DELETE_FUNCTIONALITIES: 'DELETE_FUNCTIONALITIES',
        ADD_FUNCTIONALITIES: 'ADD_FUNCTIONALITIES',
    },

    MARKETPLACEONLINE_STATE: {
        UPDATE_MARKETPLACEONLINE_STATE: 'UPDATE_MARKETPLACEONLINE_STATE'
    },

    FUNCTION_BLOCK_CATEGORIES: {
        UPDATE_FUNCTION_BLOCK_CATEGORIES: 'UPDATE_FUNCTION_BLOCK_CATEGORIES',
        DELETE_FUNCTION_BLOCK_CATEGORIES: 'DELETE_FUNCTION_BLOCK_CATEGORY',
        ADD_FUNCTION_BLOCK_CATEGORIES: 'ADD_FUNCTION_BLOCK_CATEGORY',
    }, 

    SMART_COMPONENT: {
        UPDATE_SMART_COMPONENTS: 'UPDATE_SMART_COMPONENTS',
        ADD_SMART_COMPONENTS: 'ADD_SMART_COMPONENTS',
    },

    ASSOCIATED_SMART_COMPONENT: {
        UPDATE_ASSOCIATED_SMART_COMPONENTS: 'UPDATE_ASSOCIATED_SMART_COMPONENTS',
        ADD_ASSOCIATED_SMART_COMPONENTS: 'ADD_ASSOCIATED_SMART_COMPONENTS',
    }
    
}

export class FunctionBlockActions {

    static updateFunctionBlocks = (functionBlocks: FunctionBlock[]) : Action => {
        
        return {
            type: ACTION_TYPES.FUNCTION_BLOCK.UPDATE_FUNCTION_BLOCKS,
            payload: functionBlocks
        }
    }

    static deleteFunctionBlock = (functionBlock: FunctionBlock) : Action => ({

        type: ACTION_TYPES.FUNCTION_BLOCK.DELETE_FUNCITON_BLOCK,
        payload: functionBlock

    })


    static addFunctionBlock = (functionBlock: FunctionBlock) : Action => ({

        type: ACTION_TYPES.FUNCTION_BLOCK.ADD_FUNCITON_BLOCK,
        payload: functionBlock

    })

}

export class DigitalTwinActions {

    static updateDigitalTwins = (digitaltwins: DigitalTwin[]) : Action => {
        
        return {
            type: ACTION_TYPES.DIGITAL_TWIN.UPDATE_DIGITAL_TWINS,
            payload: digitaltwins
        }
    }

    static deleteDigitalTwin = (digitaltwins: DigitalTwin) : Action => ({

        type: ACTION_TYPES.DIGITAL_TWIN.DELETE_DIGITAL_TWINS,
        payload: digitaltwins

    })

    static addDigitalTwin= (digitaltwins: DigitalTwin) : Action => {
        
        return {
            type: ACTION_TYPES.DIGITAL_TWIN.ADD_DIGITAL_TWINS,
            payload: digitaltwins
        }
    }

}

export class FunctionalityActions {

    static updateFunctionalities= (functionalities: Functionality[]) : Action => {
        
        return {
            type: ACTION_TYPES.FUNCTIONALITY.UPDATE_FUNCTIONALITIES,
            payload: functionalities
        }
    }

    static deleteFunctionality = (functionalities:  Functionality) : Action => ({

        type: ACTION_TYPES.FUNCTIONALITY.DELETE_FUNCTIONALITIES,
        payload: functionalities

    })

    static addFunctionality= (functionalities:  Functionality) : Action => {
        
        return {
            type: ACTION_TYPES.FUNCTIONALITY.ADD_FUNCTIONALITIES,
            payload: functionalities
        }
    }

}

export class MarketPlaceOnlineStateActions {

    static updateMarketplaceOnlineState = (state: boolean) : Action => {
        
        return {
            type: ACTION_TYPES.MARKETPLACEONLINE_STATE.UPDATE_MARKETPLACEONLINE_STATE,
            payload: state
        }
    }

}

export class FunctionBlockCategoriesActions {

    static updateFunctionBlockCategories = (fbCategories: FBCategory[]) : Action => {
        
        return {
            type: ACTION_TYPES.FUNCTION_BLOCK_CATEGORIES.UPDATE_FUNCTION_BLOCK_CATEGORIES,
            payload: fbCategories
        }
    }

    static addFunctionBlockCategory = (fbCategory: FBCategory) : Action => {
        
        return {
            type: ACTION_TYPES.FUNCTION_BLOCK_CATEGORIES.ADD_FUNCTION_BLOCK_CATEGORIES,
            payload: fbCategory
        }
    }

}

export class SmartComponentActions {

    static updateSmartComponent = (smartComponent: SmartComponent[]) : Action => {
        
        return {
            type: ACTION_TYPES.SMART_COMPONENT.UPDATE_SMART_COMPONENTS,
            payload: smartComponent
        }
    }

    static addSmartComponent = (smartComponent: SmartComponent) : Action => {
        
        return {
            type: ACTION_TYPES.SMART_COMPONENT.ADD_SMART_COMPONENTS,
            payload: smartComponent
        }
    }

}

export class AssociatedSmartComponentActions {

    static updateAssociatedSmartComponents = (associatedSmartComponent: AssociatedSmartComponent[]) : Action => {
        
        return {
            type: ACTION_TYPES.ASSOCIATED_SMART_COMPONENT.UPDATE_ASSOCIATED_SMART_COMPONENTS,
            payload: associatedSmartComponent
        }
    }

    static addAssociatedSmartComponents = (associatedSmartComponent: AssociatedSmartComponent) : Action => {
        
        return {
            type: ACTION_TYPES.ASSOCIATED_SMART_COMPONENT.ADD_ASSOCIATED_SMART_COMPONENTS,
            payload: associatedSmartComponent
        }
    }

}