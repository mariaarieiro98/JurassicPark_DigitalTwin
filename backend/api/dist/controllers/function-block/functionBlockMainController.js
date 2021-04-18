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
const model_2 = require("../../model");
const xml_js_1 = require("xml-js");
const path_1 = require("path");
const DEFAULT_FUNCTION_BLOCKS_FOLDER = `.${path_1.sep}public${path_1.sep}function-blocks`;
const DEFAULT_FUNCTION_BLOCKS_BACKUP_FOLDER = `.${path_1.sep}public${path_1.sep}function-blocks-backup`;
const DEFAULT_4DIAC_LIB_FOLDER = `.${path_1.sep}4diac-lib`;
class FunctionBlockMainController {
    constructor() {
        this.buildFunctionBlockFilePathAndFolder = (fbType, fbCategory) => {
            const folder = this.functionBlocksFolder + path_1.sep + fbCategory + path_1.sep + fbType;
            const tempFolder = this.functionBlocksBackupFolder + path_1.sep + fbCategory + path_1.sep + fbType;
            const _4diacFolder = this._4diacFolder + path_1.sep + fbCategory;
            const py = fbType + '.py';
            const fbt = fbType + '.fbt';
            const pyPath = folder + path_1.sep + py;
            const fbtPath = folder + path_1.sep + fbt;
            const pyTempPath = tempFolder + path_1.sep + py;
            const fbtTempPath = tempFolder + path_1.sep + fbt;
            const fbt4diacPath = _4diacFolder + path_1.sep + fbt;
            return { folder, tempFolder, py, fbt, pyPath, pyTempPath, fbtPath, fbtTempPath, _4diacFolder, fbt4diacPath };
        };
        this.processRawFunctionBlocks = (raw) => {
            const grouped = utils_1.groupBy(raw, 'fbId', ['fbUserId', 'fbFbcId', 'fbcName', 'fbGeneralCategory', 'fbType', 'fbDescription']);
            for (let i = 0; i < grouped.length; i++) {
                grouped[i].events = utils_1.groupBy(grouped[i].content, 'eventId', ['eventName', 'eventType', 'eventOpcua', 'eventInoutType']);
                grouped[i].events.forEach((element) => {
                    const eventVariables = utils_1.groupBy(grouped[i].content, 'evVariableId', ['evVariableId', 'evEventId', 'eventVariableName', 'evValid'])
                        .filter((eventVariable) => eventVariable.evEventId == element.eventId)
                        .map((eventVariableM) => ({ evEventId: eventVariableM.evEventId, evVariableId: eventVariableM.evVariableId, evEventName: eventVariableM.evEventName, evVariableName: eventVariableM.eventVariableName, evValid: eventVariableM.evValid }));
                    element.eventVariables = eventVariables;
                });
                const inEvents = grouped[i].events.filter((event) => event.eventInoutType === model_2.InOutType.in);
                const outEvents = grouped[i].events.filter((event) => event.eventInoutType === model_2.InOutType.out);
                grouped[i].fbInputEvents = inEvents.map((event) => (Object.assign(Object.assign({}, event), { content: null })));
                grouped[i].fbOutputEvents = outEvents.map((event) => (Object.assign(Object.assign({}, event), { content: null })));
                grouped[i].variables = utils_1.groupBy(grouped[i].content, 'variableId', ['variableName', 'variableOpcua', 'variableInoutType', 'variableDataType']);
                const inVariables = grouped[i].variables.filter((variable) => variable.variableInoutType === model_2.InOutType.in);
                const outVariables = grouped[i].variables.filter((variable) => variable.variableInoutType === model_2.InOutType.out);
                grouped[i].fbInputVariables = inVariables.map((variable) => (Object.assign(Object.assign({}, variable), { content: null })));
                grouped[i].fbOutputVariables = outVariables.map((variable) => (Object.assign(Object.assign({}, variable), { content: null })));
                grouped[i].externalDependencies = utils_1.groupBy(grouped[i].content, 'edId', ['edName', 'edVersion']).map((filteredEd) => ({ edId: filteredEd.edId, edName: filteredEd.edName, edVersion: filteredEd.edVersion }));
            }
            return grouped.map((fb) => ({
                fbId: parseInt(fb.fbId), fbType: fb.fbType, fbDescription: fb.fbDescription, fbFbcId: fb.fbFbcId, fbCategoryName: fb.fbcName,
                fbUserId: fb.fbUserId, fbGeneralCategory: fb.fbGeneralCategory, fbInputVariables: fb.fbInputVariables, fbOutputVariables: fb.fbOutputVariables,
                fbInputEvents: fb.fbInputEvents, fbOutputEvents: fb.fbOutputEvents, fbExternalDependencies: fb.externalDependencies
            }));
        };
        this.getFunctionBlocks = (response, filters) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    let query = `SELECT FB.*, 
                                FBC.fbcId, FBC.fbcName,
                                E.eventId,E.eventName,E.eventType,E.eventOpcua, E.eventInoutType, 
                                V.variableId,V.variableName,V.variableOpcua, V.variableInoutType, V.variableDataType,
                                EV.evEventId,EV.evVariableId, EV.evValid,
                                EVV.variableName as eventVariableName,
                                ED.edId, ED.edName, FBED.fbEdVersion as edVersion
                               FROM FunctionBlock as FB
                               JOIN FBCategory as FBC ON FBC.fbcId = FB.fbFbcId
                               LEFT JOIN Event as E ON E.eventFbId = FB.fbId
                               LEFT JOIN Variable as V ON V.variableFbId = FB.fbId
                               LEFT JOIN EventVariable as EV ON EV.evEventId = E.eventId
                               LEFT JOIN Variable as EVV ON EVV.variableId = EV.evVariableId
                               LEFT JOIN FunctionBlockExternalDependency as FBED ON FBED.fbedFbId = FB.fbId
                               LEFT JOIN ExternalDependency as ED ON ED.edId = FBED.fbedEdId `;
                    filters === null || filters === void 0 ? void 0 : filters.forEach((filter, index) => {
                        query += `${!index ? 'WHERE' : 'AND'} ${filter.key} = ? `;
                    });
                    const result = yield database_1.DatabaseUtils.executeStatement(query, (_a = filters === null || filters === void 0 ? void 0 : filters.map(f => f.value)) !== null && _a !== void 0 ? _a : []);
                    response.setResult(this.processRawFunctionBlocks(result.result));
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Getting Function Blocks', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.createFunctionBlock = (functionBlock, fbImplemenationFile, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                const validFunctionBlock = this.validateFunctionBlock(functionBlock);
                if (!validFunctionBlock.valid) {
                    response.setErrorState(validFunctionBlock.reason);
                    rej(response);
                    return;
                }
                try {
                    const stmtFunctionBlock = {
                        sql: 'INSERT INTO FunctionBlock(fbType,fbDescription,fbUserId,fbFbcId,fbGeneralCategory) VALUES(?,?,?,?,?)',
                        params: [functionBlock.fbType, functionBlock.fbDescription, functionBlock.fbUserId, functionBlock.fbFbcId, functionBlock.fbGeneralCategory],
                        type: database_1.Operation.insert,
                        insertTable: model_2.Tables.functionBlock
                    };
                    const { varsStmts, evsStmts, evVarsStmt, newEdsStmts, fbEdsStmt } = yield this.getFbEvsVarsEdStmts(functionBlock, database_1.Operation.insert);
                    const insertIds = yield database_1.DatabaseUtils.executeTransaction([stmtFunctionBlock, ...varsStmts, ...evsStmts, ...evVarsStmt, ...newEdsStmts, fbEdsStmt]);
                    yield this.saveFunctionBlockFiles(functionBlock, fbImplemenationFile);
                    response.setExtra({ lastInsertedId: insertIds.FunctionBlock });
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Creating Function Block', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.getFunctionBlockPathFiles = (functionBlock) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const queryResult = (yield database_1.DatabaseUtils.executeStatement('SELECT fbcName from FBCategory WHERE fbcId = ?', [functionBlock.fbFbcId])).result[0];
                    if (!queryResult)
                        rej('No category with this id');
                    else
                        res(this.buildFunctionBlockFilePathAndFolder(functionBlock.fbType, queryResult.fbcName));
                }
                catch (err) {
                    rej(err.toString());
                }
            }));
        };
        this.saveFunctionBlockFBTFile = (functionBlock, filePaths) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const fbFile = this.generateFBT(functionBlock);
                    res(yield Promise.all([utils_1.saveFile(filePaths.folder, filePaths.fbt, fbFile), utils_1.saveFile(filePaths._4diacFolder, filePaths.fbt, fbFile)]));
                }
                catch (err) {
                    rej(err.toString());
                }
            }));
        };
        this.saveFunctionBlockImplFile = (fileB64, filePaths) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    res(yield utils_1.saveFile(filePaths.folder, filePaths.py, utils_1.fromB64(fileB64)));
                }
                catch (err) {
                    rej(err.toString());
                }
            }));
        };
        this.saveFunctionBlockFiles = (functionBlock, fileB64, files) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const filePaths = files ? files : yield this.getFunctionBlockPathFiles(functionBlock);
                    const promisesArray = [this.saveFunctionBlockFBTFile(functionBlock, filePaths), this.saveFunctionBlockImplFile(fileB64, filePaths)];
                    const result = yield Promise.all(promisesArray);
                    res(result);
                }
                catch (err) {
                    console.error(err);
                    rej(err);
                }
            }));
        };
        this.generateFBT = (functionBlock) => {
            const buildElement = (name, elements, attributes, type = 'element', doctype) => ({ type, name, doctype, elements, attributes });
            const getEvents = (events) => events.map((event) => buildElement('Event', event.eventVariables.map((eventVariable) => buildElement('With', undefined, { Var: eventVariable.evVariableName })), { Name: event.eventName, Type: event.eventType, OpcUa: event.eventOpcua }));
            const getVariables = (variables) => variables.map((variable) => buildElement('VarDeclaration', undefined, { Name: variable.variableName, Type: variable.variableDataType, OpcUa: variable.variableOpcua }));
            const eventInputs = buildElement('EventInputs', getEvents(functionBlock.fbInputEvents));
            const eventOutputs = buildElement('EventOutputs', getEvents(functionBlock.fbOutputEvents));
            const variableInputs = buildElement('InputVars', getVariables(functionBlock.fbInputVariables));
            const variableOutputs = buildElement('OutputVars', getVariables(functionBlock.fbOutputVariables));
            const interfaceList = buildElement('InterfaceList', [eventInputs, eventOutputs, variableInputs, variableOutputs]);
            let functionBlockJS = {
                declaration: {
                    attributes: {
                        version: '1.0',
                        encoding: 'UTF-8',
                        standalone: 'no'
                    }
                },
                elements: [
                    buildElement(undefined, undefined, undefined, 'doctype', 'FBType SYSTEM "http://www.holobloc.com/xml/LibraryElement.dtd"'),
                    {
                        name: 'FBType',
                        attributes: {
                            Name: functionBlock.fbType,
                            OpcUa: functionBlock.fbGeneralCategory
                        },
                        type: 'element',
                        elements: [interfaceList]
                    }
                ]
            };
            return xml_js_1.js2xml(functionBlockJS, { spaces: 2 });
        };
        this.removeFunctionBlock = (id, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                let fbData;
                try {
                    const query = 'SELECT fbType, fbcName FROM FunctionBlock JOIN FBCategory ON FunctionBlock.fbFbcId = FBCategory.fbcId WHERE fbId = ?';
                    fbData = yield database_1.DatabaseUtils.executeStatement(query, [id]);
                    if (!fbData.result.length) {
                        response.setErrorState('No Function Block found');
                        rej(response);
                        return;
                    }
                }
                catch (err) {
                    console.error(err);
                    rej(err);
                }
                const files = this.buildFunctionBlockFilePathAndFolder(fbData.result[0].fbType, fbData.result[0].fbcName);
                try {
                    const stmt = 'DELETE FROM FunctionBlock WHERE fbId = ?';
                    yield database_1.DatabaseUtils.executeStatement(stmt, [id]);
                    res(response);
                }
                catch (err) {
                    console.error(err);
                    rej(err);
                }
                finally {
                    try {
                        yield Promise.all([utils_1.deleteFile(files.fbtPath), utils_1.deleteFile(files.pyPath), utils_1.deleteFile(files.fbt4diacPath)]);
                        yield utils_1.deleteDir(files.folder);
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }));
        };
        this.updateFunctionBlock = (id, functionBlock, response, fbImplemenationFile) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                const validFunctionBlock = this.validateFunctionBlock(functionBlock);
                if (!validFunctionBlock.valid) {
                    response.setErrorState(validFunctionBlock.reason);
                    rej(response);
                    return;
                }
                try {
                    const queryCurrentFBs = (yield this.getFunctionBlocks(new request_1.RequestResponse())).getResult().filter((fb) => fb.fbId === id);
                    if (!queryCurrentFBs.length) {
                        response.setErrorState('No function block found with that id');
                        rej(response);
                        return;
                    }
                    functionBlock.fbId = id;
                    const stmtFunctionBlock = {
                        sql: 'UPDATE FunctionBlock SET fbType = ?, fbDescription = ? ,fbUserId = ?, fbFbcId = ?, fbGeneralCategory = ? WHERE fbId = ?',
                        params: [functionBlock.fbType, functionBlock.fbDescription, functionBlock.fbUserId, functionBlock.fbFbcId, functionBlock.fbGeneralCategory, id],
                        type: database_1.Operation.update,
                    };
                    const stmtDeleteVariables = {
                        sql: 'DELETE FROM Variable WHERE variableFbId = ?',
                        params: [id],
                        type: database_1.Operation.delete,
                    };
                    const stmtDeleteEvents = {
                        sql: 'DELETE FROM Event WHERE eventFbId = ?',
                        params: [id],
                        type: database_1.Operation.delete,
                    };
                    const stmtDeleteFbEds = {
                        sql: 'DELETE FROM FunctionBlockExternalDependency WHERE fbedFbId = ?',
                        params: [id],
                        type: database_1.Operation.delete
                    };
                    const { varsStmts, evsStmts, evVarsStmt, newEdsStmts, fbEdsStmt } = yield this.getFbEvsVarsEdStmts(functionBlock, database_1.Operation.update);
                    yield database_1.DatabaseUtils.executeTransaction([stmtFunctionBlock, stmtDeleteVariables, stmtDeleteEvents, ...varsStmts, ...evsStmts, ...evVarsStmt, ...newEdsStmts, stmtDeleteFbEds, fbEdsStmt]);
                    const filePaths = yield this.getFunctionBlockPathFiles(functionBlock);
                    yield this.saveFunctionBlockFBTFile(functionBlock, filePaths);
                    if (fbImplemenationFile)
                        yield this.saveFunctionBlockImplFile(fbImplemenationFile, filePaths);
                    const oldFb = queryCurrentFBs[0];
                    if ((functionBlock.fbType !== oldFb.fbType) || (functionBlock.fbFbcId !== oldFb.fbFbcId)) {
                        const oldFilePaths = yield this.getFunctionBlockPathFiles(oldFb);
                        if (!fbImplemenationFile)
                            yield utils_1.createFileCopy(oldFilePaths.pyPath, filePaths.folder, filePaths.py);
                        yield Promise.all([utils_1.deleteFile(oldFilePaths.pyPath), utils_1.deleteFile(oldFilePaths.fbtPath), utils_1.deleteFile(oldFilePaths.fbt4diacPath)]);
                        yield utils_1.deleteDir(oldFilePaths.folder);
                    }
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Updating Function Block', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.getFbEvsVarsEdStmts = (functionBlock, type) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let existingDependencies = [];
                    const dependenciesNames = functionBlock.fbExternalDependencies.map((ed) => ed.edName);
                    if (functionBlock.fbExternalDependencies.length) {
                        const query = `SELECT * FROM ExternalDependency WHERE edName IN (?)`;
                        const queryResult = yield database_1.DatabaseUtils.executeStatement(query, [dependenciesNames]);
                        existingDependencies = queryResult.result;
                    }
                    let existingDependenciesNames = existingDependencies.map((ed) => ed.edName);
                    let newDependencies = functionBlock.fbExternalDependencies.filter((ed) => !existingDependenciesNames.includes(ed.edName));
                    const varsStmts = functionBlock.fbInputVariables.concat(functionBlock.fbOutputVariables).map((variable) => ({
                        sql: 'INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES(?,?,?,?,?)',
                        params: [variable.variableName, variable.variableOpcua, variable.variableInoutType, variable.variableDataType, functionBlock.fbId],
                        type: database_1.Operation.insert,
                        insertTable: model_2.Tables.variable,
                        lastInsertedId: type === database_1.Operation.insert
                            ? {
                                tables: [model_2.Tables.functionBlock],
                                indexes: [4]
                            }
                            : undefined
                    }));
                    const evsStmts = functionBlock.fbInputEvents.concat(functionBlock.fbOutputEvents).map((event) => ({
                        sql: 'INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES(?,?,?,?,?)',
                        params: [event.eventName, event.eventType, event.eventOpcua, event.eventInoutType, functionBlock.fbId],
                        type: database_1.Operation.insert,
                        insertTable: model_2.Tables.event,
                        lastInsertedId: type === database_1.Operation.insert
                            ? {
                                tables: [model_2.Tables.functionBlock],
                                indexes: [4]
                            }
                            : undefined
                    }));
                    const evVarsStmt = functionBlock.fbInputEvents
                        .concat(functionBlock.fbOutputEvents)
                        .reduce((acc, ev) => acc.concat(ev.eventVariables), [])
                        .map((evar) => ({
                        sql: `INSERT INTO EventVariable(evEventId,evVariableId) 
                                SELECT Event.eventId,Variable.variableId 
                                FROM Event,Variable 
                                WHERE Event.eventName = ? and Variable.variableName = ? and Event.eventFbId = ? AND Variable.variableFbId = ?`,
                        params: [evar.evEventName, evar.evVariableName, functionBlock.fbFbcId, functionBlock.fbId],
                        type: database_1.Operation.insert,
                        lastInsertedId: type === database_1.Operation.insert
                            ? {
                                tables: [model_2.Tables.functionBlock, model_2.Tables.functionBlock],
                                indexes: [2, 3]
                            }
                            : undefined
                    }));
                    const newEdsStmts = newDependencies.map((ed) => ({
                        sql: 'INSERT INTO ExternalDependency(edName) VALUES(?)',
                        params: [ed.edName],
                        type: database_1.Operation.insert
                    }));
                    const fbEdsStmt = {
                        sql: `INSERT INTO FunctionBlockExternalDependency(fbedEdId,fbedFbId) 
                            SELECT edId, ? 
                            FROM ExternalDependency 
                            WHERE BINARY edName IN (?)`,
                        params: [functionBlock.fbId, dependenciesNames.length ? dependenciesNames : ['']],
                        type: database_1.Operation.insert,
                        lastInsertedId: type === database_1.Operation.insert
                            ? {
                                tables: [model_2.Tables.functionBlock],
                                indexes: [0]
                            }
                            : undefined
                    };
                    res({ varsStmts, evsStmts, evVarsStmt, newEdsStmts, fbEdsStmt });
                }
                catch (err) {
                    rej(err.toString());
                }
            }));
        };
        this.getFunctionBlockCategories = (response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const ctgQuery = 'SELECT * FROM FBCategory';
                    const result = yield database_1.DatabaseUtils.executeStatement(ctgQuery);
                    const functionBlocks = (yield this.getFunctionBlocks(new request_1.RequestResponse())).getResult().map((fb) => ({ fbType: fb.fbType, fbFbcId: fb.fbFbcId }));
                    const categories = result.result;
                    for (let i = 0; i < categories.length; i++) {
                        const category = categories[i];
                        category.functionBlocks = [];
                        const inserted = [];
                        for (let j = 0; j < functionBlocks.length; j++) {
                            const fb = functionBlocks[j];
                            if (category.fbcId === fb.fbFbcId) {
                                category.functionBlocks.push(fb.fbType);
                                inserted.push(j);
                            }
                        }
                        for (let k = 0; k < inserted.length; k++) {
                            functionBlocks.splice(inserted[k] - k, 1);
                        }
                    }
                    response.setResult(categories);
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Getting FB Categories', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.createFunctionBlockCategory = (categoryName, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const insertCategoryStmt = 'Insert INTO FBCategory(fbcName,fbcUserId) VALUES(?,?)';
                    const result = yield database_1.DatabaseUtils.executeStatement(insertCategoryStmt, [categoryName, 1]);
                    response.setExtra({ lastInsertedId: result.result.insertId });
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Creating FB Category', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.removeFunctionBlockCategory = (id, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const oldFbCategory = (yield database_1.DatabaseUtils.executeStatement('SELECT fbcName FROM FBCategory WHERE fbcId = ?', [id])).result[0];
                    if (!oldFbCategory) {
                        response.setErrorState('No category found');
                        rej(response);
                        return;
                    }
                    const deleteCategoryStmt = 'DELETE FROM FBCategory WHERE fbcId = ?';
                    yield database_1.DatabaseUtils.executeStatement(deleteCategoryStmt, [id]);
                    const oldCatFolder = this.functionBlocksFolder + path_1.sep + oldFbCategory.fbcName;
                    const oldCatFolder4Diac = this._4diacFolder + path_1.sep + oldFbCategory.fbcName;
                    yield utils_1.deleteDir(oldCatFolder);
                    yield utils_1.deleteDir(oldCatFolder4Diac);
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Deleting FB Category', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        this.editFunctionBlockCategory = (id, name, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                try {
                    const oldFbCategory = (yield database_1.DatabaseUtils.executeStatement('SELECT fbcName FROM FBCategory WHERE fbcId = ?', [id])).result[0];
                    if (!oldFbCategory) {
                        response.setErrorState('No category found');
                        rej(response);
                        return;
                    }
                    if (oldFbCategory.fbcName === name) {
                        res(response);
                        return;
                    }
                    const updateCategoryStmt = 'UPDATE FBCategory SET fbcName = ? WHERE fbcId = ?';
                    yield database_1.DatabaseUtils.executeStatement(updateCategoryStmt, [name, id]);
                    const oldCatFolder = this.functionBlocksFolder + path_1.sep + oldFbCategory.fbcName;
                    const oldCatFolder4Diac = this._4diacFolder + path_1.sep + oldFbCategory.fbcName;
                    const oldCatFolderStat = yield utils_1.getFileStats(oldCatFolder);
                    const oldCatFolder4DiacStat = yield utils_1.getFileStats(oldCatFolder4Diac);
                    if (oldCatFolderStat.exists && ((_a = oldCatFolderStat.stats) === null || _a === void 0 ? void 0 : _a.isDirectory())) {
                        const newCatFolder = this.functionBlocksFolder + path_1.sep + name;
                        yield utils_1.renameFileOrFolder(oldCatFolder, newCatFolder);
                    }
                    if (oldCatFolder4DiacStat.exists && ((_b = oldCatFolderStat.stats) === null || _b === void 0 ? void 0 : _b.isDirectory())) {
                        const newCatFolder4Diac = this._4diacFolder + path_1.sep + name;
                        yield utils_1.renameFileOrFolder(oldCatFolder4Diac, newCatFolder4Diac);
                    }
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Updating FB Category', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        utils_1.readConf()
            .then((conf) => {
            this._4diacFolder = conf._4diacLib || DEFAULT_4DIAC_LIB_FOLDER;
            this.functionBlocksFolder = conf.functionBlocksFolder || DEFAULT_FUNCTION_BLOCKS_FOLDER;
            this.functionBlocksBackupFolder = conf.functionBlocksFolder || DEFAULT_FUNCTION_BLOCKS_BACKUP_FOLDER;
        })
            .catch(err => {
            this._4diacFolder = DEFAULT_4DIAC_LIB_FOLDER;
            this.functionBlocksFolder = DEFAULT_FUNCTION_BLOCKS_FOLDER;
            this.functionBlocksBackupFolder = DEFAULT_FUNCTION_BLOCKS_BACKUP_FOLDER;
        });
    }
    validateFunctionBlock(fb) {
        if (fb.fbType === '')
            return { valid: false, reason: 'Function Block Type not well Formed' };
        if (!fb.fbGeneralCategory)
            return { valid: false, reason: 'Function Block General Category not well Formed' };
        if (!fb.fbFbcId)
            return { valid: false, reason: 'Function Block Category not well Formed' };
        return { valid: true, reason: '' };
    }
}
exports.FunctionBlockMainController = FunctionBlockMainController;
exports.functionBlockMainController = new FunctionBlockMainController();
//# sourceMappingURL=functionBlockMainController.js.map