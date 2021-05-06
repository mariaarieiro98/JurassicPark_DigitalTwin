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
const database_1 = require("../../utils/database");
const request_1 = require("../../utils/request");
const model_1 = require("../../model");
const utils_1 = require("../../utils/utils");
class DigitalTwinMainController {
    constructor() {
        this.processRawFunctionalities = (raw) => {
            const grouped = utils_1.groupBy(raw, 'funcId', ['funcUserId', 'funcdtId', 'dtName', 'funcName']);
            return grouped.map((func) => ({
                funcId: parseInt(func.funcId), funcName: func.funcName, funcdtId: func.funcdtId, dtName: func.dtName,
                funcUserId: func.funcUserId,
            }));
        };
        this.processRawMonitoredVariables = (raw) => {
            const grouped = utils_1.groupBy(raw, 'idMonitoredVariable', ['fbAssociated', 'monitoredVariableName', 'funcIdAssociated', 'scAssociated', 'funcName']);
            return grouped.map((monoVar) => ({
                idMonitoredVariable: parseInt(monoVar.idMonitoredVariable), monitoredVariableName: monoVar.monitoredVariableName, funcIdAssociated: monoVar.funcIdAssociated, funcName: monoVar.funcName,
                fbAssociated: monoVar.fbAssociated, scAssociated: monoVar.scAssociated
            }));
        };
        this.processRawMonitoredEvents = (raw) => {
            const grouped = utils_1.groupBy(raw, 'idMonitoredEvent', ['fbAssociated', 'monitoredEventName', 'funcIdAssociated', 'scAssociated', 'funcName']);
            return grouped.map((monoEv) => ({
                idMonitoredVariable: parseInt(monoEv.idMonitoredEvent), monitoredEventName: monoEv.monitoredEventName, funcIdAssociated: monoEv.funcIdAssociated, funcName: monoEv.funcName,
                fbAssociated: monoEv.fbAssociated, scAssociated: monoEv.scAssociated
            }));
        };
        this.getAssociatedSmartComponent = (response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const scQuery = 'SELECT * FROM AssociatedSmartComponent';
                    const result = yield database_1.DatabaseUtils.executeStatement(scQuery);
                    const smartComponents = result.result;
                    response.setResult(smartComponents);
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Getting AssociatedSmartComponents', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.createAssociatedSmartComponent = (associatedSmartComponent, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const stmtAssociatedSmartComponent = {
                        sql: 'Insert INTO AssociatedSmartComponent(scName,associatedScUserId,scDtId) VALUES(?,?,?)',
                        params: [associatedSmartComponent.scName, associatedSmartComponent.associatedScUserId, associatedSmartComponent.scDtId],
                        type: database_1.Operation.insert,
                        insertTable: model_1.Tables.associatedSmartComponent
                    };
                    const insertIds = yield database_1.DatabaseUtils.executeTransaction([stmtAssociatedSmartComponent]);
                    response.setExtra({ lastInsertedId: insertIds.AssociatedSmartComponent });
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Creating Associated Smart Component', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.getFunctionality = (response, filters) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    let query = `SELECT FUNC.*, 
                                DT.dtId, DT.dtName
                               FROM Functionality as FUNC
                               JOIN DigitalTwin as DT ON DT.dtId = FUNC.funcdtId`;
                    filters === null || filters === void 0 ? void 0 : filters.forEach((filter, index) => {
                        query += `${!index ? 'WHERE' : 'AND'} ${filter.key} = ? `;
                    });
                    const result = yield database_1.DatabaseUtils.executeStatement(query, (_a = filters === null || filters === void 0 ? void 0 : filters.map(f => f.value)) !== null && _a !== void 0 ? _a : []);
                    response.setResult(this.processRawFunctionalities(result.result));
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Getting Functionalities', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.createFunctionality = (functionality, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const stmtFunctionality = {
                        sql: 'Insert INTO Functionality(funcName,funcUserId,funcdtId) VALUES(?,?,?)',
                        params: [functionality.funcName, functionality.funcUserId, functionality.funcdtId],
                        type: database_1.Operation.insert,
                        insertTable: model_1.Tables.functionality
                    };
                    const insertIds = yield database_1.DatabaseUtils.executeTransaction([stmtFunctionality]);
                    response.setExtra({ lastInsertedId: insertIds.Functionality });
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Creating Functionality', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.removeFunctionality = (id, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                let funcData;
                try {
                    const query = 'SELECT funcName, dtName FROM Functionality JOIN DigitalTwin ON Functionality.funcdtId = DigitalTwin.dtId WHERE funcId = ?';
                    funcData = yield database_1.DatabaseUtils.executeStatement(query, [id]);
                    if (!funcData.result.length) {
                        response.setErrorState('No Functionality found');
                        rej(response);
                        return;
                    }
                }
                catch (err) {
                    console.error(err);
                    rej(err);
                }
                try {
                    const stmt = 'DELETE FROM Functionality WHERE funcId = ?';
                    yield database_1.DatabaseUtils.executeStatement(stmt, [id]);
                    res(response);
                }
                catch (err) {
                    console.error(err);
                    rej(err);
                }
            }));
        };
        this.editFunctionality = (id, functionality, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const oldFunctionality = (yield database_1.DatabaseUtils.executeStatement('SELECT funcName FROM Functionality WHERE funcId = ?', [id])).result[0];
                    if (!oldFunctionality) {
                        response.setErrorState('No functionality found');
                        rej(response);
                        return;
                    }
                    if (oldFunctionality.funcName === functionality.funcName) {
                        res(response);
                        return;
                    }
                    const updateFunctionalityStmt = 'UPDATE Functionality SET funcName = ? WHERE funcId = ?';
                    yield database_1.DatabaseUtils.executeStatement(updateFunctionalityStmt, [functionality.funcName, id]);
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Updating Functionality', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.getDigitalTwins = (response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const dtQuery = 'SELECT * FROM DigitalTwin';
                    const result = yield database_1.DatabaseUtils.executeStatement(dtQuery);
                    const functionalities = (yield this.getFunctionality(new request_1.RequestResponse())).getResult().map((func) => ({ funcName: func.funcName, funcdtId: func.funcdtId }));
                    const associatedSmartComponents = (yield this.getAssociatedSmartComponent(new request_1.RequestResponse())).getResult().map((assSc) => ({ scName: assSc.scName, scDtId: assSc.scDtId }));
                    const digitalTwins = result.result;
                    for (let i = 0; i < digitalTwins.length; i++) {
                        const digitalTwin = digitalTwins[i];
                        digitalTwin.functionalities = [];
                        const inserted = [];
                        for (let j = 0; j < functionalities.length; j++) {
                            const func = functionalities[j];
                            if (digitalTwin.dtId === func.funcdtId) {
                                digitalTwin.functionalities.push(func.funcName);
                                inserted.push(j);
                            }
                        }
                        for (let k = 0; k < inserted.length; k++) {
                            functionalities.splice(inserted[k] - k, 1);
                        }
                    }
                    for (let i = 0; i < digitalTwins.length; i++) {
                        const digitalTwin = digitalTwins[i];
                        digitalTwin.associatedSmartComponents = [];
                        const inserted = [];
                        for (let j = 0; j < associatedSmartComponents.length; j++) {
                            const assSc = associatedSmartComponents[j];
                            if (digitalTwin.dtId === assSc.scDtId) {
                                digitalTwin.associatedSmartComponents.push(assSc.scName);
                                inserted.push(j);
                            }
                        }
                        for (let k = 0; k < inserted.length; k++) {
                            associatedSmartComponents.splice(inserted[k] - k, 1);
                        }
                    }
                    response.setResult(digitalTwins);
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Getting Digital Twins', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.createDigitalTwin = (dtName, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const insertDigitalTwin = 'Insert INTO DigitalTwin(dtName, dtUserId) VALUES(?,?)';
                    const result = yield database_1.DatabaseUtils.executeStatement(insertDigitalTwin, [dtName, 1]);
                    response.setExtra({ lastInsertedId: result.result.insertId });
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Creating Digital Twin', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.removeDigitalTwin = (id, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const oldDigitalTwin = (yield database_1.DatabaseUtils.executeStatement('SELECT dtName FROM DigitalTwin WHERE dtId = ?', [id])).result[0];
                    if (!oldDigitalTwin) {
                        response.setErrorState('No digital-twin found');
                        rej(response);
                        return;
                    }
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Deleting Digital Twin', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.editDigitalTwin = (id, name, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const oldDigitalTwin = (yield database_1.DatabaseUtils.executeStatement('SELECT dtName FROM DigitalTwin WHERE dtId = ?', [id])).result[0];
                    if (!oldDigitalTwin) {
                        response.setErrorState('No digital-twin found');
                        rej(response);
                        return;
                    }
                    if (oldDigitalTwin.dtName === name) {
                        res(response);
                        return;
                    }
                    const updateDigitalTwinStmt = 'UPDATE DigitalTwin SET dtName = ? WHERE dtId = ?';
                    yield database_1.DatabaseUtils.executeStatement(updateDigitalTwinStmt, [name, id]);
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Updating Digital Twin', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.getMonitoredVariable = (response, filters) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    let query = `SELECT MONVAR.*, 
                                FUNC.funcId, FUNC.funcName
                               FROM MonitoredVariable as MONVAR
                               JOIN Functionality as FUNC ON FUNC.funcId = MONVAR.funcIdAssociated `;
                    filters === null || filters === void 0 ? void 0 : filters.forEach((filter, index) => {
                        query += `${!index ? 'WHERE' : 'AND'} ${filter.key} = ? `;
                    });
                    const result = yield database_1.DatabaseUtils.executeStatement(query, (_a = filters === null || filters === void 0 ? void 0 : filters.map(f => f.value)) !== null && _a !== void 0 ? _a : []);
                    response.setResult(this.processRawMonitoredVariables(result.result));
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Getting Monitored Variables', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.removeMonitoredVariable = (id, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log("id:", id);
                    const oldMonitoredVariable = (yield database_1.DatabaseUtils.executeStatement('SELECT monitoredVariableName FROM MonitoredVariable WHERE idMonitoredVariable = ?', [id])).result[0];
                    if (!oldMonitoredVariable) {
                        response.setErrorState('No monitored-variable found');
                        rej(response);
                        return;
                    }
                    const deleteMonitoredVariableStmt = 'DELETE FROM MonitoredVariable WHERE idMonitoredVariable = ?';
                    yield database_1.DatabaseUtils.executeStatement(deleteMonitoredVariableStmt, [id]);
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Deleting Monitored Variable', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.createMonitoredVariable = (monitoredVariable, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const stmtMonitoredVariable = {
                        sql: 'Insert INTO MonitoredVariable(funcIdAssociated,fbAssociated,monitoredVariableName, scAssociated) VALUES(?,?,?,?)',
                        params: [monitoredVariable.funcIdAssociated, monitoredVariable.fbAssociated, monitoredVariable.monitoredVariableName, monitoredVariable.scAssociated],
                        type: database_1.Operation.insert,
                        insertTable: model_1.Tables.monitoredVariable
                    };
                    const insertIds = yield database_1.DatabaseUtils.executeTransaction([stmtMonitoredVariable]);
                    response.setExtra({ lastInsertedId: insertIds.MonitoredVariable });
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Creating MonitoredVariable', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.getMonitoredEvent = (response, filters) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    let query = `SELECT MONEV.*, 
                                FUNC.funcId, FUNC.funcName
                               FROM MonitoredEvent as MONEV
                               JOIN Functionality as FUNC ON FUNC.funcId = MONEV.funcIdAssociated`;
                    filters === null || filters === void 0 ? void 0 : filters.forEach((filter, index) => {
                        query += `${!index ? 'WHERE' : 'AND'} ${filter.key} = ? `;
                    });
                    const result = yield database_1.DatabaseUtils.executeStatement(query, (_a = filters === null || filters === void 0 ? void 0 : filters.map(f => f.value)) !== null && _a !== void 0 ? _a : []);
                    response.setResult(this.processRawMonitoredEvents(result.result));
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Getting Monitored Events', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.createMonitoredEvent = (monitoredEvent, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const stmtMonitoredEvent = {
                        sql: 'Insert INTO MonitoredEvent(funcIdAssociated,fbAssociated,monitoredEventName, scAssociated) VALUES(?,?,?,?)',
                        params: [monitoredEvent.funcIdAssociated, monitoredEvent.fbAssociated, monitoredEvent.monitoredEventName, monitoredEvent.scAssociated],
                        type: database_1.Operation.insert,
                        insertTable: model_1.Tables.monitoredEvent
                    };
                    const insertIds = yield database_1.DatabaseUtils.executeTransaction([stmtMonitoredEvent]);
                    response.setExtra({ lastInsertedId: insertIds.MonitoredEvent });
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Creating MonitoredEvent', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.createVariableToMonitor = (monitoredVariable, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const insertVariableToMonitor = 'Insert INTO VariableToMonitor(variableName) VALUES(?)';
                    const result = yield database_1.DatabaseUtils.executeStatement(insertVariableToMonitor, [monitoredVariable]);
                    response.setExtra({ lastInsertedId: result.result.insertId });
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Creating VariableToMonitor', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
    }
    validateFunctionality(func) {
        if (func.funcName === '')
            return { valid: false, reason: 'Functionality Name not well Formed' };
        if (!func.funcdtId)
            return { valid: false, reason: 'Digital Twin associated not well Formed' };
        return { valid: true, reason: '' };
    }
}
exports.DigitalTwinMainController = DigitalTwinMainController;
exports.digitalTwinMainController = new DigitalTwinMainController();
//# sourceMappingURL=digitalTwinMainController.js.map