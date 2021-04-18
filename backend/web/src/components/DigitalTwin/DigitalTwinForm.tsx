import React, { useState, useCallback, useEffect } from 'react'
import { TextField, Grid, Button, InputLabel, Select, MenuItem, FormControl } from '@material-ui/core'
import { AssociatedSmartComponent, SmartComponent } from '../../model'
import { useFunctionBlockStyles } from '../FunctionBlocks/FunctionBlock/style'
import { Done, Clear } from '@material-ui/icons'
import { ConfirmActionProps, ConfirmActionStateLabel, ConfirmActionAction, ConfirmAction } from '../templates/ConfirmAction/ConfirmAction'
import { AssociatedSmartComponentActions, SmartComponentActions } from '../../redux/actions'
import { useStore } from '../templates/Store/Store'
import { getOrDownloadSmartComponents } from '../../utils/smartComponents'
import { useMountEffect } from '../../utils/main'
import { RequestResponseState } from '../../services/api/api'
import { SmartComponentList } from './SmartComponent'

interface DigitalTwinFormProps {

    dtName: {
        dtName: string
        setDtName: Function
    },
    associatedSc: {
        associatedSc: string
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
    // addRemoveAssociatedSmartComponent: (associatedSc: AssociatedSmartComponent) => void,
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

    // Recuperar diretamente da comunicação OPC-UA os smart_components disponíveis (SmartComponent)
    useMountEffect(() => {

      setTimeout(() => {
  
      setFetching(true)
      getOrDownloadSmartComponents(smartComponents)
          .then((result: SmartComponent[]) => updateSmartComponents(result))
          .catch((e:RequestResponseState) => setError(e.msg))
          .finally(() => setFetching(false))
      }, 0)
      })
  
    // Associar um SmartComponent pelo frontend
      
    const [fetching,setFetching] = useState(true)
    const {data:smartComponents, dispatchAction:dispatchSmartComponentActions} = useStore('smartComponents')
    const updateSmartComponents = (scs: SmartComponent[]) => dispatchSmartComponentActions(SmartComponentActions.updateSmartComponent(scs))
    const [error,setError] = useState('')

    const [smartComponentChoice, setSmartComponentChoice] = useState('')
    const [smartComponentIdChoice, setSmartComponentIdChoice] = useState(0)
  
    const handleSmartComponentChoice = (event: React.ChangeEvent<{ value: unknown }>) => {
      setSmartComponentChoice(event.target.value as string);
      props.associatedSc.setAssociatedSc(event.target.value as string)
      let i = 0;
      while(i < smartComponents.length)
      {
          if( smartComponents[i].scName === (event.target.value as string))
          {
              setSmartComponentIdChoice(smartComponents[i].scId)
          }
          i++;
      }
    };

    const action = () => {

      // else
      //props.addRemoveAssociatedSmartComponent(props.associatedSc)
      
    }

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
                label="Insert New Digital Twin Name" 
                id="dt-name" 
                type="text" />
            </Grid>
          </Grid>
          <Grid container item xs>
              <Grid className={classes.box} spacing={1} item container direction="row">
                <Grid item xs={6}>
                  <SmartComponentList onVariableEdition={onInputVariableEdition} onVariableRemoval={onInputVariableRemoval} setVariables={setFbInputVariables} inOutType={InOutType.in} title="Input" variables={fbInputVariables} />
                </Grid>
                <Grid item xs={6}>
                  <SmartComponentList onVariableEdition={onOutputVariableEdition} onVariableRemoval={onOutputVariableRemoval} setVariables={setFbOutputVariables} inOutType={InOutType.out} title="Output" variables={fbOutputVariables} />
                </Grid>
              </Grid>
          </Grid>
          {/* <Grid item container direction="row" justify="space-between" alignItems="center">
            {props.order ?
            <Grid item xs={1}>
                {props.order}
            </Grid>
            : null
            }
            <Grid item xs={3}>
              <FormControl fullWidth required>
                <InputLabel id={`digital-twin-label-${smartComponents}`}>SmartComponent</InputLabel>
                <Select
                  labelId={`digital-twin-label-${smartComponents}`}
                  value={smartComponentChoice}
                  onChange={handleSmartComponentChoice}
                >
                   {(smartComponents || []).map((smartComponent: any) => {return <MenuItem key={smartComponent.scId} value={smartComponent.scName}>{smartComponent.scName}</MenuItem>})}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={1}>
              <Button 
                className={classes.varEvButton} 
                size="small" 
                variant="contained"
                // onClick={action}
              >
              {props.newSc ? '+' : 'x' }</Button>
            </Grid>
          </Grid> */}
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