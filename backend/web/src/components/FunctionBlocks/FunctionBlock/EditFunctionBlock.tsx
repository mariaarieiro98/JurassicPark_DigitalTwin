import React, { useState } from 'react'
import { useMountEffect, toBase64 } from '../../../utils/main'
import { useRouteMatch, match, Redirect } from 'react-router-dom'
import { FunctionBlock, Variable, Event, FBGeneralCategory, ExternalDependency, FBCategory } from '../../../model/index'
import { useStore } from '../../templates/Store/Store'
import { updateFunctionBlock } from '../../../services/api/function-block'
import { RequestResponseState } from '../../../services/api/api'
import { ConfirmAction, ConfirmActionStateLabel, ConfirmActionState } from '../../templates/ConfirmAction/ConfirmAction'
import { Navigator } from '../../templates/Navigator/Navigator'
import { LazyComponent } from '../../templates/LazyComponent/LazyComponent'
import { FunctionBlockActions, FunctionBlockCategoriesActions } from '../../../redux/actions'
import { FunctionBlockForm } from './FunctionBlockForm'
import { routes } from '../../../App'
import {getOrDownloadFunctionBlocks, getOrDownloadFunctionBlockCategories} from '../../../utils/functionBlock'

const fbUserId = 1

const emptyFile = new File([],'')

