"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketIO = require("socket.io");
const smartComponentMainController_1 = require("./controllers/smart-component/smartComponentMainController");
let flagFirstTime = true;
class SocketEngine {
    constructor(interfaces) {
        this.sendMessageToClient = (namespaces, event, payload) => {
            namespaces.forEach((namespace) => {
                const ns = this.connection.of('/' + namespace);
                ns.emit(event, payload);
            });
        };
        this.removeNamespace = (namespace) => {
            delete this.connection.nsps['/' + namespace];
        };
        this.interfaces = interfaces;
    }
    start(port) {
        const started = !!this.connection;
        if (!started) {
            this.connection = socketIO(port);
            this.connection.on("connection", (socket) => {
                socket.on("disconnect", () => {
                    socket.removeAllListeners();
                    socket.disconnect();
                });
            });
        }
        this.interfaces.forEach((socketInterface) => {
            this.createNamespace(socketInterface);
        });
        console.log(`Socket IO engine ${started ? 'already ' : ''}started on port ${port}`);
    }
    createNamespace(socketInterface) {
        console.log('creating namespace ' + socketInterface.namespace);
        this.connection.of('/' + socketInterface.namespace).on("connection", (socket) => {
            var _a, _b;
            this.connection.of('/' + socketInterface.namespace);
            if ((_a = socketInterface.initializer) === null || _a === void 0 ? void 0 : _a.action)
                socketInterface.initializer.action();
            socket.emit('initial-data', (_b = socketInterface.initializer) === null || _b === void 0 ? void 0 : _b.data());
            socket.on("update-backend", (data) => {
                smartComponentMainController_1.smartComponentMainController.readAllFunctions();
            });
            socket.on('trigger-event', (data) => {
                makeTriggerCommandAndExecute(data);
            });
            socket.on("disconnect", () => {
                socket.disconnect();
            });
        });
    }
    addListenerToNamespace(namespace, event, listener, dataToSend) {
        this.connection.of('/' + namespace).on("connection", (socket) => {
            socket.on(event, (data) => {
                listener();
            });
        });
    }
}
exports.SocketEngine = SocketEngine;
function makeTriggerCommandAndExecute(data) {
    var fs = require('fs'), path = require('path');
    let key_eventName = data.monitoredEventName;
    let key_eventFb = data.fbAssociated;
    let key_deviceName = data.scAssociated;
    if (flagFirstTime) {
        flagFirstTime = false;
        process.chdir('./4diac-lib');
    }
    let ipArray = [key_eventFb + "." + key_eventName];
    let server = key_deviceName + "@192.168.1.83:61493";
    let jsonData = { [server]: ipArray };
    let jsonString = JSON.stringify(jsonData, null, 2);
    //Função que escreve no ficheiro ./events_sub_serv.json a jsonString atualizada
    fs.writeFile('./events_sub_serv.json', jsonString, function (err) {
        if (err)
            return console.log(err);
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
//# sourceMappingURL=SocketEngine.js.map