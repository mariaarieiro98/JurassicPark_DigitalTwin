import React, { useState } from 'react'
import { Navigator } from '../../templates/Navigator/Navigator'
import { deleteFunctionBlock } from '../../../services/api/function-block'
import { FunctionBlock } from '../../../model/index'
import { useMountEffect } from '../../../utils/main'
import { JPTable } from '../../templates/Table/JPTable'
import { LazyComponent } from '../../templates/LazyComponent/LazyComponent'
import { ConfirmAction, ConfirmActionState, ConfirmActionStateLabel } from '../../templates/ConfirmAction/ConfirmAction'
import { RequestResponseState } from '../../../services/api/api'
import { setTimeout } from 'timers'
import { FunctionBlockActions } from '../../../redux/actions'
import { Redirect } from 'react-router-dom'
import { useStore } from '../../templates/Store/Store'
import { getOrDownloadFunctionBlocks } from '../../../utils/functionBlock'

export const FunctionBlockList = () => {
  
  const {data:functionBlocks,dispatchAction:dispatchFunctionBlocksActions} = useStore('functionBlocks')

  const [fetching,setFetching] = useState(true)
  const [error,setError] = useState('')

  const [redirectToEdit,setRedirectToEdit] : [number, Function] = useState(-1)

  const updateFunctionBlocks = (fbs: FunctionBlock[]) => dispatchFunctionBlocksActions(FunctionBlockActions.updateFunctionBlocks(fbs))
  
  useMountEffect(() => {

    setTimeout(() => {

      setFetching(true)
      getOrDownloadFunctionBlocks(functionBlocks)
          .then((result: FunctionBlock[]) => {
              updateFunctionBlocks(result)
          })
          .catch((e:RequestResponseState) => setError(e.msg))
          .finally(() => setFetching(false))

        
    }, 0)

  })

  const errorState : ConfirmActionState = {
    label: error,
    state: ConfirmActionStateLabel.error,
    positiveLabel: 'Ok'
  }

  const indexes = [
    {label: 'Type', key: 'fbType'},
    {label: 'Description', key: 'fbDescription'},
    {label: 'Category', key: 'fbCategoryName'},
    {label: 'General Category', key: 'fbGeneralCategory'},
    // {label: 'Responsible User', key: 'fbUserId'},
  ]

  const onCancel = () => setError('')

  const deleteLocalFunctionBlock = (fb:FunctionBlock) => dispatchFunctionBlocksActions(FunctionBlockActions.deleteFunctionBlock(fb))

  const deleteFunctionBlockAction = (fb:FunctionBlock) : Promise<any> => {

    return new Promise(async (res:Function, rej: Function) => {

      setTimeout(async () => {

          if(!fb.fbId) {
            rej('Error')
            return
          }

          try {
            const response : RequestResponseState = await deleteFunctionBlock(fb.fbId)
            res(response)
          }

          catch(err) {
            rej(err)
          }
      }, 0)

    })

  } 

  const editFunctionBlockAction = (fb:FunctionBlock) => {

    setRedirectToEdit(fb.fbId)

  }

  if(redirectToEdit !== -1)
    return <Redirect to={`/function-block/${redirectToEdit}`} push={true}/>


  return (
    <Navigator title="Function Blocks">
      <> 
        {error !== ''
        ? <ConfirmAction title='Fetching Function Blocks' currentState={errorState} states={{error: errorState}} onCancel={onCancel}/>
        : null 
        }
        <LazyComponent loaded={!fetching}>
          <JPTable
            data={functionBlocks} 
            updateData={updateFunctionBlocks} 
            indexes={indexes}
            sortedkey='fbType' 
            tName='Function Block'
            extra={{
              delete: {
                action: deleteFunctionBlockAction,
                labelKey: 'fbType',
                onSuccessDelete: deleteLocalFunctionBlock
              },
              edit: {
                action: editFunctionBlockAction
              }
            }} 
            />
        </LazyComponent>
      </>
    </Navigator>
  )

}