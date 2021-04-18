import React, { useState } from 'react'
import { Navigator } from '../templates/Navigator/Navigator'
import { ConfirmAction, ConfirmActionState, ConfirmActionStateLabel, ConfirmActionProps } from '../templates/ConfirmAction/ConfirmAction'
import { LazyComponent } from '../templates/LazyComponent/LazyComponent'
import { JPTable } from '../templates/Table/JPTable'
import { Functionality, DigitalTwin, SmartComponent, AssociatedSmartComponent} from '../../model'
import { useMountEffect } from '../../utils/main'
import { getOrDownloadDigitalTwins, getOrDownloadFunctionalities} from '../../utils/digitalTwins'
import { getOrDownloadSmartComponents } from '../../utils/smartComponents'
import { getOrDownloadAssociatedSmartComponents } from '../../utils/associatedSmartComponents'
import { useStore } from '../templates/Store/Store'
import { FunctionalityActions , DigitalTwinActions, SmartComponentActions, AssociatedSmartComponentActions} from '../../redux/actions'
import { RequestResponseState } from '../../services/api/api'
import { TextField, Grid, Button, Box, Dialog, DialogTitle, CircularProgress , Select, InputLabel, MenuItem, FormControl, Input, FormHelperText } from '@material-ui/core'
import { createFunctionality, updateFunctionality } from '../../services/api/digital-twin'
import { deleteFunctionality} from '../../services/api/digital-twin'
import { useDialogStyles } from '../FunctionBlockCategories/List/style'
import { CheckCircle, Error } from '@material-ui/icons'
import { useFunctionBlockStyles } from '../FunctionBlocks/FunctionBlock/style'
import { routes } from '../../App'
import { Redirect } from 'react-router-dom'

const NEW_FUNCTIONALITY_RE = /[a-zA-Z0-9]{3,}/

let functionalityId = -1
const funcUserId = 1

const EditFunctionalityDialog = (props: {func: Functionality, onGood: (newFunc: Functionality) => void, onError: () => void, onCancel: () => void}) => {

  const [newFuncName, setNewFuncName] : [string,Function] = useState(props.func.funcName)

  const classes = useDialogStyles()

  const [sending, setSending] : [boolean, Function] = useState(false)

  const [result, setResult] : [{done: boolean, good?: boolean, message?: string},Function] = useState({done:false})

  const action = () => {

      if(props.func.funcId) {

          if(!result.done) {

              setSending(true)
  
              updateFunctionality(props.func)

                  .then((response: RequestResponseState) => {
                      setResult({done:true, good: true, message: response.msg})
                  })

                  .catch((error: RequestResponseState) => {
                      setResult({done: true, good: false, message: error.msg})
                  })

                  .finally(() => setSending(false))

          }

          else {

              if(result.good)
                  props.onGood({...props.func, funcName: newFuncName})
              
              else
                  props.onError()

          }

      }

  }

  return (
      <Dialog open={true}>
          <DialogTitle>Edit Functionality</DialogTitle>
          <Box className={classes.box}>
              {
                  !result.done 
                      ?
                          <TextField 
                              disabled={sending}
                              value={newFuncName}
                              onChange={(event) => setNewFuncName(event.target.value)}
                          />
                      :    <Grid container justify="center">
                              <Grid item>
                                  {
                                      result.good 
                                          ?   <CheckCircle color="primary" />
                                          :   <Error color="error" />
                                  }
                              </Grid>
                              <Grid item>
                                  <Box className={result.good ? classes.good : classes.error} textAlign="center">{result.message}</Box>
                              </Grid>
                          </Grid> 
              }
          </Box>
          <Grid className={classes.buttons} container direction="row" justify="space-between">
              <Grid item>
                  {sending 
                      ? <CircularProgress color="primary" />
                      : <Button onClick={action}>Ok</Button>
                  }
              </Grid>
              <Grid item>
                  <Button disabled={sending} onClick={props.onCancel}>Cancel</Button>
              </Grid>
          </Grid>
      </Dialog>
  )

}

