import React, { useState } from 'react'
import { Navigator } from '../templates/Navigator/Navigator'
import { FBGeneralCategory, Variable, Event, FunctionBlock, ExternalDependency, FBCategory, DigitalTwin, AssociatedSmartComponent } from '../../model/index'
import { Redirect } from 'react-router-dom'
import { routes } from '../../App'
import { createFunctionBlock } from '../../services/api/function-block'
import { ConfirmActionStateLabel } from '../templates/ConfirmAction/ConfirmAction'
import { RequestResponseState } from '../../services/api/api'
import { setTimeout } from 'timers'
import { DigitalTwinForm } from './DigitalTwinForm'
import { toBase64, useMountEffect } from '../../utils/main'
import { useStore } from '../templates/Store/Store'
import { DigitalTwinActions, FunctionBlockActions, FunctionBlockCategoriesActions } from '../../redux/actions'
import { getOrDownloadFunctionBlocks } from '../../utils/functionBlock'
import { getOrDownloadDigitalTwins } from '../../utils/digitalTwins'
import { createDigitalTwin } from '../../services/api/digital-twin'
import { createAssociatedSmartComponents } from '../../services/api/digital-twin'

/**
 * for now
 */

const dtUserId = 1

export const NewDigitalTwin = () => {

  useMountEffect(() => {
    
    getOrDownloadDigitalTwins(digitalTwins)
      .then((result: DigitalTwin[]) => {
          dispatchDigitalTwinActions(DigitalTwinActions.updateDigitalTwins(result))
      })
      .catch((e:RequestResponseState) => {
          console.error(e)
      })

  })

  const {data: digitalTwins, dispatchAction:dispatchDigitalTwinActions} = useStore('digitalTwins')
  
  const [redirectTo, setRedirectTo] : [string, Function] = useState("")

  const [dtName,setDtName] : [string,Function] = useState('')
  const [associatedSc,setAssociatedSc] : [string,Function] = useState('')
  
  const [fbInputVariables, setFbInputVariables] : [Variable[],Function] = useState([])

  let dtId = 1
  let idAssociatedSmartComponent = 1

  const redirectToList = () => setRedirectTo(routes.functionBlockList)

  const buildDigitalTwin = () : DigitalTwin => ({
    dtName, dtId,
    dtUserId,
  })

  const redirectToListAndUpdateLocal = () => {
    dispatchDigitalTwinActions(DigitalTwinActions.addDigitalTwin(buildDigitalTwin()))

    //dispatchAssociatedSmartComponentActions(AssociatedSmartComponentActions.updateFunctionBlockCategories(newCategories))
    redirectToList()
  } 

  const createDigitalTwinAction = () : Promise<string> => {
    
    return new Promise<string>((res:Function, rej:Function)  => {

      setTimeout(() => {
        
        createDigitalTwin(dtName)
      
        .then((r:RequestResponseState) => {
                dtId = r.extra.lastInsertedId

                createAssociatedSmartComponents(associatedSc,dtId)
                  .then((r:RequestResponseState) => {
                        idAssociatedSmartComponent= r.extra.lastInsertedId
                          res(r.msg)
                  }) 
                  .catch((e:RequestResponseState) => rej(e.msg))
                          res(r.msg)
                  }) 

        .catch((e:RequestResponseState) => rej(e.msg))

      })
    })
  }
  
  if(redirectTo !== "") 
    return <Redirect to={redirectTo} push={true} />
  
  return (
    <Navigator title="New Digital Twin">
      <>
      <DigitalTwinForm 
        dtName={{dtName, setDtName}}
        associatedSc = {{associatedSc, setAssociatedSc}}
        cancel={{action: redirectToList, label: 'Cancel'}}
        confirmDialog={{
          buttonTitle: 'Confirm',
          title: 'Creating Digital Twin',
          initialState: ConfirmActionStateLabel.executing,
          action: createDigitalTwinAction,
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