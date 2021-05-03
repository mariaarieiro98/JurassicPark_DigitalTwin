"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketIO = require("socket.io");
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
            socket.on('smart-component-mvi-updated', (variable, fn) => {
                var _a;
                (_a = socketInterface.variable) === null || _a === void 0 ? void 0 : _a.sendVariableToServer(variable);
                fn("woot");
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
//# sourceMappingURL=SocketEngine.js.map