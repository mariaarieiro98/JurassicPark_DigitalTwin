import { Button, Grid } from '@material-ui/core'
import { Clear } from '@material-ui/icons'
import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { routes } from '../../App'
import { Navigator } from '../templates/Navigator/Navigator'
import { FunctionalityForm } from './FunctionalityForm'

//Esta página pretende dispor informação mais detalhada da funcionalidade correspondente disponível na página "DigitalTwinMonitoring". Usa o FunctionalyForm
//como base da página.

export const FunctionalityDetails = () => {

    //Variáveis e funções que permitem o redireccionamento para a página DigitalTwinMonitoring
    const [redirectTo, setRedirectTo] : [string, Function] = useState("")

    const redirectToList = () => setRedirectTo(routes.digitalTwinMonitoring)
  
    if(redirectTo !== "") 
    return <Redirect to={redirectTo} push={true} />

    return(
    <Navigator title="Digital Twin monitoring">
       <>
        <FunctionalityForm
            cancel={{action: redirectToList, label: 'Cancel'}}
        />
       </>
    </Navigator>
    )
}