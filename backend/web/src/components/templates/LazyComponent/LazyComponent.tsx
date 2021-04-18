import React from 'react'
import { CircularProgress, Box } from "@material-ui/core"

export const LazyComponent = (props: {loaded: boolean, children: JSX.Element}) : JSX.Element => {

    return (
        <div>
            {props.loaded 
                ? props.children 
                : <Box textAlign="center">
                    <CircularProgress color="primary" />
                  </Box>  
            }
        </div>
    )

}