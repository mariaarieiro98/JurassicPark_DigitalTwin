import { useState, useCallback } from 'react'
import { TextField, Grid, Button } from '@material-ui/core'
import { SmartComponent } from '../../model'
import { useFunctionBlockStyles } from '../FunctionBlocks/FunctionBlock/style'
import { Done, Clear } from '@material-ui/icons'
import { ConfirmActionProps, ConfirmActionStateLabel, ConfirmActionAction, ConfirmAction } from '../templates/ConfirmAction/ConfirmAction'
import { SmartComponentActions } from '../../redux/actions'
import { useStore } from '../templates/Store/Store'
import { SmartComponentList } from './SmartComponent'

const updateOnRemoveSmartComponent = (smartComponents: SmartComponent[], smartComponentToRemove: SmartComponent ) : SmartComponent[] => {

  const newSmartComponents : SmartComponent[] = [...smartComponents]
  newSmartComponents.forEach((sc: SmartComponent) => {

      //sc.scName = sc.scName.filter((smartComponent: SmartComponent) => smartComponent.scName !== smartComponentToRemove.scName)

  })

  return newSmartComponents

}

interface DigitalTwinFormProps {

    dtName: {
        dtName: string
        setDtName: Function
    },
    associatedSc: {
        associatedSc: SmartComponent[]
        setAssociatedSc: Function
    }
    cancel: {
        label: string
        action: () => void
    },
    confirmDialog: {
        buttonTitle: string
        title: string
        initialState: ConfirmActionStateLabel
        action: ConfirmActionAction
        onSuccess : () => void
        start? : {
            label: string
            positiveLabel: string
            negativeLabel: string
        }
        success: {
            label:string
            positiveLabel: string
        }
        error: {
            label: string
            positiveLabel: string
        }
    },
    order?: number,
    newSc?: boolean,
}

export const DigitalTwinForm = (props: DigitalTwinFormProps) => {

    /**styles */
    const classes = useFunctionBlockStyles()

    /**Digital Twin*/
    const {dtName, setDtName} = props.dtName
    const [validDtName, setValidDtName] = useState(true)
    const onChangeDtName = useCallback((event:any) => {

        setDtName(event.target.value.trim())
        setValidDtName(true)
    
      },[setDtName])

    /* Buttons */

    const onCancel = props.cancel.action
    const cancelLabel = props.cancel.label

    const confirmLabel = props.confirmDialog.buttonTitle

    /* Confirmation */

    const [confirm, setConfirm] : [boolean, Function] = useState(false)

    const validateFields = () : boolean => {

        const cValidDtName = dtName.trim() !== ''
            
        if(!cValidDtName) setValidDtName(cValidDtName)
    
        return cValidDtName 
    
    }

    const confirmButtonAction = () => {

        if(validateFields())
          setConfirm(true)
    }

    const confirmActionStates = {
        start: {
            label: props.confirmDialog.start?.label,
            positiveLabel: props.confirmDialog.start?.positiveLabel,
            negativeLabel: props.confirmDialog.start?.negativeLabel,
            state: ConfirmActionStateLabel.start
        },
        executing: {
          label: '',
          state: ConfirmActionStateLabel.executing,
        },
        success: {
          label: props.confirmDialog.success.label,
          state: ConfirmActionStateLabel.success,
          positiveLabel: props.confirmDialog.success.positiveLabel
        },
        error: {
          label: props.confirmDialog.error.label,
          state: ConfirmActionStateLabel.error,
          positiveLabel: props.confirmDialog.success.positiveLabel
        },
      }
    
    const confirmActionProps : ConfirmActionProps = {

        title: props.confirmDialog.title,
        states: confirmActionStates,
        currentState: confirmActionStates.executing,
        onCancel: () => setConfirm(false),
        onError: () => setConfirm(false),
        onSuccess: props.confirmDialog.onSuccess,
        action:props.confirmDialog.action,
      
    }
  
    //Associar um SmartComponent pelo frontend
    
    const {data:smartComponents, dispatchAction:dispatchSmartComponentActions} = useStore('smartComponents')
    const updateSmartComponents = (scs: SmartComponent[]) => dispatchSmartComponentActions(SmartComponentActions.updateSmartComponent(scs))

    const {associatedSc, setAssociatedSc} = props.associatedSc

    const onSmartComponentRemoval = useCallback((smartComponentToRemove: SmartComponent) => {

      setAssociatedSc((prevSmartComponents: SmartComponent[]) =>  updateOnRemoveSmartComponent(prevSmartComponents,smartComponentToRemove))

  }, [setAssociatedSc])
  
  console.log("associatedSc:", associatedSc)

    return (
      <Grid className={classes.box} spacing={2} container direction="column" component="form">
        <> {confirm ? <ConfirmAction {...confirmActionProps} /> : null}
          <Grid spacing={1} justify="space-between" item xs container direction="row">
            <Grid item xs={6}>
              <TextField
                onChange={onChangeDtName} 
                value={dtName}
                helperText=""
                error={!validDtName} 
                fullWidth required 
                label="New Digital Twin Name" 
                id="dt-name" 
                type="text" />
            </Grid>
          </Grid>
          <Grid item container direction="row" justify="space-between" alignItems="center">
            {props.order ?
            <Grid item xs={1}>
                {props.order}
            </Grid>
            : null
            }
            <Grid className={classes.box} spacing={1} item container direction="row">
                <Grid item xs={6}>
                  <SmartComponentList onSmartComponentRemoval={onSmartComponentRemoval} setSmartComponents={setAssociatedSc}  title="Smart Component" smartComponents={associatedSc} />
                </Grid>
            </Grid>
          </Grid>
          <Grid item xs container direction="row" justify="space-between" alignItems="center"> 
            <Grid item xs={6} container direction="row" spacing={2} alignItems="center" justify="flex-end">
              <Grid item>
                  <Button onClick={onCancel} color="secondary" variant="contained"><Clear/>{cancelLabel}</Button>
              </Grid>
              <Grid>
                <Button onClick={confirmButtonAction} color="primary" variant="contained"><Done/>{confirmLabel}</Button>
              </Grid>
            </Grid>
          </Grid>
        </>
    </Grid>
  ) 
}