const AddFunctionalityDetails = (props: {func: Functionality, onGood: (newFunc: Functionality) => void, onError: () => void, onCancel: () => void}) => {

    const [newFuncName, setNewFuncName] : [string,Function] = useState(props.func.funcName)
  
    const classes = useDialogStyles()
  
    const [sending, setSending] : [boolean, Function] = useState(false)
  
    const [result, setResult] : [{done: boolean, good?: boolean, message?: string},Function] = useState({done:false})

    const [fetching,setFetching] = useState(true)
    const {data:smartComponents, dispatchAction:dispatchSmartComponentActions} = useStore('smartComponents')
    const updateSmartComponents = (scs: SmartComponent[]) => dispatchSmartComponentActions(SmartComponentActions.updateSmartComponent(scs))
    const [error,setError] = useState('')

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

    // Associar um smartComponent à funcionalidade
    const [smartComponentChoice, setSmartComponentChoice] = useState('')
    const [smartComponentIdChoice, setSmartComponentIdChoice] = useState(0)

    const handleSmartComponentChoice = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSmartComponentChoice(event.target.value as string);
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
  
        props.func.funcscId = smartComponentIdChoice;
        props.func.funcscName = smartComponentChoice;

        if(props.func.funcId) {
  
            if(!result.done) {
  
                setSending(true)
                console.log(props.func)
    
                updateFunctionality(props.func)
  
                    .then((response: RequestResponseState) => {
                        setResult({done:true, good: true, message: response.msg})
                    })
  
                    .catch((error: RequestResponseState) => {
                        setResult({done: true, good: false, message: error.msg})
                    })
  
                    .finally(() => setSending(false))
            }
  
            else {
  
                if(result.good)
                    props.onGood({...props.func, funcName: newFuncName})
                
                else
                    props.onError()
            }
        }
    }
  
    return (
        <Dialog open={true}>
            <DialogTitle>Add Functionality Details</DialogTitle>
            <Box className={classes.box}>
            <Grid item> 
                <Grid container item xs>
                    <Grid className={classes.box} spacing={3} item container direction="column" alignItems="flex-start">
                        <Grid item xs={12} sm={6}>
                            <InputLabel id={`digital-twin-label-${smartComponents}`}>DINASORE</InputLabel>
                            <Select labelId={`digital-twin-label-${smartComponents}`} value={smartComponentChoice} onChange={handleSmartComponentChoice}>
                            {(smartComponents || []).map((smartComponent: any) => {return <MenuItem key={smartComponent.scId} value={smartComponent.scName}>{smartComponent.scName}</MenuItem>})}
                            </Select> 
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label= "Function Block"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label= "Variable/Event"
                            />
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>
            <Grid className={classes.buttons} container direction="row" justify="space-between">
                <Grid item>
                    {sending 
                        ? <CircularProgress color="primary" />
                        : <Button onClick={action}>Ok</Button>
                    }
                </Grid>
                <Grid item>
                    <Button disabled={sending} onClick={props.onCancel}>Cancel</Button>
                </Grid>
            </Grid>
         </Box>
        </Dialog>
    )
  
}
  

