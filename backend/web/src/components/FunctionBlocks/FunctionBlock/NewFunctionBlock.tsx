import React, { useState } from 'react'
import { Navigator } from '../../templates/Navigator/Navigator'
import { FBGeneralCategory, Variable, Event, FunctionBlock, ExternalDependency, FBCategory } from '../../../model/index'
import { Redirect } from 'react-router-dom'
import { routes } from '../../../App'
import { createFunctionBlock } from '../../../services/api/function-block'
import { ConfirmActionStateLabel } from '../../templates/ConfirmAction/ConfirmAction'
import { RequestResponseState } from '../../../services/api/api'
import { setTimeout } from 'timers'
import { FunctionBlockForm } from './FunctionBlockForm'
import { toBase64, useMountEffect } from '../../../utils/main'
import { useStore } from '../../templates/Store/Store'
import { FunctionBlockActions, FunctionBlockCategoriesActions } from '../../../redux/actions'
import { getOrDownloadFunctionBlocks } from '../../../utils/functionBlock'

/**
 * for now
 */

const fbUserId = 1

export const NewFunctionBlock = () => {

  useMountEffect(() => {
    
    getOrDownloadFunctionBlocks(functionBlocks)
      .then((result: FunctionBlock[]) => {
          dispatchFunctionBlocksActions(FunctionBlockActions.updateFunctionBlocks(result))
      })
      .catch((e:RequestResponseState) => {
          console.error(e)
      })

  })

  const {data: functionBlocks, dispatchAction:dispatchFunctionBlocksActions} = useStore('functionBlocks')
  const {data: functionBlockCategories, dispatchAction:dispatchFunctionBlockCategoriesActions} = useStore('functionBlockCategories')

  const [redirectTo, setRedirectTo] : [string, Function] = useState("")

  const [fbType,setFbType] : [string,Function] = useState('')
  const [fbDescription, setFbDescription] : [string,Function] = useState('')
  const [fbCategory, setFbCategory] : [FBCategory, Function] = useState({fbcName: '', fbcUserId: 1, fbcId: -1})
  const [fbGeneralCategory, setfbGeneralCategory] : ['' | FBGeneralCategory,Function] = useState('')
  const [fbImplFile, setFbImplFile] : [File,Function] = useState(new File([],''))
  
  const [fbInputVariables, setFbInputVariables] : [Variable[],Function] = useState([])
  const [fbOutputVariables, setFbOutputVariables] : [Variable[],Function] = useState([])

  const [fbInputEvents, setFbInputEvents] : [Event[], Function] = useState([])
  const [fbOutputEvents, setFbOutputEvents] : [Event[], Function] = useState([])

  const [fbExternalDependencies, setFbExternalDependencies] : [ExternalDependency[], Function] = useState([])

  let fbId = 1

  const redirectToList = () => setRedirectTo(routes.functionBlockList)

  const buildFunctionBlock = () : FunctionBlock => ({
    fbType,fbDescription, fbId,
    fbFbcId:fbCategory.fbcId as number, fbUserId, fbCategoryName: fbCategory.fbcName,
    fbGeneralCategory, fbInputEvents, 
    fbOutputEvents, fbInputVariables, 
    fbOutputVariables, fbExternalDependencies
  })

  const redirectToListAndUpdateLocal = () => {
    dispatchFunctionBlocksActions(FunctionBlockActions.addFunctionBlock(buildFunctionBlock()))

    const newCategories = functionBlockCategories.map((cat: FBCategory) => {

      if(cat.fbcId !== fbCategory.fbcId)
        return cat

      const oldCatFbs = cat.functionBlocks ?? []

      return {...cat, functionBlocks: [...oldCatFbs, fbType]}

    })

    dispatchFunctionBlockCategoriesActions(FunctionBlockCategoriesActions.updateFunctionBlockCategories(newCategories))
    redirectToList()
  } 

  const createFunctionBlockAction = () : Promise<string> => {

    const functionBlock : FunctionBlock = buildFunctionBlock()
    
    return new Promise<string>((res:Function, rej:Function)  => {

      setTimeout(() => {

        toBase64(fbImplFile)

          .then((file:string) => {

            createFunctionBlock(functionBlock,file)
      
              .then((r:RequestResponseState) => {
                fbId = r.extra.lastInsertedId
                res(r.msg)
              }) 
              .catch((e:RequestResponseState) => rej(e.msg))


          })

          .catch(e => rej('Error sending implementation file'))

      },0)

    }) 

  }
  
  if(redirectTo !== "") 
    return <Redirect to={redirectTo} push={true} />
  
  return (
    <Navigator title="New Function Block">
      <>
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
          action: createFunctionBlockAction,
          onSuccess: redirectToListAndUpdateLocal,
          success: {
            label: '',
            positiveLabel: 'Ok'
          },
          error: {
            label: '',
            positiveLabel: 'Ok'
          },
        }}
      />
      </>
    </Navigator>
  )
}