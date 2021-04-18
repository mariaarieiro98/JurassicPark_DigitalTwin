import { EffectCallback, useEffect } from "react"

export type Order = 'asc' | 'desc'

export const useMountEffect = (actionOnMount: EffectCallback, actionOnUnmount?:any) => {
    
    const action : EffectCallback = () => {
        actionOnMount()
        return actionOnUnmount
    }

    useEffect(action,[])
    
}

export const setField = (setState:Function, fieldName: string, state:any) => (event: any) => setState({...state, [fieldName]: event.target.value})

export const setSimpleField = (updateFunction: Function, extraJob?: () => void) => (event:any) => {
    if(extraJob)
        extraJob()
    updateFunction(event.target.value)
}

export const toBase64 = (file: File) : Promise<string> => {

    return new Promise((res:Function, rej: Function) => {

        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => res(reader.result)
        reader.onerror = error => rej(error)

    })

}

export const readLocalFile = (file: File) : Promise<string> => {
    
    return new Promise((res:Function, rej:Function) => {
        
        const fileReader = new FileReader()
        fileReader.readAsText(file)
        fileReader.onload = (result:any) => res(result.target.result)
        fileReader.onerror = (e:any) => rej('Error')

    })

}