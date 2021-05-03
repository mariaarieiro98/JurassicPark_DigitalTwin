import React, { useState } from 'react'
import { useRouteMatch, match, Redirect } from 'react-router-dom'
import { ConfirmActionStateLabel, ConfirmActionProps, ConfirmAction } from '../../templates/ConfirmAction/ConfirmAction'
import { Navigator } from '../../templates/Navigator/Navigator'
import { LazyComponent } from '../../templates/LazyComponent/LazyComponent'
import { useMountEffect } from '../../../utils/main'
import { SocketConnection, SOCKET_EVENT } from '../../../services/socket/socket'
import { SmartComponent, FbInstance } from '../../../model'
import { Typography, Card, CardHeader, CardContent, Grid, Box, Divider, withTheme, Theme } from '@material-ui/core'
import { useSmartComponentStyles } from '../style'
import { BarChart } from '../../templates/Charts/Bars'
import { GaugeChart } from '../../templates/Charts/Gauge'
import { JPTable } from '../../templates/Table/JPTable'
import {Settings, Error} from '@material-ui/icons'


const FunctionBlockInstanceList = (props: {fbInstances: any[], update: (instances: any[]) => void}) => {
    
    const classes = useSmartComponentStyles()

    return (
        <JPTable
            data={props.fbInstances.map((i:FbInstance) => {

                return {
                    ...i,
                    stateData: {
                        key: i.state,
                        data: i.state === 1 ? <Settings className={classes.functionBlockGood} /> : <Error className={classes.functionBlockError}/>
                    }
                }
            })}
            indexes={[
                {label: 'Instance Name', key: 'id'},
                {label: 'Function Block Type', key: 'fbType'},
                {label: 'Function Block Category', key: 'fbCategory'},
                {label: 'Function Block Opcua Category', key: 'fbGeneralCategory'},
                {label: 'State', key: 'stateData'},
            ]}
            tName=''
            updateData={props.update}
            sortedkey='id'

        />
    )
}

const InfoItem = (props:{label:string, value: any}) => (
    <>
        <Box p={1} bgcolor="primary.main" textAlign="center" color="primary.contrastText">{props.label}</Box>
        <Box py={1} border={1} textAlign="center" borderColor="secondary">{props.value}</Box>
    </>
)

