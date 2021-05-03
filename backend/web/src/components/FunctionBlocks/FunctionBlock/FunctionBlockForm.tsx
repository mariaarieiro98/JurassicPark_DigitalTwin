import React, { useState, useCallback, useEffect } from 'react'
import { FormControl, InputLabel, TextField, Grid, Select, MenuItem, Box, Button,Typography, Chip } from '@material-ui/core'
import { FBGeneralCategory, Variable, InOutType, Event, EventVariable, FunctionBlock, FBCategory, ExternalDependency } from '../../../model'
import { useFunctionBlockStyles } from './style'
import { VariableList } from './Variable'
import { setSimpleField, useMountEffect } from '../../../utils/main'
import { EventList } from './Event'
import { Done, Clear } from '@material-ui/icons'
import { ReactComponent as UploadIcon } from '../../../icons/Upload.svg'
import { getFBfromFbtFile, getOrDownloadFunctionBlockCategories } from '../../../utils/functionBlock'
import { ConfirmActionProps, ConfirmActionStateLabel, ConfirmActionAction, ConfirmAction } from '../../templates/ConfirmAction/ConfirmAction'
import { useStore } from '../../templates/Store/Store'
import { FunctionBlockCategoriesActions } from '../../../redux/actions'
import { SmartComponentList } from '../../DigitalTwin/SmartComponent'

const DEFAULT_VALUES = {
    eventType: 'Event'
}

const updateEventVariablesOnRemoveVariable = (events:Event[], variableToRemove:Variable, ) : Event[] => {

    const newEvents : Event[] = [...events]
    newEvents.forEach((event: Event) => {

        event.eventVariables = event.eventVariables.filter((ev: EventVariable) => ev.evVariableName !== variableToRemove.variableName)

    })

    return newEvents

}

const updateEventVariablesOnUpdateVariable = (events:Event[], oldVariable:Variable,variableEdited:Variable) : Event[] => {

    const newEvents : Event[] = [...events]
    newEvents.forEach((event: Event) => {

      event.eventVariables = event.eventVariables.map((ev: EventVariable) => {
        if(ev.evVariableName === oldVariable.variableName)
          return {
            evVariableName: variableEdited.variableName,
            evEventName: event.eventName
          }
        else
          return ev
      }) 

    })

    return newEvents

}

interface FunctionBlockFormProps {

    fbType: {
        fbType: string
        setFbType: Function
    },
    fbGeneralCategory: {
        fbGeneralCategory: '' | FBGeneralCategory
        setfbGeneralCategory: Function
    },
    fbCategory: {
      fbCategory: FBCategory
      setFbCategory: Function
    }
    fbDescription: {
        fbDescription: string
        setFbDescription: Function
    },
    fbInputVariables: {
        fbInputVariables: Variable[]
        setFbInputVariables: Function
    }
    fbOutputVariables: {
        fbOutputVariables: Variable[]
        setFbOutputVariables: Function
    },
    fbInputEvents: {
        fbInputEvents: Event[]
        setFbInputEvents: Function
    }
    fbOutputEvents: {
        fbOutputEvents: Event[]
        setFbOutputEvents: Function
    },
    fbExternalDependencies: {
      fbExternalDependencies: ExternalDependency[]
      setFbExternalDependencies: Function
    }
    fbImplFile: {
        fbImplFile: File
        setFbImplFile: Function
    },
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
    byPassFields?: {
      fbImplFile: boolean
    }
}

