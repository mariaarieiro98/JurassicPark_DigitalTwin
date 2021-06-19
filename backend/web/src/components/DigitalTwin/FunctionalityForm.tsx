import { useState } from 'react'
import { Grid, Button} from '@material-ui/core'
import { useFunctionBlockStyles } from '../FunctionBlocks/FunctionBlock/style'
import { BackspaceOutlined } from '@material-ui/icons'
import { useStore } from '../templates/Store/Store'

interface FunctionalityFormProps {

    cancel: {
        label: string
        action: () => void
    },
}

export const FunctionalityForm = (props: FunctionalityFormProps) => {

    /**styles */
    const classes = useFunctionBlockStyles()

    /**list of digital-twins */
    const {data: digitalTwins, dispatchAction:dispatchDigitalTwinsActions} = useStore('digitalTwins')
    const [validDt,setValidDt] : [boolean, Function] = useState(true)

    /* Buttons */

    const onCancel = props.cancel.action
    const cancelLabel = props.cancel.label


    return (
            <Grid item xs container direction="row" justify="space-between" alignItems="center"> 
              <Grid item xs={6} container direction="row" spacing={2} alignItems="center" justify="flex-end">
                <Grid item>
                <Button onClick={onCancel} style={{minWidth:0}} variant="text" size="medium"><BackspaceOutlined fontSize="large"/></Button>
                </Grid>
              </Grid>
            </Grid>
      )
}