import React from 'react'
import { TextField } from '@material-ui/core'
import {Autocomplete} from '@material-ui/lab'

interface SearchableListProps<T> {

    showKey: keyof T
    inList: T[]
    setInList: Function
    outList: T[] 
    setOutList?: Function
     newLabel: string

}

export const SearchableList = <T extends any>(props: SearchableListProps<T>) => {

    const onChange = (_:any, inList: T[]) => {
        
        props.setInList(inList)
        if(props.setOutList)
            props.setOutList(props.inList.concat(props.outList).filter((element: T) => !inList.includes(element)))
        
    }

    return (

        <Autocomplete
            multiple
            options={props.outList}
            getOptionLabel={(element:T) => element[props.showKey] as unknown as string}
            value={props.inList}
            onChange={onChange}
            style={{width:350}}
            renderInput={params => <TextField {...params} label={props.newLabel} />}
        />

    )

}
