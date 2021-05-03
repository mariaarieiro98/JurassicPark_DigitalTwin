import { Box, Button, Card, CardContent, CardHeader, Divider, Grid } from '@material-ui/core'
import React, { useState } from 'react'
import { match, Redirect, useRouteMatch } from 'react-router-dom'
import { routes } from '../../App'
import { FbInstance, Functionality, MonitoredEvent, MonitoredVariable, MonitoredVariableInstance, SmartComponent } from '../../model'
import { FunctionalityActions, MonitoredEventActions, MonitoredVariableActions, SmartComponentActions } from '../../redux/actions'
import { RequestResponseState } from '../../services/api/api'
import { getOrDownloadFunctionalities, getOrDownloadMonitoredEvents, getOrDownloadMonitoredVariables } from '../../utils/digitalTwins'
import { useMountEffect } from '../../utils/main'
import { Navigator } from '../templates/Navigator/Navigator'
import { useStore } from '../templates/Store/Store'
import { JPTable } from '../templates/Table/JPTable'
import { FunctionalityForm } from './FunctionalityForm'
import { SocketConnection, SOCKET_EVENT } from '../../services/socket/socket'
import { Visibility } from '@material-ui/icons'
import { useSmartComponentStyles } from '../SmartComponents/style'

//Esta página pretende dispor informação mais detalhada da funcionalidade correspondente disponível na página "DigitalTwinMonitoring"

interface SmartComponentWithDataState extends SmartComponent {
    state: {
        key:string | undefined
        data: React.ReactElement
    },
    detail: {
        key: 'detail'
        data: React.ReactElement
    }
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
    
    //Cabeçalhos da tabela Variable + Funções Necessárias
    const indexes_variable = [
        {label: 'Variable', key: 'monitoredVariableName'},
        {label: 'Function Block', key: 'fbAssociated'},
        {label: 'Smart Component', key: 'scAssociated'},
        {label: 'Current Value', key: 'state'},
        {label: 'Graph', key: 'dtName'},
        {label: 'Remove', key: 'dtName'},
    ]

    const getDataMonitoredVariable = () =>  selectedMonitoredVariable.map((monitoredVariable: MonitoredVariable) => {    
        
        return {
            ...monitoredVariable
        }

    })

    //Cabeçalhos da tabela Event + Funções Necessárias
    const indexes_event = [
        {label: 'Event', key: 'monitoredEventName'},
        {label: 'Function Block', key: 'fbAssociated'},
        {label: 'Smart Component', key: 'scAssociated'},
        {label: 'Trigger', key: 'dtName'},
        {label: 'Current Value', key: 'sc.scState'},
        //{label: 'Graph', key: 'dtName'},
        {label: 'Remove', key: 'dtName'},
    ]

    const getDataMonitoredEvent = () =>  selectedMonitoredEvent.map((monitoredEvent: MonitoredEvent) => {    
        
        return {
            ...monitoredEvent
        }

    })

    //Variáveis e funções que permitem o redireccionamento para a página DigitalTwinMonitoring
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

    //Recuperar dados da funcionalidade
    let [functionalityName, setFunctionalityName] : [Functionality[], Function] = useState([])

    let i = 0;
    while(i < functionalities.length){

        if(functionalities[i].funcId == id) {
          functionalityName = functionalities[i].funcName
        }
        i++
    }

    //Estabelecer a ligação com os sockets
    const socket : SocketConnection = new SocketConnection(SocketConnection.getSmartComponentsNamespace())
    
    const [smartComponents,setSmartComponents] : [SmartComponentWithDataState[],Function] = useState([])

    const classes = useSmartComponentStyles()

    const updateSmartObjects = (scs:SmartComponent[]) => setSmartComponents(getComponentsWithStateData(scs))

    const updateSmartComponent = (sc: SmartComponent) => {

        setSmartComponents((prevComponents: SmartComponentWithDataState[]) => {

            let newSc = true

            const newComponents = getComponentsWithStateData(prevComponents.map((oSc:SmartComponentWithDataState) => {

                if(oSc.scId === sc.scId) {
                    newSc = false
                    return sc
                }
                return oSc

            }))

            if(newSc)
                return [...prevComponents, addStateAndDetialData(sc)]
            return newComponents

        })
    }

    const getComponentsWithStateData = (scs: SmartComponent[]) : SmartComponentWithDataState[] => {

        return scs.map((sc:SmartComponent) => addStateAndDetialData(sc))

    }

    const addStateAndDetialData = (sc: SmartComponent) : SmartComponentWithDataState => {

        return (
            {
                ...sc, 
                state:  {
                    key: sc.scState,
                    data: <Box className= {`${classes.onLineState} ${sc.scState === 'connected' ? classes.onLineStateOn : classes.onLineStateOff}`}/>
                },
                detail: {
                    key: 'detail',
                    data: <Button variant="text" size="small"><Visibility fontSize="small"/></Button> 
                }
            }
        )
    }

    const onInitialData = (data:any) => {
        updateSmartObjects(data.result)
        setFetching(false)
    } 


    const onDisconnect = () => {
        setError("Server error")
        setFetching(false)
        setSmartComponents([])
    }

    let variable = 'VALUE'
    useMountEffect(() => {

        setTimeout(() => {

            socket.connect(() => {}, onDisconnect, onInitialData)
            socket.addListener(SOCKET_EVENT.UPDATED_SC_EVENT, updateSmartComponent)
            socket.emit(SOCKET_EVENT.EDITED_MVI_EVENT, variable)

        }, 0)

    }, () => socket?.disconnect())


    if(redirectTo !== "") 
    return <Redirect to={redirectTo} push={true} />

    return(
    <Navigator title="Digital Twin monitoring">
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
                                    data={getDataMonitoredVariable()} 
                                    updateData={updateMonitoredVariables} 
                                    indexes={indexes_variable} 
                                    tName='MonitoredVariable'
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