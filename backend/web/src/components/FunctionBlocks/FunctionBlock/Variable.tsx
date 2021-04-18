import React, { useEffect, useState, useCallback } from 'react'
import { useFunctionBlockStyles } from "./style"
import { Variable, DataType, InOutType } from "../../../model/index"
import { Grid, TextField, FormControl, InputLabel, Select, Button, MenuItem } from "@material-ui/core"

interface VariableProps {
  setVariables: Function
  variables: Variable[]
  title: string
  inOutType: InOutType
  onVariableRemoval: (variable: Variable) => void
  onVariableEdition: (oldVariable: Variable, newVariable: Variable) => void
}

export const VariableList = React.memo((props: VariableProps) => {
  
  const {variables,setVariables,onVariableRemoval,onVariableEdition} = props

  const classes = useFunctionBlockStyles()

  const newVar : Variable = {
    variableId: -1,
    variableDataType: DataType.dtString,
    variableOpcua: "",
    variableInoutType: props.inOutType,
    variableName: "",
  }

  const [newVariable,setNewVariable] : [Variable,Function] = useState(newVar)

  const setVariable = useCallback((variable:Variable,index:number) => {

    setVariables((prevVars: Variable[]) => {

      const oldVariable : Variable = prevVars[index]
      const newVariables : Variable[] = [...prevVars]
      newVariables[index] = variable
      onVariableEdition(oldVariable,variable)
      return newVariables

    }) 

  },[onVariableEdition, setVariables])

  const addVariable = useCallback((varToAdd: Variable) => {
    
    setVariables((prevVariables: Variable[]) =>[...prevVariables, varToAdd])
    setNewVariable(newVar)

  }, [setVariables,newVar]) 

  const removeVariable = useCallback((variableToRemove:Variable) => {
    setVariables((prevVars: Variable[]) => prevVars.filter((variable:Variable,index:number) => variable !== variableToRemove))
    onVariableRemoval(variableToRemove)
  },[onVariableRemoval,setVariables]) 

  return (
    <Grid container direction="column">
      <Grid item>{props.title}</Grid>
      <Grid item className={classes.box}>
        {variables.map((variable:Variable, index:number) => <VariableRow key={index} index={index} addRemoveVariable={removeVariable} setVariable={setVariable} variable={variable} newVar={false} />)}
        <VariableRow index={-1} addRemoveVariable={addVariable} setVariable={setNewVariable} variable={newVariable} newVar={true}  />
      </Grid> 
    </Grid>
  )
})

interface VariableRowProps {
  index: number 
  addRemoveVariable: (variable: Variable) => void
  setVariable:Function
  variable: Variable
  newVar: boolean
  order?: number
}
  
const VariableRow = React.memo((props: VariableRowProps) => {

  const classes = useFunctionBlockStyles()

  const [validName,setValidName] = useState("")

  const action = () => {

    if(!isValid() && props.newVar) 
      setValidName("Mandatory")
    
    else
      props.addRemoveVariable(props.variable)
    
  }

  const isValid = useCallback(() => props.variable.variableName !== '', [props.variable])

  const validate = useCallback(() => {
    
    !isValid() ? setValidName("Mandatory") : setValidName('')

  },[isValid]) 

  useEffect(() => {if(!props.newVar) validate()}, [props.variable.variableName, props.newVar, validate])

  const updateField = (field:string) => (event:any) => {

    setValidName('')
    props.setVariable({...props.variable, [field]: event.target.value},props.index)
  
  }

  return (
    <Grid item container direction="row" justify="space-between" alignItems="center">
      { props.order ?
      <Grid item xs={1}>
          {props.order}
      </Grid>
      : null
      }
      <Grid item xs={4}>
        <TextField 
          value={props.variable.variableName} 
          onChange={updateField('variableName')}
          helperText={validName} fullWidth 
          required
          error={validName !== ''} 
          label="Name" 
          type="text" />
      </Grid>
      <Grid item xs={2}>
        <TextField 
          value={props.variable.variableOpcua || ''}
          onChange={updateField('variableOpcua')} 
          helperText="" 
          fullWidth 
          label="OPCUA" 
          type="text" />
      </Grid>
      <Grid item xs={3}>
        <FormControl fullWidth required>
          <InputLabel id={`data-type-label-${props.variable.variableName}`}>Data Type</InputLabel>
          <Select
            labelId={`data-type-label-${props.variable.variableName}`}
            value={props.variable.variableDataType}
            onChange={updateField('variableDataType')}
          >
            {Object.values(DataType).map((dt:any, index:number) => <MenuItem key={index} value={dt}>{dt}</MenuItem>)}

          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={1}>
        <Button 
          className={classes.varEvButton} 
          size="small" 
          variant="contained"
          onClick={action}
        >
        {props.newVar ? '+' : 'x' }</Button>
      </Grid>
    </Grid>
  )
}
 ,(prevProps:VariableRowProps, nextProps: VariableRowProps) => prevProps.variable === nextProps.variable
)