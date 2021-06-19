import React, { useEffect, useState, useCallback } from 'react'
import { useFunctionBlockStyles } from "../FunctionBlocks/FunctionBlock/style"
import { SmartComponent } from "../../model/index"
import { Grid, FormControl, InputLabel, Select, Button, MenuItem } from "@material-ui/core"
import { useMountEffect } from '../../utils/main'
import { getOrDownloadSmartComponents } from '../../utils/smartComponents'
import { RequestResponseState } from '../../services/api/api'
import { useStore } from '../templates/Store/Store'
import { SmartComponentActions } from '../../redux/actions'

interface SmartComponentProps {
  setSmartComponents: Function
  smartComponents: SmartComponent[]
  title: string
  onSmartComponentRemoval: (smartComponent: SmartComponent) => void
}

export const SmartComponentList = React.memo((props: SmartComponentProps) => {
  
  const {smartComponents,setSmartComponents,onSmartComponentRemoval} = props

  const classes = useFunctionBlockStyles()

  const newSc : SmartComponent = {
    scId: -1,
    scName: "",
    scAddress: "",
    scPort: -1,
  }

  const [newSmartComponent,setNewSmartComponent] : [SmartComponent,Function] = useState(newSc)

  const setSmartComponent = useCallback((smartComponent: SmartComponent , index:number) => {

    setSmartComponents((prevScs: SmartComponent[]) => {
      console.log("entrei aqui")
      const oldSmartComponent : SmartComponent = prevScs[index]
      const newSmartComponents : SmartComponent[] = [...prevScs]
      newSmartComponents[index] = smartComponent
      return newSmartComponents

    }) 

  },[setSmartComponents])

  const addSmartComponent = useCallback((scToAdd: SmartComponent) => {
    console.log("entrei aqui 1")

    setSmartComponents((prevSmartComponents: SmartComponent[]) =>[...prevSmartComponents, scToAdd])
    setNewSmartComponent(newSc)

  }, [setSmartComponents,newSc]) 

  const removeSmartComponent = useCallback((smartComponentToRemove:SmartComponent) => {
    console.log("entrei aqui 2")
    setSmartComponents((prevSmartComponents: SmartComponent[]) => prevSmartComponents.filter((smartComponent:SmartComponent,index:number) => smartComponent !== smartComponentToRemove))
    console.log(smartComponentToRemove)
    onSmartComponentRemoval(smartComponentToRemove)
  },[onSmartComponentRemoval,setSmartComponents]) 
  
  console.log("newSc", newSmartComponent)
  console.log("smartComponents:", smartComponents)
 
  return (
    <Grid container direction="column">
      <Grid item>{props.title}</Grid>
      <Grid item className={classes.box}>
        {smartComponents.map((smartComponent:SmartComponent, index:number) => <SmartComponentRow key={index} index={index} addRemoveSmartComponent={removeSmartComponent} setSmartComponent={setSmartComponent} smartComponent={smartComponent} newSc={false} />)}
        <SmartComponentRow index={-1} addRemoveSmartComponent={addSmartComponent} setSmartComponent={setNewSmartComponent} smartComponent={newSmartComponent} newSc={true}  />
      </Grid> 
    </Grid>
  )
})

interface SmartComponentRowProps {
  index: number 
  addRemoveSmartComponent: (smartComponent: SmartComponent) => void
  setSmartComponent:Function
  smartComponent: SmartComponent
  newSc: boolean
  order?: number
}

const SmartComponentRow = React.memo((props: SmartComponentRowProps) => {

  const classes = useFunctionBlockStyles()

  const [validName,setValidName] = useState("")

  const [fetching,setFetching] = useState(true)
  const {data:smartComponents, dispatchAction:dispatchSmartComponentActions} = useStore('smartComponents')
  const updateSmartComponents = (scs: SmartComponent[]) => dispatchSmartComponentActions(SmartComponentActions.updateSmartComponent(scs))
  const [error,setError] = useState('')

  const isValid = useCallback(() => props.smartComponent.scName !== '', [props.smartComponent])

  const action = () => {

    if(!isValid() && props.newSc) 
      setValidName("Mandatory")
    
    else
      props.addRemoveSmartComponent(props.smartComponent)
    
  }
  
  //Verifica se o nome é válido
  const validate = useCallback(() => {
    
    !isValid() ? setValidName("Mandatory") : setValidName('')

  },[isValid]) 

  useEffect(() => {if(!props.newSc) validate()}, [props.smartComponent.scName, props.newSc, validate])

  const updateField = (fieldScId:string, fieldScName:string, fieldScAddress:string, fieldScPort:string) => (event:any) => {
  
    props.setSmartComponent({...props.smartComponent, [fieldScId]: event.target.value, [fieldScName]: event.target.value.scName, [fieldScAddress]: event.target.value.scAddress, [fieldScPort]: event.target.value.scPort}, props.index)
  
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

  return (
    <Grid item xs={12} container direction="row" justify="space-between" alignItems="center">
      { props.order ?
      <Grid item xs={12}>
          {props.order}
      </Grid>
      : null
      }
      <Grid item xs={6}>
        <FormControl fullWidth required>
          <InputLabel id={`smart-component-label-${props.smartComponent.scName}`}></InputLabel>
            <Select
              labelId={`smart-component-label-${props.smartComponent.scName}`}
              value={props.smartComponent.scId}
              onChange={updateField('scId', 'scName','scAddress','scPort')}
            >
              {(smartComponents || []).map((smartComponent: any) => {return <MenuItem key={smartComponent} value={smartComponent}>{`${smartComponent.scAddress}, ${smartComponent.scName}, ${smartComponent.scPort}`}</MenuItem>})}
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
        {props.newSc ? '+' : 'x' }</Button>
      </Grid>
    </Grid>
  )
  }
 ,(prevProps:SmartComponentRowProps, nextProps: SmartComponentRowProps) => prevProps.smartComponent === nextProps.smartComponent
)
