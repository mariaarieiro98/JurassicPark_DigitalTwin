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
const node_opcua_1 = require("node-opcua");
var OPCUA_MONITORING_ITEM;
(function (OPCUA_MONITORING_ITEM) {
    OPCUA_MONITORING_ITEM["scName"] = "SMART_OBJECT_NAME";
    OPCUA_MONITORING_ITEM["scDeviceType"] = "DEVICE_TYPE";
    OPCUA_MONITORING_ITEM["state"] = "STATE";
    OPCUA_MONITORING_ITEM["hwMonitoring"] = "HardwareMonitoring";
})(OPCUA_MONITORING_ITEM = exports.OPCUA_MONITORING_ITEM || (exports.OPCUA_MONITORING_ITEM = {}));
var OPCUA_HW_MONITORING;
(function (OPCUA_HW_MONITORING) {
    OPCUA_HW_MONITORING["cpuFreqCurrent"] = "CPU_FREQ_CURRENT";
    OPCUA_HW_MONITORING["cpuFreqMax"] = "CPU_FREQ_MAX";
    OPCUA_HW_MONITORING["cpuFreqMin"] = "CPU_FREQ_MIN";
    OPCUA_HW_MONITORING["cpuPercentage"] = "CPU_PERCENT";
    OPCUA_HW_MONITORING["memAvailable"] = "MEM_AVAILABLE";
    OPCUA_HW_MONITORING["memCached"] = "MEM_CACHED";
    OPCUA_HW_MONITORING["memPercentage"] = "MEM_PERCENTAGE";
    OPCUA_HW_MONITORING["memShared"] = "MEM_SHARED";
    OPCUA_HW_MONITORING["memTotal"] = "MEM_TOTAL";
    OPCUA_HW_MONITORING["memUsed"] = "MEM_USED";
})(OPCUA_HW_MONITORING = exports.OPCUA_HW_MONITORING || (exports.OPCUA_HW_MONITORING = {}));
var FUNCTION_BLOCK_FOLDERS;
(function (FUNCTION_BLOCK_FOLDERS) {
    FUNCTION_BLOCK_FOLDERS["SENSORS"] = "DeviceSet";
    FUNCTION_BLOCK_FOLDERS["INTERFACE"] = "PointSet";
    FUNCTION_BLOCK_FOLDERS["SERVICES"] = "ServiceInstanceSet";
})(FUNCTION_BLOCK_FOLDERS = exports.FUNCTION_BLOCK_FOLDERS || (exports.FUNCTION_BLOCK_FOLDERS = {}));
var DEVICE_SET_FOLDERS;
(function (DEVICE_SET_FOLDERS) {
    DEVICE_SET_FOLDERS["VARIABLES"] = "Variables";
})(DEVICE_SET_FOLDERS = exports.DEVICE_SET_FOLDERS || (exports.DEVICE_SET_FOLDERS = {}));
exports.HARDWARE_MONITORING_FOLDER = 'HardwareMonitoring';
class OpcUaClient {
    constructor(address, port) {
        this.observers = [];
        this.connected = false;
        this.device = '';
        this.monitoredItems = {};
        this.monitoredFunctionBlockInstances = {};
        this.buildNodeId = (item) => `${OpcUaClient.NAME_SPACE};s=${this.device}.${item}`;
        this.buildHardWareMonitoringNodeId = (item) => `${OpcUaClient.NAME_SPACE};s=${this.device}:${exports.HARDWARE_MONITORING_FOLDER}:${item}`;
        this.readDeviceName = () => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    this.device = (yield this.opcuaSession.read({ nodeId: OpcUaClient.NODE_ID, attributeId: node_opcua_1.AttributeIds.DisplayName })).value.value.text;
                    res(this.device);
                }
                catch (err) {
                    console.error(err);
                    rej(err.toString());
                }
            }));
        };
        this.readMainValue = (item) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield this.opcuaSession.readVariableValue(this.buildNodeId(item));
                    res(result.value.value);
                }
                catch (err) {
                    console.error(err);
                    rej(err.toString());
                }
            }));
        };
        this.endPoint = `opc.tcp://${address}:${port}`;
        this.opcUaClient = node_opcua_1.OPCUAClient.create(OpcUaClient.clientOptions);
    }
    registerObserver(observer) {
        observer.observerId = OpcUaClient.observerCount++;
        this.observers.push(observer);
    }
    removeObserver(observer) {
        this.observers = this.observers.filter((cObserver) => observer.observerId !== cObserver.observerId);
    }
    connect(onConnect, onConnectionLost) {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            this.opcUaClient.on('connected', () => {
                onConnect();
            });
            this.opcUaClient.on('connection_reestablished', () => {
                onConnect();
            });
            this.opcUaClient.on('connection_lost', () => {
                onConnectionLost();
            });
            this.opcUaClient.on('connection_failed', () => {
                console.log("connection failed");
                onConnectionLost();
            });
            try {
                if (!this.connected) {
                    yield this.opcUaClient.connect(this.endPoint);
                    this.connected = true;
                    this.opcuaSession = yield this.opcUaClient.createSession();
                    this.device = (yield this.opcuaSession.read({ nodeId: OpcUaClient.NODE_ID, attributeId: node_opcua_1.AttributeIds.DisplayName })).value.value.text;
                    this.subscription = node_opcua_1.ClientSubscription.create(this.opcuaSession, OpcUaClient.subscriptionOptions);
                    this.initializeMonitoredItems();
                }
                res(this.device);
            }
            catch (err) {
                console.error(err);
                rej(`could not connect to ${this.endPoint}`);
            }
        }));
    }
    disconnect() {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.connected) {
                    Object.values(this.monitoredItems).forEach((item) => {
                        item.removeAllListeners();
                    });
                    Object.values(this.monitoredFunctionBlockInstances).forEach((item) => {
                        item.removeAllListeners();
                    });
                    this.subscription.removeAllListeners();
                    this.opcuaSession.removeAllListeners();
                    this.opcUaClient.removeAllListeners();
                    yield this.subscription.terminate();
                    yield this.opcuaSession.close();
                    yield this.opcUaClient.disconnect();
                    this.connected = false;
                }
                res(true);
            }
            catch (err) {
                console.error(err);
                rej(false);
            }
        }));
    }
    initializeMonitoredItems() {
        this.addHwMonitorItem(OPCUA_HW_MONITORING.cpuFreqCurrent);
        this.addHwMonitorItem(OPCUA_HW_MONITORING.cpuFreqMax);
        this.addHwMonitorItem(OPCUA_HW_MONITORING.cpuFreqMin);
        this.addHwMonitorItem(OPCUA_HW_MONITORING.cpuPercentage);
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memAvailable);
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memCached);
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memPercentage);
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memShared);
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memTotal);
        this.addHwMonitorItem(OPCUA_HW_MONITORING.memUsed);
    }
    addHwMonitorItem(item) {
        const itemToMonitor = { nodeId: this.buildHardWareMonitoringNodeId(item) };
        this.monitoredItems[item] = node_opcua_1.ClientMonitoredItem.create(this.subscription, itemToMonitor, OpcUaClient.monitoringParametersOptions, node_opcua_1.TimestampsToReturn.Both);
        this.addMonitorItemObserver(item);
    }
    addFunctionBlockStateMonitorItem(fbInstanceId) {
        const itemToMonitor = { nodeId: `${OpcUaClient.NAME_SPACE};s=${fbInstanceId}:FBState` };
        this.monitoredFunctionBlockInstances[fbInstanceId] = node_opcua_1.ClientMonitoredItem.create(this.subscription, itemToMonitor, OpcUaClient.monitoringParametersOptions, node_opcua_1.TimestampsToReturn.Both);
        this.monitoredFunctionBlockInstances[fbInstanceId].on('changed', (dataValue) => {
            this.observers.forEach((observer) => {
                observer.notifyFunctionBlockInstanceStateChanged(fbInstanceId, dataValue.value.value);
            });
        });
    }
    addMonitorItemObserver(item) {
        const monitoredItem = this.monitoredItems[item];
        monitoredItem.on("changed", (dataValue) => {
            this.observers.forEach((observer) => {
                observer.itemsToObserve.forEach((itemToObserve) => {
                    if (itemToObserve.itemToObserve === item)
                        itemToObserve.notifyValueChanged(item, dataValue.value.value);
                });
            });
        });
    }
    getAllFunctionBlockInstances() {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sensors = yield this.getFunctionBlockInstances(FUNCTION_BLOCK_FOLDERS.SENSORS);
                const services = yield this.getFunctionBlockInstances(FUNCTION_BLOCK_FOLDERS.SERVICES);
                const interfaces = yield this.getFunctionBlockInstances(FUNCTION_BLOCK_FOLDERS.INTERFACE);
                res([...sensors, ...services, ...interfaces]);
            }
            catch (err) {
                console.error(err);
                rej(err);
            }
        }));
    }
    getFunctionBlockInstances(folder) {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                const deviceSetNodeId = `${OpcUaClient.NAME_SPACE};s=${this.device}:${folder}`;
                const browseResult = yield this.opcuaSession.browse(deviceSetNodeId);
                const result = [];
                for (const reference of browseResult.references) {
                    const id = reference.displayName.text;
                    const state = (yield this.opcuaSession.read({ nodeId: `${OpcUaClient.NAME_SPACE};s=${reference.browseName.name}:FBState` })).value.value;
                    const fbType = (yield this.opcuaSession.read({ nodeId: `${OpcUaClient.NAME_SPACE};s=${reference.browseName.name}.dID` })).value.value;
                    this.addFunctionBlockStateMonitorItem(reference.browseName.name);
                    result.push({ id, state, fbType });
                }
                res(result);
            }
            catch (err) {
                rej(err);
            }
        }));
    }
    getAllMonitoredVariableInstances() {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                const variables = yield this.getMonitoredVariableInstances(FUNCTION_BLOCK_FOLDERS.SENSORS);
                res([...variables]);
            }
            catch (err) {
                console.error(err);
                rej(err);
            }
        }));
    }
    //Lê a informação relativa à variável VALUE
    getMonitoredVariableInstances(folder) {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                const deviceSetNodeId = `${OpcUaClient.NAME_SPACE};s=${this.device}:${folder}`;
                const browseResult = yield this.opcuaSession.browse(deviceSetNodeId);
                const result = [];
                for (const reference of browseResult.references) {
                    const id = reference.displayName.text;
                    const currentValue = (yield this.opcuaSession.read({ nodeId: `${OpcUaClient.NAME_SPACE};s=${reference.browseName.name}:Variables:VALUE` })).value.value;
                    const monitoredVariableName = (yield this.opcuaSession.read({ nodeId: `${OpcUaClient.NAME_SPACE};s=${reference.browseName.name}:Variables:VALUE`, attributeId: node_opcua_1.AttributeIds.DisplayName })).value.value.text;
                    //this.addFunctionBlockStateMonitorItem(reference.browseName.name)
                    result.push({ id, currentValue, monitoredVariableName });
                }
                res(result);
            }
            catch (err) {
                rej(err);
            }
        }));
    }
}
exports.OpcUaClient = OpcUaClient;
OpcUaClient.observerCount = 0;
OpcUaClient.clientOptions = {
    connectionStrategy: {
        initialDelay: 1000,
        maxRetry: 1,
    },
    securityMode: node_opcua_1.MessageSecurityMode.None,
    securityPolicy: node_opcua_1.SecurityPolicy.None,
    endpointMustExist: false,
    keepSessionAlive: true,
};
OpcUaClient.subscriptionOptions = {
    requestedPublishingInterval: 5000,
    requestedLifetimeCount: 100,
    requestedMaxKeepAliveCount: 10,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 10
};
OpcUaClient.monitoringParametersOptions = { samplingInterval: 1000, discardOldest: true, queueSize: 10 };
OpcUaClient.NAME_SPACE = 'ns=2';
OpcUaClient.NODE_ID = `${OpcUaClient.NAME_SPACE};i=1`;
//# sourceMappingURL=opcuaClient.js.map