export const DigitalTwinMonitoring = () => {
    
  const classes = useFunctionBlockStyles()

  const [fetching,setFetching] = useState(true)
  const [error,setError] = useState('')
  const [newFunc,setNewFunc] : [string,Function] = useState('')

  const [confirmEditing,setConfirmEditing] : [boolean, Function] = useState(false)
  const [confirmAddFunc,setConfirmAddFunc] : [boolean, Function] = useState(false)

  const [validNewFunc, setValidNewFunc] : [boolean,Function] = useState(true)

  const errorFetchingFunctionalityState : ConfirmActionState = {
    label: error,
    state: ConfirmActionStateLabel.error,
    positiveLabel: 'Ok'
  }

  const [redirectTo, setRedirectTo] : [string, Function] = useState("")

  const {data:functionalities, dispatchAction:dispatchFunctionalityActions} = useStore('functionalities')
  const {data:digitalTwins, dispatchAction:dispatchDigitalTwinActions} = useStore('digitalTwins')
  const {data:associatedSmartComponents, dispatchAction:dispatchAssociatedSmartComponentActions} = useStore('associatedSmartComponents')

  const onCancel = () => setError('')

  const updateFunctionalities = (funcs: Functionality[]) => dispatchFunctionalityActions(FunctionalityActions.updateFunctionalities(funcs))
  const updateDigitalTwins = (dts: DigitalTwin[]) => dispatchDigitalTwinActions(DigitalTwinActions.updateDigitalTwins(dts))
  const updateAssociatedSmartComponents = (assSc: AssociatedSmartComponent[]) => dispatchAssociatedSmartComponentActions(AssociatedSmartComponentActions.updateAssociatedSmartComponents(assSc))
  
  
  const addFunc = () => dispatchFunctionalityActions(FunctionalityActions.addFunctionality({funcId: functionalityId, funcUserId: 1 , funcName: newFunc, funcdtId: 1}))
 
  const [editingFunc, setEditingFunc] : [Functionality | null,Function] = useState(null)
  const [addDetailsFunc, setAddDetailsFunc] : [Functionality | null,Function] = useState(null)

  const indexes = [
    {label: 'Functionality', key: 'funcName'},
    {label: 'Digital Twin', key: 'dtName'},
    {label: 'State', key: 'dtDescription'},
    {label: 'Associated Smart Components', key: 'scName'},
    {label: 'Monitored Variables/Events', key: 'dtMonitoredVariableEvent'},
  ]

  // Recuperar da base de dados as funcionalidades (Functionality)
  useMountEffect(() => {

    setTimeout(() => {

    setFetching(true)
    getOrDownloadFunctionalities(functionalities)
        .then((result: Functionality[]) => updateFunctionalities(result))
        .catch((e:RequestResponseState) => setError(e.msg))
        .finally(() => setFetching(false))
    }, 0)
  })

  // Recuperar da base de dados os digital twins (DigitalTwin)
  useMountEffect(() => {

    setTimeout(() => {

    setFetching(true)
    getOrDownloadDigitalTwins(digitalTwins)
        .then((result: DigitalTwin[]) => updateDigitalTwins(result))
        .catch((e:RequestResponseState) => setError(e.msg))
        .finally(() => setFetching(false))
    }, 0)
  })

  // Recuperar da base de dados os smartComponents associados (AssociatedSmartComponent)
//   useMountEffect(() => {

//     setTimeout(() => {

//     setFetching(true)
//     getOrDownloadAssociatedSmartComponents(associatedSmartComponents)
//         .then((result: AssociatedSmartComponent[]) => updateAssociatedSmartComponents(result))
//         .catch((e:RequestResponseState) => setError(e.msg))
//         .finally(() => setFetching(false))
//     }, 0)
//   })
//   console.log(associatedSmartComponents)


  const isFunctionalityValid = (func:string) => NEW_FUNCTIONALITY_RE.test(func)

  const validateAndCreate = () => {

  const validFunc= isFunctionalityValid(newFunc)

    if(!validFunc)
      setValidNewFunc(false)
    else
      setConfirmAddFunc(true)

  }

  const buildFunctionality = () : Functionality => ({
    funcName: newFunc, funcId: functionalityId,
    funcdtId: digitalTwinIdChoice , funcUserId, funcdtName: digitalTwinChoice,
  })


  const addNewFunctionalityAction = () : Promise<string> => {

    const functionality : Functionality = buildFunctionality()

    return new Promise<string>((res:Function, rej:Function)  => {

        console.log(functionality)

        createFunctionality(functionality)

            .then((result: RequestResponseState) => {
            functionalityId = result.extra.lastInsertedId
                res('Functionality created')
            })

            .catch((e:RequestResponseState) => rej(e.msg))

    })
  }

  const confirmFunctionalityCreationActionStates = {
    start: {
      label: `Confirm creation of new functionality: ${newFunc} ?`,
      positiveLabel: 'Ok',
      negativeLabel: 'Cancel',
      state: ConfirmActionStateLabel.start
    },
    executing: {
      label: '',
      state: ConfirmActionStateLabel.executing,
    },
    success: {
      label: 'Functionality Created',
      state: ConfirmActionStateLabel.success,
      positiveLabel: 'Ok'
    },
    error: {
      label: 'Error Creating Functionality',
      state: ConfirmActionStateLabel.error,
      positiveLabel: 'Ok'
    },
  }

  const confirmActionProps : ConfirmActionProps = {

    title: 'Add Functionality',
    states: confirmFunctionalityCreationActionStates,
    currentState: confirmFunctionalityCreationActionStates.start,
    onCancel: () => setConfirmAddFunc(false),
    onError: () => setConfirmAddFunc(false),
    onSuccess: () => {
        addFunc()
        setNewFunc('')
    },
    action: addNewFunctionalityAction,
  }

  const getDataFunctionality = () => functionalities.map((functionality: Functionality) => {

    return {
          ...functionality,
    }
  })

  const deleteFunctionalityAction = (func: Functionality) : Promise<any> => {

    return new Promise(async(res:Function,rej:Function) => {

        if(!func.funcId) {
            rej('Error')
            return
        }

        try {
            const response : RequestResponseState = await deleteFunctionality(func.funcId)
            res(response)
          }

        catch(err) {
            rej(err)
        }
    })
  }

  //Adicionar Detalhes à Funcionalidade
  const cancelAddDetails = () => setAddDetailsFunc(null);
  const showAddDetails = (func: Functionality) => setAddDetailsFunc(func)
  
  //Editar a Funcionalidade
  const cancelEditing = () => setEditingFunc(null)
  const showEditing = (func: Functionality) => setEditingFunc(func)

  const onGoodEditing = (editingFunctionality: Functionality) => {
      
    const newFunctionalities = functionalities.map((func: Functionality) => {

    if(func.funcId === editingFunctionality.funcId)
        return {...func, funcName: editingFunctionality.funcName, funcdtId: editingFunctionality.funcdtId}
    return func

    })
  
    cancelEditing()
    dispatchFunctionalityActions(FunctionalityActions.updateFunctionalities(newFunctionalities))
  }

  // Associar um digital twin à nova funcionalidade criada
  const [digitalTwinChoice, setDigitalTwinChoice] = useState('')
  const [digitalTwinIdChoice, setDigitalTwinIdChoice] = useState(0)

  const handleDigitalTwinChoice = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDigitalTwinChoice(event.target.value as string);
    let i = 0;
    while(i < digitalTwins.length)
    {
        if(digitalTwins[i].dtName === (event.target.value as string))
        {
            setDigitalTwinIdChoice(digitalTwins[i].dtId)
        }
        i++;
    }
   
  };

  const redirectToList = () => setRedirectTo(routes.functionalityDetails)
  
  if(redirectTo !== "") 
  return <Redirect to={redirectTo} push={true} />

  return (
    <Navigator title="New Digital Twin Functionality">
     <> 
        {error !== ''
                ? <ConfirmAction title='Fetching Functionalities' currentState={errorFetchingFunctionalityState} states={{error: errorFetchingFunctionalityState}} onCancel={onCancel}/>
                : null 
        }
         <LazyComponent loaded={!fetching}>
             <>
                {confirmEditing
                     ? <ConfirmAction {...confirmActionProps} /> 
                     : editingFunc
                         ?  <EditFunctionalityDialog
                             onGood={onGoodEditing}
                             func={editingFunc}
                             onError={cancelEditing}
                             onCancel={cancelEditing} />
                         : null
                 }
                {confirmAddFunc 
                     ? <ConfirmAction {...confirmActionProps} /> 
                     : addDetailsFunc
                         ?  <AddFunctionalityDetails
                             onGood={onGoodEditing}
                             func={addDetailsFunc}
                             onError={cancelAddDetails}
                             onCancel={cancelAddDetails} />
                         : null
                 }
                 <Grid container direction="column" spacing={2}>
                      <Grid item>
                        <JPTable
                            sortedkey="funcName"
                            data={getDataFunctionality()} 
                            updateData={updateFunctionalities} 
                            indexes={indexes} 
                            tName='Functionality'
                            extra={{
                                delete: {
                                    action: deleteFunctionalityAction,
                                    labelKey: 'funcName',
                                    onSuccessDelete: () => {}
                                },
                                edit: {
                                    action: showEditing
                                },
                                details: {
                                    action: redirectToList
                                },
                                add: {
                                    action: showAddDetails
                                }
                            }} 
                        />
                      </Grid>
                    <Grid item xs>
                        New Functionality
                    </Grid>
                     <Grid item> 
                        <Grid container item xs>
                            <Grid className={classes.box} spacing={1} item container direction="row">
                            <Grid item xs={4}>
                                <TextField
                                    helperText={!validNewFunc ? NEW_FUNCTIONALITY_RE.toString() : ''}
                                    error={!validNewFunc}
                                    label="Insert new functionality name" 
                                    required
                                    onChange={(event) => {
                                        setNewFunc(event.target.value)
                                        if(!validNewFunc)
                                            setValidNewFunc(isFunctionalityValid(event.target.value.trim()))
                                    }}
                                    fullWidth
                                    value={newFunc}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <InputLabel id={`digital-twin-label-${newFunc}`}>Digital Twin</InputLabel>
                                <Select labelId={`digital-twin-label-${newFunc}`} value={digitalTwinChoice} onChange={handleDigitalTwinChoice}>
                                {(digitalTwins || []).map((digitalTwin: any) => {return <MenuItem key={digitalTwin.dtId} value={digitalTwin.dtName}>{digitalTwin.dtName}</MenuItem>})}
                                </Select>
                            </Grid>
                            <Grid container justify="flex-end" spacing={1}>
                             <Grid item>
                                 <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={validateAndCreate}
                                 >
                                    Add Functionality
                                 </Button>
                             </Grid>
                         </Grid>
                        </Grid>
                        </Grid>
                     </Grid>
                 </Grid>
             </>
         </LazyComponent>
     </>
 </Navigator>
 )
}