export const EditFunctionBlock = () => {
    
    const matchParams : match = useRouteMatch()
    const id = (matchParams.params as any).id
    
    const {data:functionBlocks,dispatchAction:dispatchFunctionBlocksActions} = useStore('functionBlocks')
    const {dispatchAction:dispatchFunctionBlockCategoriesActions} = useStore('functionBlockCategories')

    const updateLocalFunctionBlocks = (fbs: FunctionBlock[]) => dispatchFunctionBlocksActions(FunctionBlockActions.updateFunctionBlocks(fbs))
    const updateLocalFunctionBlock = (fb: FunctionBlock) => dispatchFunctionBlocksActions(FunctionBlockActions.updateFunctionBlocks(functionBlocks.map((cFb:FunctionBlock) => cFb.fbId === fb.fbId ? fb : cFb)))

    const redirectToListAndUpdateLocal = () => {

        updateLocalFunctionBlock(buildFunctionBlock())

        getOrDownloadFunctionBlockCategories([])
            .then((result: FBCategory[]) => dispatchFunctionBlockCategoriesActions(FunctionBlockCategoriesActions.updateFunctionBlockCategories(result)))
            .catch((e:RequestResponseState) => setError(e.msg))        
        
        redirectToList()
    } 

    const buildFunctionBlock = () : FunctionBlock => ({
        fbType,fbDescription, fbId,
        fbFbcId:fbCategory.fbcId as number, fbUserId, fbCategoryName: fbCategory.fbcName,
        fbGeneralCategory, fbInputEvents, 
        fbOutputEvents, fbInputVariables, 
        fbOutputVariables, fbExternalDependencies 
    })

    const [fetching,setFetching] = useState(false)
    const [error,setError] = useState('')
    const [redirectTo, setRedirectTo] : [string, Function] = useState("")

    const [fbImplFile, setFbImplFile] : [File,Function] = useState(emptyFile)

    const initializeFunctionBlock = (fbs: FunctionBlock[]) => {

        let functionBlock : FunctionBlock = fbs.filter((fb: FunctionBlock) => fb.fbId === parseInt(id))[0]
        
        setFbId(functionBlock.fbId)
        setFbType(functionBlock.fbType)
        setFbCategory({fbcId:functionBlock.fbFbcId, fbcName:functionBlock.fbCategoryName, fbcUserId: 1})
        setfbGeneralCategory(functionBlock.fbGeneralCategory)
        setFbDescription(functionBlock.fbDescription)
        setFbInputVariables(functionBlock.fbInputVariables)
        setFbOutputVariables(functionBlock.fbOutputVariables)
        setFbInputEvents(functionBlock.fbInputEvents)
        setFbOutputEvents(functionBlock.fbOutputEvents)
        setFbExternalDependencies(functionBlock.fbExternalDependencies)
        
    }

    useMountEffect(() => {

        setFetching(true)
        getOrDownloadFunctionBlocks(functionBlocks)
            .then((result: FunctionBlock[]) => {
                updateLocalFunctionBlocks(result)
                initializeFunctionBlock(result)
            })
            .catch((e:RequestResponseState) => {
                setError(e.msg)
            })
            .finally(() => setFetching(false))

    })

    const errorState : ConfirmActionState = {
        label: error,
        state: ConfirmActionStateLabel.error,
        positiveLabel: 'Ok'
    }

    const onCancel = () => setError('')
    const redirectToList = () => setRedirectTo(routes.functionBlockList)

    const [fbId, setFbId] : [number,Function] = useState(-1)
    const [fbType,setFbType] : [string,Function] = useState('')
    const [fbCategory,setFbCategory] : [FBCategory,Function] = useState({fbcName:'', fbcUserId: -1})
    const [fbGeneralCategory,setfbGeneralCategory] : ['' | FBGeneralCategory,Function] = useState('')
    const [fbDescription,setFbDescription] : [string,Function] = useState('')
    const [fbInputVariables,setFbInputVariables] : [Variable[],Function] = useState([])
    const [fbOutputVariables,setFbOutputVariables] : [Variable[],Function] = useState([])
    const [fbInputEvents,setFbInputEvents] : [Event[],Function] = useState([])
    const [fbOutputEvents,setFbOutputEvents] : [Event[],Function] = useState([])
    const [fbExternalDependencies, setFbExternalDependencies] : [ExternalDependency[], Function] = useState([])

    const editFunctionBlockAction = () : Promise<string> => {

        const functionBlock : FunctionBlock = buildFunctionBlock()
    
        return new Promise<string>((res:Function, rej:Function)  => {
    
          setTimeout(() => {

            if(fbImplFile !== emptyFile) {

                toBase64(fbImplFile)
        
                    .then((file:string) => {
                        editFunctionBlockApiCall(functionBlock,file)
                            .then((response:string) => res(response))
                            .catch((error:string) => rej(error))
                    })
        
                  .catch(e => rej('Error sending implementation file'))
            }

            else 
                editFunctionBlockApiCall(functionBlock)
                    .then((response:string) => res(response))
                    .catch((error:string) => rej(error))
    
          },0)
    
        }) 
    
    }

    const editFunctionBlockApiCall = (functionBlock: FunctionBlock, file?: string) => {

        return new Promise<string>((res:Function, rej:Function)  => {
            
            updateFunctionBlock(functionBlock,file)
                  
                .then((r:RequestResponseState) => res(r.msg)) 
                .catch((e:RequestResponseState) => { 
                    console.error(e)
                    rej(e.msg)
                })

        })

    }

    
    if(redirectTo !== "") 
        return <Redirect to={redirectTo} push={true} />

    return (
        <Navigator title="Function Blocks">
            <> 
                {error !== ''
                ? <ConfirmAction title='Fetching Function Blocks' currentState={errorState} states={{error: errorState}} onCancel={onCancel}/>
                : null 
                }
                <LazyComponent loaded={!fetching}>
                <FunctionBlockForm 
                    fbType={{fbType, setFbType}}
                    fbGeneralCategory={{fbGeneralCategory,setfbGeneralCategory}}
                    fbCategory={{fbCategory,setFbCategory}}
                    fbDescription={{fbDescription,setFbDescription}}
                    fbInputVariables={{fbInputVariables,setFbInputVariables}}
                    fbOutputVariables={{fbOutputVariables,setFbOutputVariables}}
                    fbInputEvents={{fbInputEvents,setFbInputEvents}}
                    fbOutputEvents={{fbOutputEvents,setFbOutputEvents}}
                    fbExternalDependencies={{fbExternalDependencies,setFbExternalDependencies}}
                    fbImplFile={{fbImplFile,setFbImplFile}}
                    cancel={{action: redirectToList, label: 'Cancel'}}
                    confirmDialog={{
                        buttonTitle: 'Confirm',
                        title: 'Creating Function Block',
                        initialState: ConfirmActionStateLabel.executing,
                        action: editFunctionBlockAction,
                        onSuccess: redirectToListAndUpdateLocal,
                        success: {
                            label: '',
                            positiveLabel: 'Ok'
                        },
                        error: {
                            label: '',
                            positiveLabel: 'Ok'
                        }}}
                    byPassFields={{fbImplFile: true}}
                />
                </LazyComponent>
            </>
        </Navigator>
    )
}