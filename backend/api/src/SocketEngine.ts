import * as socketIO from "socket.io";
import { smartComponentMainController } from "./controllers/smart-component/smartComponentMainController";
import { MonitoredEvent} from "./model";

let flagFirstTime = true

export interface Initializer {
    data: () => void
    action?: () => void
}

export interface SocketEngineInterface {
    namespace: string
    initializer? : Initializer
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
                    
            socket.on("update-backend", (data) => {
                smartComponentMainController.readAllFunctions()
                
            })

            socket.on('trigger-event', (data) => {
                makeTriggerCommandAndExecute(data)
                              
            })

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

    function makeTriggerCommandAndExecute(data: MonitoredEvent) {

        var fs = require('fs'), path = require('path');

        let key_eventName =  data.monitoredEventName
        let key_eventFb = data.fbAssociated
        let key_deviceName = data.scAssociated
    
        if(flagFirstTime){
            flagFirstTime=false
            process.chdir('./4diac-lib')
        }
        
        let ipArray = [key_eventFb + "." + key_eventName]
        let server = key_deviceName + "@192.168.1.83:61493"
        let jsonData = {[server]:ipArray} 
        
        let jsonString = JSON.stringify(jsonData,null,2)

        //Função que escreve no ficheiro ./events_sub_serv.json a jsonString atualizada
        fs.writeFile('./events_sub_serv.json', jsonString, function(err){
            if(err) return console.log(err);
            console.log('File edited');
        });

        //Comando para dar trigger no evento 
        const { exec } = require("child_process");

        exec("python3 trigger_fb.py events_sub_serv.json", (error, stdout, stderr) => {
            if (error) {
                console.log(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`Error in the command`);
                return;
            }
            console.log(`Successful trigger ${stdout}`);
        });
    }
