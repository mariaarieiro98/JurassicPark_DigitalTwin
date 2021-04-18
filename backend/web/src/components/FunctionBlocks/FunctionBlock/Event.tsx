import React, { useState, useEffect, useCallback } from 'react'
import { useFunctionBlockStyles } from "./style"
import { Event, InOutType, Variable, EventVariable } from "../../../model"
import { Grid, TextField, Button } from "@material-ui/core"
import { SearchableList } from '../../templates/Search/SearchableList'

interface EventProps {
  variables: Variable[]
  events: Event[]
  setEvents: Function
  title: string
  inOutType: InOutType
  newEvent: Event
  setNewEvent: Function
  addNewEvent: (event:Event) => void
  removeEvent: (event:Event) => void
  setEvent: (event:Event, index:number) => void
}

export const EventList = React.memo((props: EventProps) => {

  const classes = useFunctionBlockStyles()

  const getNonUsedVariables = useCallback((event: Event) : EventVariable[] => {

    return props.variables.filter((variable: Variable) => 
      event.eventVariables
        .find((element:EventVariable) => element.evVariableName === variable.variableName) === undefined)
        .map((variable:Variable) => ({
          evEventName:event.eventName,
          evVariableName:variable.variableName
        }))

  },[props.variables])

  const updateVars = useCallback((event:Event, eventVariables:EventVariable[]) => {

    event.eventVariables = [...eventVariables]

  },[])

  return (
    <Grid container direction="column">
      <Grid item>{props.title}</Grid>
      <Grid item className={classes.box}>
        {props.events.map((event:Event, index:number) => <EventRow updateVars={updateVars} key={index} index={index} addRemoveEvent={props.removeEvent} nonUsedVariables={getNonUsedVariables} setEvent={props.setEvent} event={event} newEvent={false} />)}
        <EventRow addRemoveEvent={props.addNewEvent} setEvent={props.setNewEvent} updateVars={updateVars} nonUsedVariables={getNonUsedVariables} event={props.newEvent} newEvent={true} />
      </Grid> 
    </Grid>
  )
}
//,
// (prevProps: EventProps, nextProps:EventProps) => prevProps.events === nextProps.events && prevProps.variables === nextProps.variables && prevProps.newEvent === nextProps.newEvent
)

const eventMandatoryFields = ['eventName','eventType']

interface EventRowProps {
  index?: number
  addRemoveEvent: (event:Event) => void
  setEvent:Function
  updateVars:Function 
  nonUsedVariables:(event:Event) => EventVariable[] 
  event: Event
  newEvent: boolean
}

const EventRow = React.memo((props: EventRowProps) => {
  
  const classes = useFunctionBlockStyles()

  const [valid, setValid] = useState({eventName:{error: false, msg: ''},eventType:{error:false,msg: ''}})

  const updateVars = (evs:EventVariable[]) => {

    const updatedEvent = {...props.event, eventVariables: evs}
    props.setEvent(updatedEvent,props.index)

  }

  const validateField = useCallback((field:keyof Event) => {

    const inValid = props.event[field] === ''

    if(eventMandatoryFields.includes(field)) {
      if(inValid)
        setValid((prevValid:any) => ({...prevValid, [field]: {msg: 'Mandatory', error: true}}))
    }
      
    return !inValid

  },[props.event])

  const validate = useCallback(() =>  {
    
    const validName = validateField('eventName')
    const validType = validateField('eventType')
    
    return validName && validType
  
  },[validateField])

  useEffect(() => {

    if(!props.newEvent) 
      validate()
  
  }, [props.newEvent, props.event.eventName,props.event.eventType,validate])

  const action = () => {

    if(validate())
      props.addRemoveEvent(props.event)

  }

  const updateField = (field: keyof Event) => (event:any) => {

    setValid((prevVal) => ({...prevVal, [field]:{msg:'',error:false}}))
    props.setEvent({...props.event, [field]: event.target.value},props.index)
    
  }

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item container direction="row" justify="space-between" alignItems="center">
        <Grid item xs={4}>
          <TextField value={props.event.eventName} onChange={updateField('eventName')} error={valid.eventName.error} helperText={valid.eventName.msg} fullWidth required label="Name" type="text" />
        </Grid>
        <Grid item xs={2}>
          <TextField value={props.event.eventOpcua || ''} onChange={updateField('eventOpcua')} helperText="" fullWidth label="OPCUA" type="text" />
        </Grid>
        <Grid item xs={3}>
          <TextField value={props.event.eventType} onChange={updateField('eventType')} error={valid.eventType.error} helperText={valid.eventType.msg} fullWidth required label="Type" type="text" />
        </Grid>
        <Grid item xs={1}>
          <Button onClick={action} className={classes.varEvButton} size="small" variant="contained">{props.newEvent ? '+' : 'x' }</Button>
        </Grid>
      </Grid>
      <Grid item container direction="row" alignItems="center" spacing={1}>
        <Grid item>
          Variables
        </Grid>
        <Grid item>
          <SearchableList inList={props.event.eventVariables} setInList={updateVars} outList={props.nonUsedVariables(props.event)} showKey="evVariableName" newLabel="New Variable"/>
        </Grid>
      </Grid>
    </Grid>
  )
})