export const FunctionBlockForm = (props: FunctionBlockFormProps) => {

    /**styles */
    const classes = useFunctionBlockStyles()

    /**list of categories */
    const {data: functionBlockCategories, dispatchAction:dispatchFunctionBlockCategoriesActions} = useStore('functionBlockCategories')

    const [validCategory,setValidCategory] : [boolean, Function] = useState(true)

    /**Fb type */
    const {fbType, setFbType} = props.fbType
    const [validType, setValidType] = useState(true)
    const onChangeFBType = useCallback((event:any) => {

        setFbType(event.target.value.trim())
        setValidType(true)
    
      },[setFbType])

    /**FB General Category */
    const {fbGeneralCategory, setfbGeneralCategory} = props.fbGeneralCategory
    const [validGeneralCategory, setValidGeneralCategory] = useState(true)
    const [generalCategoryNames,setGeneralCategoryNames] : [string[],Function] = useState([...Object.values(FBGeneralCategory), ''])
    
    /**Db Description */
    const {fbCategory,setFbCategory} = props.fbCategory

    /**Db Description */
    const {fbDescription,setFbDescription} = props.fbDescription
    const [validDescription, setValidDescription] = useState(true)

    /* Variables and Events */
    const {fbInputVariables, setFbInputVariables} = props.fbInputVariables
    const {fbOutputVariables, setFbOutputVariables} = props.fbOutputVariables
    
    const getEmptyEvent = (type:InOutType) : Event => ({
        eventId: -1,
        eventOpcua: "",
        eventInoutType: type,
        eventName: '',
        eventType:DEFAULT_VALUES.eventType,
        eventVariables: [] 
    })

    const [newInputEvent,setNewInputEvent] : [Event,Function] = useState(getEmptyEvent(InOutType.in))
    const [newOutputEvent,setNewOutputEvent] : [Event,Function] = useState(getEmptyEvent(InOutType.out))

    const {fbInputEvents, setFbInputEvents} = props.fbInputEvents
    const {fbOutputEvents, setFbOutputEvents} = props.fbOutputEvents

    /** Variable Update and Edition */
    
    const onInputVariableRemoval = useCallback((variableToRemove: Variable) => {

        setFbInputEvents((prevEvents: Event[]) => updateEventVariablesOnRemoveVariable(prevEvents,variableToRemove))
        setNewInputEvent((prevEvent:Event) => updateEventVariablesOnRemoveVariable([prevEvent],variableToRemove)[0])

    }, [setFbInputEvents])

    const onOutputVariableRemoval = useCallback((variableToRemove: Variable) => {

        setFbOutputEvents((prevEvents: Event[]) => updateEventVariablesOnRemoveVariable(prevEvents,variableToRemove))
        setNewOutputEvent((prevEvent: Event) => updateEventVariablesOnRemoveVariable([prevEvent],variableToRemove)[0])
    
    }, [setFbOutputEvents])


    const onInputVariableEdition = useCallback((oldVariable:Variable, newVariable: Variable) => {

        setFbInputEvents((prevEvents: Event[]) => updateEventVariablesOnUpdateVariable(prevEvents,oldVariable,newVariable))
        setNewInputEvent((prevNewEvent: Event) => updateEventVariablesOnUpdateVariable([prevNewEvent],oldVariable,newVariable)[0])
    
    },[setFbInputEvents])
    
      const onOutputVariableEdition = useCallback((oldVariable:Variable, newVariable: Variable) => {
    
        setFbOutputEvents((prevEvents: Event[]) => updateEventVariablesOnUpdateVariable(prevEvents,oldVariable,newVariable))
        setNewOutputEvent((pevEvent: Event) => updateEventVariablesOnUpdateVariable([pevEvent],oldVariable,newVariable)[0])
    
    },[setFbOutputEvents])


    /* Event edition */

    const addNewInputEvent = useCallback(() => {

        setFbInputEvents((prevEvents: Event[]) => [...prevEvents, newInputEvent])
        setNewInputEvent(getEmptyEvent(InOutType.in))
    
    },[newInputEvent, setFbInputEvents])
    
    const addNewOutputEvent = useCallback(() => {

        setFbOutputEvents((prevEvents: Event[]) => [...prevEvents, newOutputEvent])
        setNewOutputEvent(getEmptyEvent(InOutType.out))

    },[newOutputEvent, setFbOutputEvents])
    
    const removeInputEvent = useCallback((eventToRemove: Event) => setFbInputEvents((prevEvents:Event[]) => prevEvents.filter((event:Event) => event !== eventToRemove)), [setFbInputEvents]) 
    const removeOutputEvent = useCallback((eventToRemove: Event) => setFbOutputEvents((prevEvents:Event[]) => prevEvents.filter((event:Event) => event !== eventToRemove)), [setFbOutputEvents]) 
    
    const setEvent = (type:InOutType) => (event:Event,index:number) => {
    
        const setFunction = type === InOutType.in ? setFbInputEvents : setFbOutputEvents
    
        setFunction((prevEvents:Event[]) => {
    
          const newEvents : Event[] = [...prevEvents]
          newEvents[index] = event
          return newEvents
        
        })
    
    }

    const setInputEvent = useCallback(setEvent(InOutType.in),[])
    const setOutputEvent = useCallback(setEvent(InOutType.out),[])

    /* Dependencies */

    const {fbExternalDependencies, setFbExternalDependencies} = props.fbExternalDependencies
    const [currentDependency, setCurrentDependency] : [string,Function] = useState('')

    const addDependency = useCallback(() => {

      setFbExternalDependencies((prevDependencies: ExternalDependency[]) => {

        const name = currentDependency.trim()
        setCurrentDependency('')
        if(name === '' || prevDependencies.filter((ed: ExternalDependency) => ed.edName === name).length)
          return prevDependencies
        return [...prevDependencies, {edName: currentDependency}]
      })

    }, [setFbExternalDependencies, currentDependency])

    const deleteDependency = useCallback((ed: ExternalDependency) => () => {

      setFbExternalDependencies((prevDependencies: ExternalDependency[]) => prevDependencies.filter((cEd:ExternalDependency) => cEd.edName !== ed.edName))

    }, [setFbExternalDependencies])

    const onChangeCurrentDependency = useCallback((event: any) => setCurrentDependency(event.target.value), [])

    /* Implementation File */

    const {fbImplFile, setFbImplFile} = props.fbImplFile
    const [validFile, setValidFile] = useState(true)

    const changeImplFile = (event:any) => {

        if(event.target.files.length > 0) {
          setFbImplFile(event.target.files[0])
          setValidFile(true)
        }
    
    }

    /* FBT file reading */

    const [errorReadingFBT,setErrorReadingFBT] : [{msg:string, err: boolean, file:boolean},Function] = useState({msg:'', err: false, file:false})
    
    const loadFiles = useCallback((fileList: FileList) => {

        if(fileList.length > 0) {
    
          let fbt: File | undefined = undefined
          let py : File | undefined = undefined
    
          for(let i = 0; i < fileList.length; i++) {
    
            let file = fileList[i]
    
            if(/.*.(fbt|xml)$/.test(file.name)) 
              fbt = file
            else if (/.*.py$/.test(file.name))
              py = file
             
            if(fbt && py)
              break
          }

          if(!fbt && !py) {
            setErrorReadingFBT({file:true, err:true, msg:'Only .fbt and .xml files for fb definition or .py files for fb implementation'})
            return
          }
    
          else {
    
            if(fbt) {
    
              getFBfromFbtFile(fbt)
                .then((result: FunctionBlock) => {
        
                  setFbType(result.fbType)
                  setFbDescription(result.fbType)
                  setfbGeneralCategory(result.fbGeneralCategory)
                  setFbInputVariables(result.fbInputVariables)
                  setFbOutputVariables(result.fbOutputVariables)
                  setFbInputEvents(result.fbInputEvents)
                  setFbOutputEvents(result.fbOutputEvents)
        
                  setValidType(true)
                  setValidDescription(true)
                  setValidGeneralCategory(!!result.fbGeneralCategory)
                  setErrorReadingFBT({err:false,msg:'',file:true})
        
                })
                .catch((error) => {
                  console.error(error)
                  setErrorReadingFBT({file:true,err: true, msg:error.toString()})
        
                })
            }
    
            if(py) {
              setFbImplFile(py)
              setValidFile(true)
    
            }
    
          }
        }
    
    }, [setFbDescription,setFbImplFile,setFbInputEvents,setFbInputVariables,setFbOutputEvents,setFbOutputVariables,setFbType,setfbGeneralCategory])

    const onChangeFBTFile = useCallback((event:any) => loadFiles(event.target.files),[loadFiles])

    /* Dropping Files */
    const addPreventWindowToOpenFile = () => {
        window.addEventListener('dragover', preventDefaultAction)
        window.addEventListener('drop',preventDefaultAction)
    }
    
    const removePreventWindowToOpenFile = () => {
        window.removeEventListener('dragover', preventDefaultAction)
        window.removeEventListener('drop',preventDefaultAction)
    } 
     
    const preventDefaultAction = (event:any) => event.preventDefault()
    const changeGeneralCategory = useCallback((category: FBGeneralCategory | "") => {

      const valid = category !== ''

      if(valid)  
        setGeneralCategoryNames(Object.values(FBGeneralCategory))
      
      setfbGeneralCategory(category)
      setValidGeneralCategory(true)

    },[setfbGeneralCategory])
      
    useMountEffect(() => {
      
      addPreventWindowToOpenFile()
      getOrDownloadFunctionBlockCategories(functionBlockCategories)
        .then((result: FBCategory[]) => {
          dispatchFunctionBlockCategoriesActions(FunctionBlockCategoriesActions.updateFunctionBlockCategories(result))
        })
        .catch((err) => console.error(err))

    },removePreventWindowToOpenFile)
    useEffect(() => changeGeneralCategory(fbGeneralCategory),[changeGeneralCategory,fbGeneralCategory])

    const onDropFiles = useCallback((event:any) => loadFiles(event.dataTransfer.files),[loadFiles])

    /* Buttons */

    const onCancel = props.cancel.action
    const cancelLabel = props.cancel.label

    const confirmLabel = props.confirmDialog.buttonTitle

    /* Confirmation */

    const [confirm, setConfirm] : [boolean, Function] = useState(false)

    const validateFields = () : boolean => {

        const cValidType = fbType.trim() !== ''
        const cValidDescription = fbDescription.trim() !== ''
        const cValidGeneralCategory = !!fbGeneralCategory
        const cValidCategory = fbCategory.fbcId !== -1
        const cValidFile = !!props.byPassFields?.fbImplFile || fbImplFile.name !== ''  
            
        if(!cValidType) setValidType(cValidType)
        if(!cValidDescription) setValidDescription(cValidDescription)
        if(!cValidGeneralCategory) setValidGeneralCategory(cValidGeneralCategory)
        if(!cValidCategory) setValidCategory(cValidCategory)
        if(!cValidFile) setValidFile(cValidFile)
    
        return cValidType && cValidGeneralCategory && cValidCategory && cValidDescription && cValidFile
    
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

    return (
        <> {confirm ? <ConfirmAction {...confirmActionProps} /> : null}
          <Grid onDrop={onDropFiles} spacing={2} container direction="column" component="form">
            <Grid item container alignItems="center" justify={errorReadingFBT.file ? 'space-between' : 'flex-end'} direction="row">
              {errorReadingFBT.file ?
              <Grid item>
                {errorReadingFBT.err ? <Typography color="error">{errorReadingFBT.msg}</Typography> : <Done fontSize="small" />}
              </Grid>
              : null}
              <Grid item>
                <input onChange={onChangeFBTFile} value="" accept=".xml,.fbt" type="file" id="raised-button-file" hidden />
                  <label htmlFor="raised-button-file">
                    <Button variant="outlined" component="span" size="small">
                      Choose fbt file for form auto completion
                    </Button>
                  </label> 
              </Grid>
            </Grid>
            <Grid spacing={1} justify="space-between" item xs container direction="row">
              <Grid item xs={6}>
                <TextField
                  onChange={onChangeFBType} 
                  value={fbType}
                  helperText=""
                  error={!validType} 
                  fullWidth required 
                  label="Type" 
                  id="fb-type" 
                  type="text" />
              </Grid>
              <Grid item xs>
                <FormControl fullWidth required>
                  <InputLabel error={!validCategory} id="category-label">Category</InputLabel>
                  <>
                    <Select
                      error={!validCategory}
                      labelId="category-label"
                      value={fbCategory.fbcName}
                      onChange={(event) => {
                        setValidCategory(true)
                        setFbCategory(functionBlockCategories.filter((cat:FBCategory) => event.target.value === cat.fbcName)[0])
                      }} 
                    >
                      {functionBlockCategories.map((cat:FBCategory, index:number) => <MenuItem key={index} value={cat.fbcName}>{cat.fbcName}</MenuItem>)}
                    </Select>
                   
                  </>
                </FormControl>
              </Grid>
              <Grid item xs>
                <FormControl fullWidth required>
                  <InputLabel error={!validGeneralCategory} id="gen-category-label">General Category</InputLabel>
                  <Select
                    error={!validGeneralCategory} 
                    labelId="gen-category-label"
                    value={fbGeneralCategory || ''}
                    onChange={(event:any) => {
                      setValidGeneralCategory(true)
                      changeGeneralCategory(event.target.value)
                    }}
                  >
                    {generalCategoryNames.map((cat:any, index:number) => <MenuItem key={index} value={cat}>{cat}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid item xs>
              <TextField 
                helperText="" 
                variant="standard" 
                fullWidth 
                required 
                multiline 
                rowsMax="4" 
                label="Description" 
                id="description" 
                type="text"
                error={!validDescription} 
                onChange={setSimpleField(setFbDescription, () => setValidDescription(true))} 
                value={fbDescription}/>
            </Grid>
            <Grid item xs>
              Variables
            </Grid>
            <Grid container item xs>
              <Grid className={classes.box} spacing={1} item container direction="row">
                <Grid item xs={6}>
                  <VariableList onVariableEdition={onInputVariableEdition} onVariableRemoval={onInputVariableRemoval} setVariables={setFbInputVariables} inOutType={InOutType.in} title="Input" variables={fbInputVariables} />
                </Grid>
                <Grid item xs={6}>
                  <VariableList onVariableEdition={onOutputVariableEdition} onVariableRemoval={onOutputVariableRemoval} setVariables={setFbOutputVariables} inOutType={InOutType.out} title="Output" variables={fbOutputVariables} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs>
              Events
            </Grid>
            <Grid container item xs>
              <Grid className={classes.box} spacing={1} item container direction="row">
                <Grid item xs={6}>
                  <EventList setEvent={setInputEvent} removeEvent={removeInputEvent} addNewEvent={addNewInputEvent} setEvents={setFbInputEvents} newEvent={newInputEvent} setNewEvent={setNewInputEvent} variables={fbInputVariables} inOutType={InOutType.in} title="Input" events={fbInputEvents} />
                </Grid>
                <Grid item xs={6}>
                  <EventList setEvent={setOutputEvent} removeEvent={removeOutputEvent} addNewEvent={addNewOutputEvent} setEvents={setFbOutputEvents} newEvent={newOutputEvent} setNewEvent={setNewOutputEvent} variables={fbOutputVariables} inOutType={InOutType.out} title="Output" events={fbOutputEvents} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs>
              Dependencies
            </Grid>
            <Grid container xs item>
              <Grid item container className={classes.box} alignItems="center" justify="space-between">
                <Grid item container direction="row" spacing={1} alignItems="flex-end">
                  <Grid item xs={6}>
                    <TextField
                        onChange={onChangeCurrentDependency} 
                        value={currentDependency}
                        helperText=""
                        fullWidth 
                        label="New Dependency" 
                        id="fb-new-dependency" 
                        type="text" />
                  </Grid>
                  <Grid item>
                    <Button onClick={addDependency} className={classes.varEvButton} size="small" variant="contained">+</Button>
                  </Grid>
                </Grid>
                <Grid container className={`${classes.box} ${classes.dependenciesBox}`} item>
                  {fbExternalDependencies.length ?
                    fbExternalDependencies.map((ed: ExternalDependency, index: number) => (
                      <Chip key={index} className={classes.dependency} label={ed.edName} onDelete={deleteDependency(ed)} />
                    )) : 'No Dependencies'
                  }
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs container direction="row" justify="space-between" alignItems="center"> 
              <Grid item xs={6}>
                  <input onChange={changeImplFile} value="" required accept=".py" type="file" id="button-file" hidden />
                  <label htmlFor="button-file">
                    <TextField
                      className={classes.tfFile}
                      label="Implementation File"
                      required={!props.byPassFields?.fbImplFile}
                      error={!validFile}
                      disabled={true}
                      value={fbImplFile.name} 
                      InputProps={{
                        startAdornment: (
                          <Box pb={1} mr={1}>
                            <Button variant="outlined" component="span">
                              <UploadIcon className={classes.icon} />
                            </Button>
                          </Box> 
                        )
                      }} />
                  </label>
              </Grid>
              <Grid item xs={6} container direction="row" spacing={2} alignItems="center" justify="flex-end">
                <Grid item>
                    <Button onClick={onCancel} color="secondary" variant="contained"><Clear/>{cancelLabel}</Button>
                </Grid>
                <Grid>
                  <Button onClick={confirmButtonAction} color="primary" variant="contained"><Done/>{confirmLabel}</Button>
                </Grid>
              </Grid>
            </Grid>
            
          </Grid>
        </>
      )
}