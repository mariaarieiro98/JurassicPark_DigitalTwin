import { ACTION_TYPES, Action } from "./actions"
import { FunctionBlock, FBCategory , Functionality, DigitalTwin, SmartComponent } from "../model"
import { Reducer } from "react"
import { AssociatedSmartComponent } from "../model/model/AssociatedSmartComponent"

export const functionBlockReducer : Reducer<FunctionBlock[], Action> = (state: FunctionBlock[], action: Action) : FunctionBlock[] => {

    switch(action.type) {

        case ACTION_TYPES.FUNCTION_BLOCK.UPDATE_FUNCTION_BLOCKS:
            return action.payload

        case ACTION_TYPES.FUNCTION_BLOCK.DELETE_FUNCITON_BLOCK:
            return state.filter((fb: FunctionBlock) => fb.fbId !== action.payload.fbId)
        
        case ACTION_TYPES.FUNCTION_BLOCK.ADD_FUNCITON_BLOCK:
            return [...state, action.payload]

        default:
            throw new Error()

    }

}

export const marketplaceOnlineStateReducer : Reducer<boolean, Action> = (state: boolean, action: Action) : boolean => {

    switch(action.type) {

        case ACTION_TYPES.MARKETPLACEONLINE_STATE.UPDATE_MARKETPLACEONLINE_STATE:
            return action.payload

        default:
            throw new Error()

    }

}

export const functionBlockCategoryReducer : Reducer<FBCategory[], Action> = (state: FBCategory[], action: Action) : FBCategory[] => {

    switch(action.type) {

        case ACTION_TYPES.FUNCTION_BLOCK_CATEGORIES.UPDATE_FUNCTION_BLOCK_CATEGORIES:
            return action.payload

        case ACTION_TYPES.FUNCTION_BLOCK_CATEGORIES.ADD_FUNCTION_BLOCK_CATEGORIES:
            return [...state, action.payload]

        default:
            throw new Error()

    }

}


export const functionalityReducer : Reducer<Functionality[], Action> = (state: Functionality[], action: Action) : Functionality[] => {

    switch(action.type) {

        case ACTION_TYPES.FUNCTIONALITY.UPDATE_FUNCTIONALITIES:
            return action.payload

        case ACTION_TYPES.FUNCTIONALITY.ADD_FUNCTIONALITIES:
            return [...state, action.payload]

        default:
            throw new Error()

    }

}


export const digitalTwinReducer : Reducer<DigitalTwin[], Action> = (state: DigitalTwin[], action: Action) : DigitalTwin[] => {

    switch(action.type) {

        case ACTION_TYPES.DIGITAL_TWIN.UPDATE_DIGITAL_TWINS:
            return action.payload

        case ACTION_TYPES.DIGITAL_TWIN.ADD_DIGITAL_TWINS:
            return [...state, action.payload]

        default:
            throw new Error()

    }

}

export const smartComponentReducer : Reducer<SmartComponent[], Action> = (state: SmartComponent[], action: Action) : SmartComponent[] => {

    switch(action.type) {

        case ACTION_TYPES.SMART_COMPONENT.UPDATE_SMART_COMPONENTS:
            return action.payload

        case ACTION_TYPES.SMART_COMPONENT.ADD_SMART_COMPONENTS:
            return [...state, action.payload]

        default:
            throw new Error()

    }

}

export const associatedSmartComponentReducer : Reducer<AssociatedSmartComponent[], Action> = (state: AssociatedSmartComponent[], action: Action) : AssociatedSmartComponent[] => {

    switch(action.type) {

        case ACTION_TYPES.ASSOCIATED_SMART_COMPONENT.UPDATE_ASSOCIATED_SMART_COMPONENTS:
            return action.payload

        case ACTION_TYPES.ASSOCIATED_SMART_COMPONENT.ADD_ASSOCIATED_SMART_COMPONENTS:
            return [...state, action.payload]

        default:
            throw new Error()

    }

}