const MainComponent = withTheme((props:{theme:Theme, error:string, setError:Function}) => {

    const classes = useSmartComponentStyles()

    const matchParams : match = useRouteMatch()
    const id = (matchParams.params as any).id

    const socket : SocketConnection = new SocketConnection(SocketConnection.getSmartComponentNamespace(id))

    const [initialData,setInititalData] = useState(false)

    const [smartComponentName,setSmartComponentName] : [string,Function] = useState('')
    const [smartComponentState,setSmartComponentState] : [string,Function] = useState('')
    const [smartComponentType,setSmartComponentType] : [string,Function] = useState('')

    const [smartComponentCpuMaxFreq,setSmartComponentCpuMaxFreq] : [number,Function] = useState(0.0)
    const [smartComponentCpuMinFreq,setSmartComponentCpuMinFreq] : [number,Function] = useState(0.0)
    const [smartComponentCpuCurrentFreq,setSmartComponentCpuCurrentFreq] : [number,Function] = useState(0.0)
    const [smartComponentCpuPercent,setSmartComponentCpuPercent] : [number,Function] = useState(0.0)

    const [smartComponentMemAvailable,setSmartComponentMemAvailable] : [number,Function] = useState(0.0)
    const [smartComponentMemTotal,setSmartComponentMemTotal] : [number,Function] = useState(0.0)
    const [smartComponentMemUsed,setSmartComponentMemUsed] : [number,Function] = useState(0.0)
    const [smartComponentMemPercentage,setSmartComponentMemPercentage] : [number,Function] = useState(0.0)
    
    const [smartComponentFbInstances,setSmartComponentFbInstances] : [FbInstance[],Function] = useState([])

    useMountEffect(() => {
        
        setTimeout(() => {
            
            socket.connect(()=>{}, () => {},onInitialData)
            socket.addListener(SOCKET_EVENT.UPDATED_SC_EVENT,updateSmartComponent)
            socket.addListener(SOCKET_EVENT.EDITED_FBI_EVENT,updateSmartComponentFunctionBlockInstances)

        }
        ,0)

    }, () => socket?.disconnect())

    const onInitialData = (data:SmartComponent) => {
        updateSmartComponent({sc: data})
        updateSmartComponentFunctionBlockInstances(data.fbInstances ?? [])
        setInititalData(true)

    } 

    const updateSmartComponent = (data: any) => {
    
        const sc : SmartComponent = data.sc
      
        if(smartComponentName !== sc.scName)
            setSmartComponentName(sc.scName)
        if(smartComponentState !== sc.scState)
            setSmartComponentState(sc.scState)
        if(smartComponentType !== sc.scType)
            setSmartComponentType(sc.scType)
        if(smartComponentCpuMaxFreq !== sc.cpuFreqMax)
            setSmartComponentCpuMaxFreq(sc.cpuFreqMax)
        if(smartComponentCpuMinFreq !== sc.cpuFreqMin)
            setSmartComponentCpuMinFreq(sc.cpuFreqMin)
        if(smartComponentCpuCurrentFreq !== (sc.cpuFreqCurrent ?? 0)/1000)
            setSmartComponentCpuCurrentFreq((sc.cpuFreqCurrent ?? 0)/1000)
        if(smartComponentCpuPercent !== sc.cpuPercent)
            setSmartComponentCpuPercent(sc.cpuPercent)
        if(smartComponentMemAvailable !== (sc.memAvailable ?? 0)/1000000)
            setSmartComponentMemAvailable(((sc.memAvailable as any)[1] ?? 0) / 1000000)
        if(smartComponentMemTotal !== (sc.memTotal ?? 0)/1000000)
            setSmartComponentMemTotal(((sc.memTotal as any)[1] ?? 0) / 1000000)
        if(smartComponentMemUsed !== (sc.memUsed ?? 0)/1000000)
            setSmartComponentMemUsed(((sc.memUsed as any)[1] ?? 0) / 1000000)
        if(smartComponentMemPercentage !== sc.memPercentage)
            setSmartComponentMemPercentage(sc.memPercentage)
        
    }

    const updateSmartComponentFunctionBlockInstances = (instances: FbInstance[]) => {
        setSmartComponentFbInstances(instances)

    }
    
    return (

        <Grid container direction="column" spacing={1}>
            <Grid item>
                <Card>
                    <CardContent>
                        <Grid container justify="space-between" direction="row" alignItems="center">
                            <Grid item>
                                <LazyComponent loaded={smartComponentName !== ''}>
                                    <Typography variant="h4"> {smartComponentName} </Typography>
                                </LazyComponent>
                                <LazyComponent loaded={smartComponentType !== ''}>
                                    <Typography>{smartComponentType}</Typography>
                                </LazyComponent>
                            </Grid>
                            <Grid item>
                                <Box className={`${classes.onLineState} ${classes.onLineStateComponent} ${smartComponentState === 'connected' ? classes.onLineStateOn : classes.onLineStateOff}`} />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item container direction="row" spacing={1}>
                <Grid item xs={6}>
                    <Card>
                        <CardHeader title="CPU" />
                        <Divider />
                        <CardContent>
                            <Grid container direction="row" alignItems="center" justify="space-between">
                                <Grid item xs={7}>
                                    <GaugeChart
                                        label="Usage"
                                        value={smartComponentCpuPercent}
                                        ticks={3}
                                        warnMin={70}
                                        warnMax={85}
                                        dangerMin={85}
                                        dangerMax={100}
                                        max={100}
                                        min={0}
                                    />
                                </Grid>
                                <Grid xs={4} item container direction="column" spacing={2}>
                                    <Grid item>
                                        <InfoItem label="Maximum Frequency" value={`${smartComponentCpuMaxFreq} GHz`} />
                                    </Grid>
                                    <Grid item>
                                        <InfoItem label="Minimum Frequency" value={`${smartComponentCpuMinFreq} GHz`} />
                                    </Grid>
                                    <Grid item>
                                        <InfoItem label="Current Frequency" value={`${smartComponentCpuCurrentFreq.toFixed(2)} GHz`} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6}>
                    <Card>
                        <CardHeader title="Memory" />
                        <Divider />
                        <CardContent>
                            <Grid container direction="row" alignItems="center" justify="space-between">
                                <Grid item xs={7}>
                                    <BarChart
                                        colors={[smartComponentMemPercentage < 70 ? props.theme.palette.grey[100] : props.theme.palette.warning.main]}
                                        data={[['Percentage','percentage'], ['', smartComponentMemPercentage]]}
                                        title={'Percentage'}
                                        min={0}
                                        max={100} 
                                    />
                                </Grid>
                                <Grid xs={4} item container direction="column" spacing={2}>
                                    <Grid item>
                                        <InfoItem label="Total" value={`${smartComponentMemTotal.toFixed(3)} MB`} />
                                    </Grid>
                                    <Grid item>
                                        <InfoItem label="Available" value={`${smartComponentMemAvailable.toFixed(3)} MB`} />
                                    </Grid>
                                    <Grid item>
                                        <InfoItem label="Used" value={`${smartComponentMemUsed.toFixed(2)} MB`} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Grid item>
                <Card>
                    <CardHeader title="Function Block Instances" />
                    <Divider />
                    <CardContent>
                        <LazyComponent loaded={initialData}>
                            <FunctionBlockInstanceList 
                                fbInstances={smartComponentFbInstances}
                                update={updateSmartComponentFunctionBlockInstances}
                            />
                        </LazyComponent>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

    )
})

export const SmartComponentDetail = () => {

    const [redirectToList, setRedirectToList] : [boolean,Function] = useState(false)
    const [error, setError] : [string,Function] = useState('')

    const confirmActionStates = {

        error: {
          label: error,
          state: ConfirmActionStateLabel.error,
          positiveLabel: 'Ok'
        },
    }
    
    const confirmActionProps : ConfirmActionProps = {

        title: 'Loading Smart-Component',
        states: confirmActionStates,
        currentState: confirmActionStates.error,
        onCancel: () => setError(''),
        onError: () => setRedirectToList(true),
      
    }

    if(redirectToList)
        return <Redirect to="/smart-component" push={true} />

    return (
        <Navigator title="Smart Component Detail">
            {error !== ''
                ? <ConfirmAction {...confirmActionProps}/>
                : <MainComponent error={error} setError={setError} />
            }
        </Navigator>
    )
}
