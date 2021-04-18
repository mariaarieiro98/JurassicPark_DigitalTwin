import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, Button, Grid, DialogTitle, CircularProgress, Typography } from '@material-ui/core'
import { useDialogStyles } from './style'
import { Error, CheckCircle } from '@material-ui/icons'

export enum ConfirmActionStateLabel {start, executing,success, error}

export type ConfirmActionAction = () => Promise<string>

export interface ConfirmActionState {

    label?: string
    state: ConfirmActionStateLabel
    positiveLabel?: string
    negativeLabel?: string
    
}

export interface ConfirmActionProps {

    title:string
    states: {
        start? : ConfirmActionState
        executing?: ConfirmActionState
        success?: ConfirmActionState
        error?: ConfirmActionState
    }
    currentState: ConfirmActionState
    onCancel: () => void
    onError?: () => void
    onSuccess?: () => void
    action?: ConfirmActionAction

}

export const ConfirmAction = React.memo((props: ConfirmActionProps) => {

    const [state, setState] : [ConfirmActionState, Function] = useState({...props.currentState})

    const stateCode = state.state

    const classes = useDialogStyles()

    const {action,onCancel,onSuccess,onError,states} = props

    const updateState = useCallback((success: boolean = true, msg?: string) => {

        switch(stateCode) {

            case ConfirmActionStateLabel.start:
                setState({...states.executing})
                break
            case ConfirmActionStateLabel.executing:

                if(!success) {
                    if(!!states.error) {                        
                        setState({...states.error, label: msg})
                    }
                    else
                        onCancel()
                }

                else {

                    if(!!states.success) {                        
                        setState({...states.success, label: msg})
                    }
                    else
                        onCancel()

                }

                break
            case ConfirmActionStateLabel.success:
                if(onSuccess) {
                    onSuccess()
                } 
                onCancel()
                break
            case ConfirmActionStateLabel.error:
                if(onError) onError()
                onCancel()
                break

        }

    }, [stateCode,onCancel,onSuccess,onError,states])

    const execute = useCallback(() => {

        if(!action)
            return

        action()

            .then(result => updateState(true,result))

            .catch(error => updateState(false,error))
    
    }, [action, updateState])

    useEffect(() => {
        
        if(stateCode === ConfirmActionStateLabel.executing) {
            execute()
        }

    })

    const updateStateButtonAction = useCallback(() => updateState(),[updateState])

    return (

        <Dialog open={true}>
            <DialogTitle>{props.title}</DialogTitle>
            <Grid className={classes.box} container direction="column" justify="center" alignItems="center">
                {state.state === ConfirmActionStateLabel.executing 
                    ?
                        <Grid item>
                            <CircularProgress color="primary" /> 
                        </Grid>
                    :   null
                }
                {state.state !== ConfirmActionStateLabel.executing 
                    ? 
                        <Grid item container direction="row" justify="center">
                            {state.state === ConfirmActionStateLabel.error 
                                ? 
                                    <Grid item> 
                                        <Error color="error" />
                                    </Grid>

                                : state.state === ConfirmActionStateLabel.success 
                                    ? 
                                        <Grid item> 
                                            <CheckCircle color="primary" />
                                        </Grid> 
                                    :
                                        null
                                }
                                <Grid item>
                                    <Typography color="primary">
                                        {state.label}
                                    </Typography>
                                </Grid>
                        </Grid>
                    : null
                }
            </Grid>
            <Grid className={classes.buttons} container direction="row" justify="space-between">
                {state.positiveLabel
                    ?
                    <Grid item>
                        <Button onClick={updateStateButtonAction}>{state.positiveLabel}</Button>
                    </Grid>
                    : null
                }
                {state.negativeLabel  
                    ?
                    <Grid item>
                        <Button onClick={props.onCancel}>{state.negativeLabel}</Button>
                    </Grid>
                    : null
                }
                
            </Grid>
        </Dialog>

    )

})