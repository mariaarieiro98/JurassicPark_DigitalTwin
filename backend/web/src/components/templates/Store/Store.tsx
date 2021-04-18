import React, { useContext } from 'react'
import { useReducer, Reducer }  from 'react'

const Context : React.Context<GlobalStore_T>= React.createContext({})

export interface Reducer_T {
    reducer : Reducer<any,any>
    initialState: any
}

export interface GlobalStore_T {
    [key: string] : Store_T
}

export interface Store_T {
    data: any
    dispatchAction: (value: any) => void
}

export const defaultStore : Store_T = {
    data: [],
    dispatchAction: () => {}
}
  
export const useCreateStore = (reducer: Reducer_T) : Store_T => {

    const [data, dispatchAction] = useReducer(reducer.reducer,reducer.initialState)
    return {data,dispatchAction}

}

export const useStore = (value:string) : Store_T => {
    
    const context = useContext<GlobalStore_T>(Context)
    return value in context ? context[value] : defaultStore
  
  }

export const Store = (props: {children:JSX.Element, store: any}) : JSX.Element => {
    
    return (
        <Context.Provider value={props.store}>
            {props.children}
        </Context.Provider>
    )

}