import { useState } from 'react'
import { Navigator } from '../templates/Navigator/Navigator'
import { DigitalTwin, AssociatedSmartComponent, SmartComponent } from '../../model/index'
import { Redirect } from 'react-router-dom'
import { routes } from '../../App'
import { ConfirmActionStateLabel } from '../templates/ConfirmAction/ConfirmAction'
import { RequestResponseState } from '../../services/api/api'
import { setTimeout } from 'timers'
import { DigitalTwinForm } from './DigitalTwinForm'
import { useMountEffect } from '../../utils/main'
import { useStore } from '../templates/Store/Store'
import { DigitalTwinActions } from '../../redux/actions'
import { getOrDownloadDigitalTwins } from '../../utils/digitalTwins'
import { createDigitalTwin } from '../../services/api/digital-twin'
import { createAssociatedSmartComponents } from '../../services/api/digital-twin'

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
  const [associatedSc,setAssociatedSc] : [SmartComponent[],Function] = useState([])
  const [choosenAssociatedSc, setChoosenAssociatedSc] : [AssociatedSmartComponent[] ,Function] = useState([])

  let dtId = 1
  let idAssociatedSmartComponent = 1

  const redirectToList = () => setRedirectTo(routes.digitalTwinMonitoring)

  const buildDigitalTwin = () : DigitalTwin => ({
    dtName, dtId,
    dtUserId,
  })

  const redirectToListAndUpdateLocal = () => {
    dispatchDigitalTwinActions(DigitalTwinActions.addDigitalTwin(buildDigitalTwin()))
    redirectToList()
  } 
  
  const buildAssociatedSmartComponent = (associatedSc : SmartComponent[], dtId: number, i: number) : AssociatedSmartComponent => ({
    scName: associatedSc[i].scName, scDtId: dtId,
    associatedScUserId: 1
  })
  
  const createDigitalTwinAction = () : Promise<string> => {
    
    return new Promise<string>((res:Function, rej:Function)  => {

      setTimeout(() => {

        if(associatedSc.length === 0){
          
          createDigitalTwin(dtName)
          .then((result: RequestResponseState) => {
            dtId = result.extra.lastInsertedId
            res('Digital Twin created')
          })

          .catch((e:RequestResponseState) => rej(e.msg))

        }

        else {

      
          createDigitalTwin(dtName)
          .then((result:RequestResponseState) => {
            dtId = result.extra.lastInsertedId
            res('Digital Twin created')
            let i = 0  
            while(associatedSc.length){         
            const choosenAssociatedSc : AssociatedSmartComponent = buildAssociatedSmartComponent(associatedSc,dtId,i)
            i++
            createAssociatedSmartComponents(choosenAssociatedSc)
            .then((r:RequestResponseState) => {
              idAssociatedSmartComponent= r.extra.lastInsertedId
            }) 
            .catch((e:RequestResponseState) => rej(e.msg))
            }
          })
          .catch((e:RequestResponseState) => rej(e.msg))
                    
        }
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