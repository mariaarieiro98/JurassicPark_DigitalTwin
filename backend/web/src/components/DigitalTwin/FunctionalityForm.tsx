import React, { useState, useCallback, useEffect } from 'react'
import { FormControl, InputLabel, TextField, Grid, Select, MenuItem, Box, Button,Typography, Chip } from '@material-ui/core'
import { DigitalTwin , Functionality} from '../../model'
import { useFunctionBlockStyles } from '../FunctionBlocks/FunctionBlock/style'
import { VariableList } from '../FunctionBlocks/FunctionBlock/Variable'
import { setSimpleField, useMountEffect } from '../../utils/main'
import { Done, Clear, BackspaceOutlined } from '@material-ui/icons'
import { ReactComponent as UploadIcon } from '../../../icons/Upload.svg'
import { getFBfromFbtFile, getOrDownloadFunctionBlockCategories } from '../../utils/functionBlock'
import { ConfirmActionProps, ConfirmActionStateLabel, ConfirmActionAction, ConfirmAction } from '../templates/ConfirmAction/ConfirmAction'
import { useStore } from '../templates/Store/Store'

interface FunctionalityFormProps {

    // funcName: {
    //   funcName: string
    //   setFuncName: Function
    // },
    // digitalTwin: {
    //   digitalTwin: DigitalTwin
    //   setDigitalTwin: Function
    // }
    cancel: {
        label: string
        action: () => void
    },
    // confirmDialog: {
    //     buttonTitle: string
    //     title: string
    //     initialState: ConfirmActionStateLabel
    //     onSuccess : () => void
    //     start? : {
    //         label: string
    //         positiveLabel: string
    //         negativeLabel: string
    //     }
    //     success: {
    //         label:string
    //         positiveLabel: string
    //     }
    //     error: {
    //         label: string
    //         positiveLabel: string
    //     }
    // },
}

export const FunctionalityForm = (props: FunctionalityFormProps) => {

    /**styles */
    const classes = useFunctionBlockStyles()

    /**list of digital-twins */
    const {data: digitalTwins, dispatchAction:dispatchDigitalTwinsActions} = useStore('digitalTwins')
    const [validDt,setValidDt] : [boolean, Function] = useState(true)

    /**Functionality Name */
    // const {funcName, setFuncName} = props.funcName
    // const [validFuncName, setValidFuncName] = useState(true)
    // const onChangeFuncName = useCallback((event:any) => {

    //   setFuncName(event.target.value.trim())
    //   setValidFuncName(true)
    
    // },[setFuncName])

    /*Digital Twin*/
    // const {digitalTwin,setDigitalTwin} = props.digitalTwin


    /* Buttons */

    const onCancel = props.cancel.action
    const cancelLabel = props.cancel.label

    // const confirmLabel = props.confirmDialog.buttonTitle

    /* Confirmation */

    // const [confirm, setConfirm] : [boolean, Function] = useState(false)

    // const validateFields = () : boolean => {

    //     const cValidFuncName = funcName.trim() !== ''
    //     const cValidDigitalTwin = digitalTwin.dtId !== -1
            
    //     if(!cValidFuncName) setValidFuncName(cValidFuncName)
    //     if(!cValidDigitalTwin ) setValidDt(cValidDigitalTwin)
    
    //     return cValidFuncName && cValidDigitalTwin
    // }

    // const confirmButtonAction = () => {

    //     if(validateFields())
    //       setConfirm(true)
    // }

    // const confirmActionStates = {
    //     start: {
    //         label: props.confirmDialog.start?.label,
    //         positiveLabel: props.confirmDialog.start?.positiveLabel,
    //         negativeLabel: props.confirmDialog.start?.negativeLabel,
    //         state: ConfirmActionStateLabel.start
    //     },
    //     executing: {
    //       label: '',
    //       state: ConfirmActionStateLabel.executing,
    //     },
    //     success: {
    //       label: props.confirmDialog.success.label,
    //       state: ConfirmActionStateLabel.success,
    //       positiveLabel: props.confirmDialog.success.positiveLabel
    //     },
    //     error: {
    //       label: props.confirmDialog.error.label,
    //       state: ConfirmActionStateLabel.error,
    //       positiveLabel: props.confirmDialog.success.positiveLabel
    //     },
    //   }
    
    // const confirmActionProps : ConfirmActionProps = {

    //     title: props.confirmDialog.title,
    //     states: confirmActionStates,
    //     currentState: confirmActionStates.executing,
    //     onCancel: () => setConfirm(false),
    //     onError: () => setConfirm(false),
    //     onSuccess: props.confirmDialog.onSuccess,
    // }

    return (
        //  <>  {confirm ? <ConfirmAction {...confirmActionProps} /> : null}
            // <Grid spacing={1} justify="space-between" item xs container direction="row">
            //   <Grid item xs={6}>
            //     <TextField
            //       onChange={onChangeFuncName} 
            //       value={funcName}
            //       helperText=""
            //       error={!validFuncName} 
            //       fullWidth required 
            //       label="Type" 
            //       id="fb-type" 
            //       type="text" />
            //   </Grid>
            // </Grid>
            // <Grid item xs>
            //     <FormControl fullWidth required>
            //       <InputLabel error={!validDt} id="digital-twin-label">DigitalTwin</InputLabel>
            //       <>
            //         <Select
            //           error={!validDt}
            //           labelId="digital-twin-label"
            //           value={digitalTwin.dtName}
            //           onChange={(event) => {
            //             setValidDt(true)
            //             setDigitalTwin(digitalTwins.filter((dts:DigitalTwin) => event.target.value === dts.dtName)[0])
            //           }} 
            //         >
            //           {digitalTwins.map((dts:DigitalTwin, index:number) => <MenuItem key={index} value={dts.dtName}>{dts.dtName}</MenuItem>)}
            //         </Select>
                   
            //       </>
            //     </FormControl>
            //   </Grid>
            <Grid item xs container direction="row" justify="space-between" alignItems="center"> 
              <Grid item xs={6} container direction="row" spacing={2} alignItems="center" justify="flex-end">
                <Grid item>
                <Button onClick={onCancel} style={{minWidth:0}} variant="text" size="medium"><BackspaceOutlined fontSize="large"/></Button>
                    {/* <Button onClick={onCancel} color="secondary" variant="contained"><Clear/>{cancelLabel}</Button> */}
                </Grid>
                {/* <Grid>
                  <Button onClick={confirmButtonAction} color="primary" variant="contained"><Done/>{confirmLabel}</Button>
                </Grid> */}
              </Grid>
            </Grid>
      )
}