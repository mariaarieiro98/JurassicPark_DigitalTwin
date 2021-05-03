import { argv } from 'node:process'
import socketIOClient from 'socket.io-client'

export enum SOCKET_EVENT {
    UPDATED_SC_EVENT = 'smart-component-updated',
    EDITED_FBI_EVENT = 'smart-component-fbi-updated',
    INITIAL_DATA = 'initial-data',
    EDITED_MVI_EVENT = 'smart-component-mvi-updated'
}

export class SocketConnection {
    
    private host : string 
    private port? : number 
    private namespace : string
    private base : string
    private socket? : SocketIOClient.Socket = undefined
    
    static resources = {
        smartComponents: '/smart-component'
    }

    constructor(namespace:string) {
        this.host = process.env.REACT_APP_BACKEND_HOST ?? 'localhost'
        this.port = parseInt(process.env.REACT_APP_SOCKET_PORT ?? '3500') 
        this.namespace = namespace
        this.base = `${this.host}:${this.port}${this.namespace}`   
    }

    static getSmartComponentsNamespace() {
        return this.resources.smartComponents
    }

    static getSmartComponentNamespace(scId: number) {
        return `${this.resources.smartComponents}/${scId}`
    }

    public connect(onConnect: () => void, onDisconnect: () => void, onInitialData?: (data:any) => void, onError?: (error:any) => void, onRecconected?: () => void, onReconnecting?: (time:number) => void) {

        this.socket = socketIOClient(this.base)
        this.socket.on("connect", () => {
            onConnect()
        })

        this.socket.on("disconnect", () => {
            onDisconnect()
        })

        this.socket.on("connect_error", (error:any) => {
            console.error(error) 
            if(onError) onError(error)
        })

        this.socket.on("error", (error:any) => {
            console.error(error) 
            console.error("error") 
            if(onError) onError(error)
        })

        this.socket.on("connect_timeout", (error:any) => {
            console.error(error) 
            console.error("connect_timeout")
            if(onError) onError(error) 
        })

        this.socket.on(SOCKET_EVENT.INITIAL_DATA, (data:any) => {
            if(onInitialData) onInitialData(data)
        })

        this.socket.on("reconnect", (attemptNumber: number) => {
            console.log('reconnected at ' + attemptNumber)
            if(onRecconected) onRecconected()
        })

        this.socket.on("reconnecting", (attemptNumber: number) => {
            if(onReconnecting) onReconnecting(attemptNumber)
        })

    }

    public disconnect() {
        this.socket?.removeAllListeners()
        this.socket?.disconnect()
    }

    public addListener(event: SOCKET_EVENT, listener:(data:any) => void) {
        this.socket?.on(event,listener)
    }

    public emit(event: SOCKET_EVENT, data: any) {

        // this.socket?.emit("ferret", data, (data: any) => {
        //     console.log(data); // data will be "woot"
        // })

        this.socket?.emit(event, data , (data: any) => {
            console.log(data); 
        })
    }
} 