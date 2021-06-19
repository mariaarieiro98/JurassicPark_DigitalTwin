"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const opcuaClient_1 = require("./opcuaClient");
const index_1 = require("../../index");
const functionBlockMainController_1 = require("../function-block/functionBlockMainController");
const request_1 = require("../../utils/request");
const digitalTwinMainController_1 = require("../digital-twin/digitalTwinMainController");
class SmartComponentController {
    constructor(address, port, id, name, type, diac4Port) {
        this.initializer = {
            data: () => {
                return this.data;
            }
        };
        this.setConnected = () => {
            this.data.scState = 'connected';
            this.notifyClientScUpdated();
        };
        this.setDisconnected = () => {
            this.data.scState = 'disconnected';
            this.notifyClientScUpdated();
        };
        this.itemsToObserve = [
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.cpuFreqCurrent, 'cpuFreqCurrent'),
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.cpuFreqMax, 'cpuFreqMax'),
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.cpuFreqMin, 'cpuFreqMin'),
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.cpuPercentage, 'cpuPercent'),
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.memAvailable, 'memAvailable'),
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.memCached, 'memCached'),
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.memPercentage, 'memPercentage'),
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.memShared, 'memShared'),
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.memTotal, 'memTotal'),
            this.buildHWNotifier(opcuaClient_1.OPCUA_HW_MONITORING.memUsed, 'memUsed'),
        ];
        this.readMainValuesAndNotifyClient = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const type = yield this.opcuaController.readMainValue(opcuaClient_1.OPCUA_MONITORING_ITEM.scDeviceType);
                const name = yield this.opcuaController.readDeviceName();
                this.data.scType = type;
                this.data.scName = name;
                this.data.scState = 'connected';
                const diac4Port = yield this.opcuaController.readMainValue(opcuaClient_1.OPCUA_MONITORING_ITEM.diac4Port);
                this.data.diac4Port = diac4Port;
                this.notifyClientScUpdated();
            }
            catch (err) {
                console.error(err);
                console.error("Error reading main values");
            }
        });
        this.notifyClientScUpdated = () => {
            index_1.socketEngine.sendMessageToClient([SmartComponentController.BASE_NAME_SPACE, this.namespace], SmartComponentController.EDITED_SC_EVENT, { sc: this.data });
        };
        this.notifyClientFBIUpdated = () => {
            index_1.socketEngine.sendMessageToClient([SmartComponentController.BASE_NAME_SPACE, this.namespace], SmartComponentController.EDITED_FBI_EVENT, this.data.fbInstances);
        };
        this.notifyClientMonitoredVariableValueUpdated = () => {
            index_1.socketEngine.sendMessageToClient([SmartComponentController.BASE_NAME_SPACE, this.namespace], SmartComponentController.EDITED_MVI_EVENT, this.data.monitoredVariableInstances);
        };
        this.opcuaController = new opcuaClient_1.OpcUaClient(address, port);
        this.opcuaController.registerObserver(this);
        this.namespace = `${SmartComponentController.BASE_NAME_SPACE}/${id}`;
        this.data = {
            scAddress: address,
            scPort: port,
            scName: name !== null && name !== void 0 ? name : '',
            scType: type !== null && type !== void 0 ? type : '',
            scId: id,
            diac4Port: diac4Port,
        };
    }
    buildHWNotifier(item, key) {
        return {
            itemToObserve: item,
            notifyValueChanged: (item, value) => {
                this.data[`${key}`] = value;
                this.notifyClientScUpdated();
            }
        };
    }
    reconnectToOpcUa() {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.opcuaController.disconnect();
                yield this.opcuaController.connect(this.setConnected, this.setDisconnected);
                yield this.readMainValuesAndNotifyClient();
                yield this.readFunctionBlocksAndNotifyClient();
                yield this.readMonitoredVariablesAndNotifyClient();
                res();
            }
            catch (err) {
                console.error(err);
                rej();
            }
        }));
    }
    readFunctionBlocksAndNotifyClient() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const functionBlockInstances = yield this.opcuaController.getAllFunctionBlockInstances();
                const promisesFB = [];
                functionBlockInstances.forEach((element) => {
                    promisesFB.push(functionBlockMainController_1.functionBlockMainController.getFunctionBlocks(new request_1.RequestResponse(), [{ key: 'fbType', value: element.fbType }]));
                });
                const fbs = yield Promise.all(promisesFB);
                this.data.fbInstances = functionBlockInstances.map((element, index) => {
                    var _a;
                    const fb = (_a = fbs[index].result[0]) !== null && _a !== void 0 ? _a : undefined;
                    return {
                        id: element.id,
                        state: element.state[1],
                        fbCategory: fb === null || fb === void 0 ? void 0 : fb.fbCategoryName,
                        fbGeneralCategory: fb === null || fb === void 0 ? void 0 : fb.fbGeneralCategory,
                        fbType: element.fbType
                    };
                });
                //console.log("this.data.fbInstances", this.data.fbInstances)
                this.notifyClientFBIUpdated();
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    notifyFunctionBlockInstanceStateChanged(functionBlockInstanceId, value) {
        this.data.fbInstances = this.data.fbInstances.map((instance) => {
            if (instance.id === functionBlockInstanceId)
                instance.state = value[1];
            return instance;
        });
        this.notifyClientFBIUpdated();
    }
    notifyMonitoredVariablesCurrentValueChanged(fb, value, variable) {
        this.data.monitoredVariableInstances = this.data.monitoredVariableInstances.map((instance) => {
            if ((instance.id === fb) && (instance.monitoredVariableName === variable))
                instance.currentValue = value;
            return instance;
        });
        this.notifyClientMonitoredVariableValueUpdated();
    }
    readMVandNotify() {
        this.reconnectToOpcUa();
    }
    killSubsctiptions() {
        this.opcuaController.opcUaClient.disconnect();
    }
    //Lê a informação relativa à variável VALUE
    readMonitoredVariablesAndNotifyClient() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const monitoredVariables = (yield digitalTwinMainController_1.digitalTwinMainController.getMonitoredVariable(new request_1.RequestResponse())).getResult().map((monVar) => ({ idMonitoredVariable: monVar.idMonitoredVariable, monitoredVariableName: monVar.monitoredVariableName, scAssociated: monVar.scAssociated, fbAssociated: monVar.fbAssociated }));
                let dinasore = this.opcuaController.device;
                let i = 0;
                let monitoredVariablesName = [];
                let monitoredVariablesFb = [];
                let afterFilterMonFB = [];
                let afterFilterMonName = [];
                while (i < monitoredVariables.length) {
                    if (dinasore === monitoredVariables[i].scAssociated) {
                        monitoredVariablesName[i] = monitoredVariables[i].monitoredVariableName;
                        monitoredVariablesFb[i] = monitoredVariables[i].fbAssociated;
                    }
                    i++;
                }
                i = 0;
                for (const monVarName of monitoredVariablesName) {
                    if (monVarName) {
                        afterFilterMonName.push(monVarName);
                    }
                    i++;
                }
                i = 0;
                for (const monVarFb of monitoredVariablesFb) {
                    if (monVarFb) {
                        afterFilterMonFB.push(monVarFb);
                    }
                    i++;
                }
                const monitoredVariableValues = yield this.opcuaController.getAllMonitoredVariableInstances(afterFilterMonName, afterFilterMonFB, dinasore);
                const promisesMVI = [];
                monitoredVariableValues.forEach((element) => {
                    promisesMVI.push(digitalTwinMainController_1.digitalTwinMainController.getMonitoredVariable(new request_1.RequestResponse(), [{ key: 'monitoredVariableName', value: element.monitoredVariableName }]));
                });
                const mvis = yield Promise.all(promisesMVI);
                this.data.monitoredVariableInstances = monitoredVariableValues.map((element, index) => {
                    var _a;
                    const monVar = (_a = mvis[index].result[0]) !== null && _a !== void 0 ? _a : undefined;
                    return {
                        id: element.id,
                        currentValue: element.currentValue,
                        monitoredVariableName: element.monitoredVariableName,
                        sc: element.sc
                    };
                });
                this.notifyClientMonitoredVariableValueUpdated();
            }
            catch (err) {
                console.error(err);
            }
        });
    }
}
exports.SmartComponentController = SmartComponentController;
SmartComponentController.EDITED_SC_EVENT = 'smart-component-updated';
SmartComponentController.EDITED_FBI_EVENT = 'smart-component-fbi-updated';
SmartComponentController.BASE_NAME_SPACE = 'smart-component';
SmartComponentController.EDITED_MVI_EVENT = 'smart-component-mvi-updated';
SmartComponentController.buildSmartComponentController = (address, port, id, name, type) => {
    return new Promise((res, rej) => {
        const smartComponentController = new SmartComponentController(address, port, id, name, type);
        smartComponentController.opcuaController.connect(smartComponentController.setConnected, smartComponentController.setDisconnected)
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield smartComponentController.readMainValuesAndNotifyClient();
                yield smartComponentController.readFunctionBlocksAndNotifyClient();
                yield smartComponentController.readMonitoredVariablesAndNotifyClient();
                res(smartComponentController);
            }
            catch (err) {
                res(smartComponentController);
            }
        }))
            .catch(err => {
            console.error(err);
            res(smartComponentController);
        })
            .finally(() => {
            index_1.socketEngine.createNamespace(smartComponentController);
        });
    });
};
//# sourceMappingURL=SmartComponentController.js.map