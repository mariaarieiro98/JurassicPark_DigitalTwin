import { Card, CardContent, CardHeader, Divider, Grid } from '@material-ui/core'
import React, { useState } from 'react'
import { match, Redirect, useRouteMatch } from 'react-router-dom'
import { routes } from '../../App'
import { Functionality, MonitoredEvent, MonitoredVariable, MonitoredVariableInstance } from '../../model'
import { FunctionalityActions, MonitoredEventActions, MonitoredVariableActions } from '../../redux/actions'
import { RequestResponseState } from '../../services/api/api'
import { getOrDownloadFunctionalities, getOrDownloadMonitoredEvents, getOrDownloadMonitoredVariables } from '../../utils/digitalTwins'
import { useMountEffect } from '../../utils/main'
import { Navigator } from '../templates/Navigator/Navigator'
import { useStore } from '../templates/Store/Store'
import { JPTable } from '../templates/Table/JPTable'
import { FunctionalityForm } from './FunctionalityForm'
import { SocketConnection, SOCKET_EVENT } from '../../services/socket/socket'
import { useSmartComponentStyles } from '../SmartComponents/style'
import { deleteMonitoredEvent, deleteMonitoredVariable } from '../../services/api/digital-twin'

let flagDezSegundos = true
let flagFirstTime = true

//Esta página pretende dispor informação mais detalhada da funcionalidade correspondente disponível na página "DigitalTwinMonitoring"

let selectedMonitoredVariableGlobal : MonitoredVariable[] = []

interface MonitoredVariableWithCurrentValue extends MonitoredVariableInstance {
    currentValueData: {
        key: string | undefined
        data: number
    }
}

function startCountdown(seconds: number) {
          
    let counter = seconds;

    const interval = setInterval(() => {
      counter--;
        
      if (counter < 0 ) {
        clearInterval(interval);
        flagDezSegundos = true
        startCountdown(10)
      }
    }, 1000);
}

