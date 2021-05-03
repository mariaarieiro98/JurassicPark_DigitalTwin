import React, { useState } from 'react'
import { Navigator } from '../../templates/Navigator/Navigator'
import { LazyComponent } from '../../templates/LazyComponent/LazyComponent'
import { JPTable } from '../../templates/Table/JPTable'
import { SmartComponent } from '../../../model/index'
import { useMountEffect } from '../../../utils/main'
import { useSmartComponentStyles } from '../style'
import { Box, Button } from '@material-ui/core'
import { Redirect } from 'react-router-dom'
import {Visibility} from '@material-ui/icons'
import { SocketConnection, SOCKET_EVENT } from '../../../services/socket/socket'
import { ConfirmActionStateLabel, ConfirmActionProps, ConfirmAction } from '../../templates/ConfirmAction/ConfirmAction'

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

export const SmartComponentList = () : React.ReactElement => {
    
    const classes = useSmartComponentStyles()
    
    const socket : SocketConnection = new SocketConnection(SocketConnection.getSmartComponentsNamespace())
    
    const [error,setError] : [string,Function] = useState('')
    const [fetching,setFetching] : [boolean, Function] = useState(true)

    const [smartComponents,setSmartComponents] : [SmartComponentWithDataState[],Function] = useState([])

    const [redirectToDetail,setRedirectToDetail] : [number, Function] = useState(-1)

    const indexes = [
        {label: 'Name', key: 'scName'},
        {label: 'Address', key: 'scAddress'},
        {label: 'Port', key: 'scPort'},
        {label: 'Type', key: 'scType'},
        {label: 'CPU %', key: 'cpuPercent'},
        {label: 'MEM %', key: 'memPercentage'},
        {label: 'State', key: 'state'},
        {label: '', key: 'detail'},
    ]

    const onDisconnect = () => {
        setError("Server error")
        setFetching(false)
        setSmartComponents([])
    }

    const onInitialData = (data:any) => {
        updateSmartObjects(data.result)
        setFetching(false)
    } 

    useMountEffect(() => {

        setTimeout(() => {

            socket.connect(() => {}, onDisconnect, onInitialData)
            socket.addListener(SOCKET_EVENT.UPDATED_SC_EVENT, (data) => updateSmartComponent(data.sc))

        }, 0)

    }, () => socket?.disconnect())


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
                    data: <Button variant="text" size="small" onClick={redirectToDetailAction(sc.scId)}><Visibility fontSize="small"/></Button> 
                }
            }
        )
    }

    const redirectToDetailAction = (id?: number) => () => setRedirectToDetail(id)

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
    }

    if(redirectToDetail !== -1)
        return <Redirect to={`/smart-component/${redirectToDetail}`} push={true}/>
    
    return (
        <Navigator title="Smart Components">
            <>
                <LazyComponent loaded={!fetching}>
                    {error !== ''
                        ? <ConfirmAction {...confirmActionProps}/> 
                        : <JPTable 
                            data={smartComponents} 
                            updateData={updateSmartObjects} 
                            indexes={indexes}
                            sortedkey='scName' 
                            tName='Function Block'
                        />
                    }
                </LazyComponent>
            </>
        </Navigator>
    )

}
