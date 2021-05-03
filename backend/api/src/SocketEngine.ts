import { verifyIsOPCUAValidCertificate } from "node-opcua-client";
import * as socketIO from "socket.io";


export interface Initializer {
    data: () => void
    action?: () => void
}

export interface MonitoredVariable {
    sendVariableToServer(variable:string)
    data: (variable: string) => void 
    action?: () => void
}

export interface SocketEngineInterface {
    namespace: string
    initializer? : Initializer
    variable?: MonitoredVariable
}

export class SocketEngine {
    
    connection : socketIO.Server
    interfaces: SocketEngineInterface[]
    
    constructor(interfaces: SocketEngineInterface[]) {
        this.interfaces = interfaces
    }

    public start(port: number) {

        const started = !!this.connection

        if(!started) {
            
            this.connection = socketIO(port)
            this.connection.on("connection", (socket: SocketIO.Socket) => {

                socket.on("disconnect", () => {

                    socket.removeAllListeners()
                    socket.disconnect()
                
                })
            })
            
        }

        this.interfaces.forEach((socketInterface: SocketEngineInterface) => {

            this.createNamespace(socketInterface)

        })

        console.log(`Socket IO engine ${started ? 'already ' : ''}started on port ${port}`)

    }

    
    public createNamespace(socketInterface: SocketEngineInterface) {

        console.log('creating namespace ' + socketInterface.namespace)

        this.connection.of('/'+ socketInterface.namespace).on("connection", (socket: SocketIO.Socket) => {

            this.connection.of('/'+ socketInterface.namespace)

            if(socketInterface.initializer?.action)
                socketInterface.initializer.action()

            socket.emit('initial-data', socketInterface.initializer?.data())

            socket.on('smart-component-mvi-updated', (variable, fn) => {
                socketInterface.variable?.sendVariableToServer(variable)
                fn("woot");
            });
            
                        
            socket.on("disconnect", () => {
                socket.disconnect()
            })
        })

    }

    public addListenerToNamespace(namespace: string, event: string, listener?: Function, dataToSend?: any) {

        this.connection.of('/'+ namespace).on("connection", (socket: SocketIO.Socket) => {

            socket.on(event, (data) => {

                listener()

            })

        })

    }


    sendMessageToClient = (namespaces:string[], event: string, payload: any) => {

        namespaces.forEach((namespace:string) => {
            const ns : SocketIO.Namespace = this.connection.of('/'+ namespace)
            ns.emit(event, payload)
        })
    }

    public removeNamespace = (namespace: string) => {

        delete this.connection.nsps['/' + namespace]

    }
}

