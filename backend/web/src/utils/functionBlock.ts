import { xml2js, Element } from "xml-js"
import { FunctionBlock, InOutType, Variable, Event, EventVariable, FBCategory, Functionality } from "../model"
import { readLocalFile } from "./main"
import { getFunctionBlocks, getFunctionBlockCategories } from "../services/api/function-block"
import { RequestResponseState } from "../services/api/api"

export const getFBfromFbtFile = (file: File) : Promise<FunctionBlock> => {

    return new Promise(async (res:Function, rej:Function) => {

        const result : FunctionBlock = {
            fbDescription:'',
            fbExternalDependencies: [],
            fbFbcId: 1,
            fbGeneralCategory: '',
            fbInputEvents: [],
            fbOutputEvents: [],
            fbInputVariables: [],
            fbOutputVariables: [],
            fbType: '',
            fbUserId: 1
        }

        const rejectNotWellFormed = (elementName?: string) =>  {
            rej('FBT not well formed' + (elementName ? `: Element ${elementName} not well formed` : ''))
            return false
        }

        const getFBTypeElement = (fbJs: any) => {

            let fbElement = null
            for(let i = 0; i < fbJs.elements.length; i++) {
                const element = fbJs.elements[i]
                if(element.type === 'element' && element.name === 'FBType') {
                    fbElement = element
                    break
                }
            }
            return fbElement

        }

        const verifyMandatoryElements = (fbJs: any) : boolean =>  {

            if(!fbJs.elements || fbJs.elements.length < 2) return rejectNotWellFormed()

            const fbElement = getFBTypeElement(fbJs)

            if(!fbElement) return rejectNotWellFormed()

            if(!(verifyElement(fbElement,'FBType',['Name'],1))) return rejectNotWellFormed('FBType')
            if(!verifyElement(fbElement.elements[0],'InterfaceList',[],4)) return rejectNotWellFormed('InterfaceList')
            if(!verifyElement(fbElement.elements[0].elements[0],'EventInputs')) return rejectNotWellFormed('EventInputs')
            if(!verifyElement(fbElement.elements[0].elements[1],'EventOutputs')) return rejectNotWellFormed('EventOutputs')
            if(!verifyElement(fbElement.elements[0].elements[2],'InputVars')) return rejectNotWellFormed('InputVars')
            if(!verifyElement(fbElement.elements[0].elements[3],'OutputVars')) return rejectNotWellFormed('OutputVars')

            return true

        }

        const getVariables = (variableList: any, inOutYpe:InOutType) : {variables:Variable[], varNames: string[]} | undefined => {

            const result : {variables:Variable[], varNames: string[]} = {variables:[], varNames:[]}

            if(!variableList.elements) return result

            for(let i = 0; i < variableList.elements.length; i++) {

                const variable = variableList.elements[i]
                if(!verifyElement(variable,'VarDeclaration',['Name','Type'])) {
                    rejectNotWellFormed('VarDeclaration')
                    return
                }
                result.variables.push({
                    variableDataType: variable.attributes.Type, 
                    variableInoutType: inOutYpe, 
                    variableName: variable.attributes.Name,
                    variableOpcua: variable.attributes.OpcUa
                })

                result.varNames.push(variable.attributes.Name)
                
            }

            return result

        } 

        const getEvents = (eventList: any, inOutYpe:InOutType, variableNames: string[]) : Event[] | undefined => {

            const result : Event[] = []
            if(!eventList.elements) return result

            for(let i = 0; i < eventList.elements.length; i++) {

                const event = eventList.elements[i]
                if(!verifyElement(event,'Event',['Name','Type'])) {
                    rejectNotWellFormed('Event')
                    return
                }

                const eventVars : EventVariable[] = []

                if(event.elements) {
                    
                    for(let j = 0; j < event.elements.length; j++) {

                        const eventVariable = event.elements[j]
                        if(!verifyElement(eventVariable,'With',['Var']) || !variableNames.includes(eventVariable.attributes.Var)) {
                            rejectNotWellFormed('With')
                            return
                        }
                        eventVars.push({
                            evEventName: event.attributes.Name,
                            evVariableName: eventVariable.attributes.Var
                        })

                    }
                }

                result.push({
                    eventName: event.attributes.Name, 
                    eventType: event.attributes.Type, 
                    eventInoutType: inOutYpe,
                    eventVariables: eventVars,
                    eventOpcua: event.attributes.OpcUa
                })
                
            }

            return result

        } 

        try {

            const fbtString = await readLocalFile(file)
            const fbJs = xml2js(fbtString)

            if(!verifyMandatoryElements(fbJs)) return
            
            const fbTypeElement = getFBTypeElement(fbJs)

            result.fbType = fbTypeElement.attributes.Name
            result.fbGeneralCategory = fbTypeElement.attributes.OpcUa

            const fbInterfaceListElement = fbTypeElement.elements[0]
            const fbInputVarsElement = fbInterfaceListElement.elements[2]
            const fbOutputVarsElement = fbInterfaceListElement.elements[3]
            const fbEventInputsElement = fbInterfaceListElement.elements[0]
            const fbEventOutputsElement = fbInterfaceListElement.elements[1]

            const fbInputVariables = getVariables(fbInputVarsElement, InOutType.in)
            const fbOutputVariables = getVariables(fbOutputVarsElement, InOutType.out)

            if(!fbInputVariables || !fbOutputVariables) return 
            
            const fbInputEvents = getEvents(fbEventInputsElement, InOutType.in,fbInputVariables.varNames)
            const fbOutputEvents = getEvents(fbEventOutputsElement, InOutType.out,fbOutputVariables.varNames)

            if(!fbInputEvents || !fbOutputEvents) return 
            
            result.fbInputVariables = fbInputVariables.variables
            result.fbOutputVariables = fbOutputVariables.variables
            result.fbInputEvents = fbInputEvents
            result.fbOutputEvents = fbOutputEvents

            res(result)

        }

        catch(err) {
            console.error(err)
            rej('Error reading fbt file')
        }

    })

}

const verifyElement = (element: Element,name: string, attributes?: string[], elementsLength?: number, type: 'element' | 'doctype' = 'element') : boolean => {
    
    if(!(element.type === type)) return false
    if(!(element.name === name)) return false
    
    if(!!elementsLength) {

        if(!element.elements) return false
        if(element.elements.length !== elementsLength) return false
    
    }

    if(!!attributes && !!attributes.length) {
        
        if(!element.attributes) return false
        
        for(let i = 0; i < attributes.length; i++) {
            if(!(attributes[i] in element.attributes)) {
                return false
            }
        }
        
    }

    return true
        
}

export const getOrDownloadFunctionBlocks = (fbs: FunctionBlock[]) :  Promise<FunctionBlock[]> => {

    return new Promise((res: Function, rej:Function) => {

        if(fbs.length) 
            res(fbs)
        else 
            getFunctionBlocks()
                .then((result:FunctionBlock[]) => res(result))
                .catch((error: RequestResponseState) => rej(error))
    })

}

export const getOrDownloadFunctionBlockCategories = (fbCategories: FBCategory[]) :  Promise<FBCategory[]> => {

    return new Promise((res: Function, rej:Function) => {

        if(fbCategories.length) 
            res(fbCategories)
        else 
            getFunctionBlockCategories()
                .then((result:FBCategory[]) => res(result))
                .catch((error: RequestResponseState) => rej(error))
    })

}