export const FunctionalityDetails = () => {
    
    //Recupera o id da funcionalidade seleccionada anteriormente na página Digital Twin Monitoring
    const matchParams : match = useRouteMatch()
    const id = (matchParams.params as any).id

    // Recuperar da base de dados as variáveis que estão a ser monitorizadas (MonitoredVariable)
    const [fetching,setFetching] = useState(true)
    const [error,setError] = useState('')
    const {data: monitoredVariables, dispatchAction: dispatchMonitoredVariableActions} = useStore('monitoredVariables')
    const updateMonitoredVariables = (monVar: MonitoredVariable[]) => dispatchMonitoredVariableActions(MonitoredVariableActions.updateMonitoredVariable(monVar))

    const [selectedMonitoredVariable, setSelectedMonitoredVariable] : [MonitoredVariable[], Function] = useState([])

    const initializeMonitoredVariable = (monVars: MonitoredVariable[]) => {
        
        let monitoredVariable : MonitoredVariable[] = monVars.filter((monVar) => monVar.funcIdAssociated === parseInt(id))
        
        selectedMonitoredVariableGlobal = monitoredVariable;

        setSelectedMonitoredVariable(monitoredVariable)

    }

    useMountEffect(() => {
        setFetching(true)
        getOrDownloadMonitoredVariables(monitoredVariables)
            .then((result: MonitoredVariable[]) => {
                updateMonitoredVariables(result)
                initializeMonitoredVariable(result)
            })
            .catch((e:RequestResponseState) => {
                setError(e.msg)
            })
            .finally(() => setFetching(false))
    })

    // Recuperar da base de dados os eventos que estão a ser monitorizados (MonitoredEvent)
    const {data: monitoredEvents, dispatchAction: dispatchMonitoredEventActions} = useStore('monitoredEvents')
    const updateMonitoredEvents = (monEv: MonitoredEvent[]) => dispatchMonitoredEventActions(MonitoredEventActions.updateMonitoredEvent(monEv))

    const [selectedMonitoredEvent, setSelectedMonitoredEvent] : [MonitoredEvent[], Function] = useState([])
    
    const initializeMonitoredEvent = (monEvs: MonitoredEvent[]) => {
            
        let monitoredEvent : MonitoredEvent[] = monEvs.filter((monEv) => monEv.funcIdAssociated === parseInt(id))
            
        setSelectedMonitoredEvent(monitoredEvent)
    
    }
    
    useMountEffect(() => {
    
        setFetching(true)
        getOrDownloadMonitoredEvents(monitoredEvents)
            .then((result: MonitoredEvent[]) => {
                updateMonitoredEvents(result)
                initializeMonitoredEvent(result)
            })
            .catch((e:RequestResponseState) => {
                setError(e.msg)
            })
            .finally(() => setFetching(false))
    
    })
    
    // Cabeçalhos da tabela Variable + Funções Necessárias
    const indexes_variable = [
        {label: 'Variable', key: 'monitoredVariableName'},
        {label: 'Function Block', key: 'id'},
        {label: 'Smart Component', key: 'sc'},
        {label: 'Current Value', key: 'currentValueData'},
    ]

    // Cabeçalhos da tabela Event + Funções Necessárias
    const indexes_event = [
        {label: 'Event', key: 'monitoredEventName'},
        {label: 'Function Block', key: 'fbAssociated'},
        {label: 'Smart Component', key: 'scAssociated'},
    ]

    const getDataMonitoredEvent = () =>  selectedMonitoredEvent.map((monitoredEvent: MonitoredEvent) => {    
        
        return {
            ...monitoredEvent
        }

    })

    const deleteMonitoredVariableAction = (monVar: MonitoredVariableInstance) : Promise<any> => {
        
        return new Promise(async(res:Function,rej:Function) => {
            
            let i = 0
            let idMonitoredVariable: number | undefined = 0

            while(i < selectedMonitoredVariableGlobal.length) {
                if((selectedMonitoredVariableGlobal[i].monitoredVariableName === monVar.monitoredVariableName) && (selectedMonitoredVariableGlobal[i].scAssociated === monVar.sc) && (selectedMonitoredVariableGlobal[i].fbAssociated === monVar.id)){
                    idMonitoredVariable = selectedMonitoredVariableGlobal[i].idMonitoredVariable
                }
                i++
            }
    
            console.log("idMonitoredVariable:",idMonitoredVariable)

            if(!idMonitoredVariable) {
                console.log("entrei aqui")
                rej('Error')
                return
            }
            
            try {
                console.log("idMonitoredVariable:",idMonitoredVariable)
                const response : RequestResponseState = await deleteMonitoredVariable(idMonitoredVariable)
                res(response)
              }
    
            catch(err) {
                rej(err)
            }
        })
    }

    const deleteMonitoredEventAction = (monEv: MonitoredEvent) : Promise<any> => {
        
        return new Promise(async(res:Function,rej:Function) => {
            console.log(monEv.idMonitoredEvent)

            if(!monEv.idMonitoredEvent) {
                console.log("entrei aqui")
                rej('Error')
                return
            }
            
            try {
                console.log("idMonitoredEvent:", monEv.idMonitoredEvent)
                const response : RequestResponseState = await deleteMonitoredEvent(monEv.idMonitoredEvent)
                res(response)
              }
    
            catch(err) {
                rej(err)
            }
        })
    }

    // Variáveis e funções que permitem o redireccionamento para a página DigitalTwinMonitoring
    const [redirectTo, setRedirectTo] : [string, Function] = useState("")

    const redirectToList = () => setRedirectTo(routes.digitalTwinMonitoring)

    // Recuperar da base de dados as funcionalidades (Functionality)
    const {data:functionalities, dispatchAction:dispatchFunctionalityActions} = useStore('functionalities')
    const updateFunctionalities = (funcs: Functionality[]) => dispatchFunctionalityActions(FunctionalityActions.updateFunctionalities(funcs))

    useMountEffect(() => {
    setTimeout(() => {

    setFetching(true)
    getOrDownloadFunctionalities(functionalities)
        .then((result: Functionality[]) => updateFunctionalities(result))
        .catch((e:RequestResponseState) => setError(e.msg))
        .finally(() => setFetching(false))
    }, 0)
    })

    // Recuperar dados da funcionalidade
    let [functionalityName, setFunctionalityName] : [Functionality[], Function] = useState([])

    let i = 0;
    while(i < functionalities.length){

        if(functionalities[i].funcId == id) {
          functionalityName = functionalities[i].funcName
        }
        i++
    }

    // Estabelecer a ligação com os sockets
    const socket : SocketConnection = new SocketConnection(SocketConnection.getSmartComponentsNamespace())
    
    const [monitoredVariableInstances,setMonitoredVariableInstances] : [MonitoredVariableWithCurrentValue[],Function] = useState([])

    const classes = useSmartComponentStyles()

    const updateMonitoredVariableInstances = (monVars:MonitoredVariableInstance[]) => setMonitoredVariableInstances(getMonitoredVariablesWithCurrentValue(monVars))

    const updateMonitoredVariableInstance = (monVars: MonitoredVariableInstance[]) => { 

        //console.log("monvars:", monVars)    
        if(flagFirstTime){

            flagFirstTime = false
            startCountdown(10)
        }
    
        if(flagDezSegundos){
          
            flagDezSegundos=false
            
            for(const monVar of monVars) {
            
                if(selectedMonitoredVariableGlobal.length === 0){
                    return []
                }
                
                     
                else{
    
                   for(const selectedMonVar of selectedMonitoredVariableGlobal){
                              
                        if((selectedMonVar.monitoredVariableName === monVar.monitoredVariableName) && (selectedMonVar.scAssociated === monVar.sc) && (selectedMonVar.fbAssociated === monVar.id)){
                           
                            setMonitoredVariableInstances((prevMonitoredVariables: MonitoredVariableWithCurrentValue[]) => {
    
                                let newMonVar = true
                    
                                const newMonitoredVariables = getMonitoredVariablesWithCurrentValue(prevMonitoredVariables.map((oMonVar:MonitoredVariableWithCurrentValue) => {
                    
                                    if((oMonVar.monitoredVariableName === monVar.monitoredVariableName) && (oMonVar.sc === monVar.sc) &&  (oMonVar.id === monVar.id)) {
                                        newMonVar = false
                                        return monVar
                                    }
                                    return oMonVar
                    
                                }))
    
                                if(newMonVar){
                                    return [...prevMonitoredVariables, addCurrentValueData(monVar)]
                                }
                                return newMonitoredVariables
                    
                            })
                        }
                    }
                }
                
            }
        
        }
       
     
    }

    const getMonitoredVariablesWithCurrentValue = (monVars: MonitoredVariableInstance[]) : MonitoredVariableWithCurrentValue[] => {

        return monVars.map((monVar:MonitoredVariableInstance) => addCurrentValueData(monVar))

    }

    const addCurrentValueData = (monVar: MonitoredVariableInstance) : MonitoredVariableWithCurrentValue => {

        return (
            {
                ...monVar, 
                currentValueData:  {
                    key: monVar.monitoredVariableName,
                    data: monVar.currentValue
                }
            }
        )
    }

    const onDisconnect = () => {
        setError("Server error")
        setFetching(false)
    }

    useMountEffect(() => {
        setTimeout(() => {

            socket.connect(() => {}, onDisconnect)
            socket.emit(SOCKET_EVENT.UPDATE_BACKEND,"UpdateMonitoredVariables")
            socket.addListener(SOCKET_EVENT.EDITED_MVI_EVENT, (data) => updateMonitoredVariableInstance(data))
            
        }, 0)

    }, () => socket?.disconnect())


    //Função de trigger --> manipulação de dados quando carrega no botão de trigger
    const triggerEventAction = (monEv: MonitoredEvent) : Promise<any> => {
        
        return new Promise(async(res:Function,rej:Function) => {
            
            try {

                socket.connect(() => {}, onDisconnect)
                socket.emit(SOCKET_EVENT.TRIGGER_EVENT,monEv)
                res("hello")

              }
    
            catch(err) {
                rej(err)
            }
        })
    }

    if(redirectTo !== "") 
    return <Redirect to={redirectTo} push={true} />

    return(
    <Navigator title="Digital Twin Monitoring">
    <>
        <Grid item>
            <Card>
                <CardHeader title={functionalityName} />
                <Divider />
                    <CardContent>
                        <Grid item xs={12}>        
                            <Grid item>
                                <JPTable
                                    sortedkey="idMonitoredVariable"
                                    data={monitoredVariableInstances} 
                                    updateData={updateMonitoredVariableInstances} 
                                    indexes={indexes_variable} 
                                    tName='MonitoredVariable'
                                    extra = {{   
                                        delete: {
                                        action: deleteMonitoredVariableAction,
                                        labelKey: 'idMonitoredVariable',
                                        onSuccessDelete: () => {}
                                    }}}
                                 
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardContent>
                        <Grid item xs={12}>        
                            <Grid item>
                                <JPTable
                                    sortedkey="idMonitoredEvent"
                                    data={getDataMonitoredEvent()} 
                                    updateData={updateMonitoredEvents} 
                                    indexes={indexes_event} 
                                    tName='MonitoredEvent'
                                    extra={{
                                        trigger_button: {
                                            action: triggerEventAction
                                        },
                                        delete: {
                                            action: deleteMonitoredEventAction,
                                            labelKey: 'idMonitoredEvent',
                                            onSuccessDelete: () => {}
                                        }
                                    }} 
                                />
                                
                            </Grid>
                            
                        </Grid>
                    </CardContent>
            </Card>
        </Grid>
        <FunctionalityForm
            cancel={{action: redirectToList, label: 'Cancel'}}
        />
    </>
    
    </Navigator>
    )
}