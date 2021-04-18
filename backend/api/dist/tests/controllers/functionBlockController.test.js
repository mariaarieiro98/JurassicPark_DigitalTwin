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
const functionBlockMainController_1 = require("../../controllers/function-block/functionBlockMainController");
const request_1 = require("../../utils/request");
const model_1 = require("../../model");
const database_1 = require("../../utils/database");
const child_process_1 = require("child_process");
beforeEach(() => {
    child_process_1.exec(`rm -rf ${functionBlockMainController_1.functionBlockMainController._4diacFolder} ${functionBlockMainController_1.functionBlockMainController.functionBlocksBackupFolder} ${functionBlockMainController_1.functionBlockMainController.functionBlocksFolder}`);
    return database_1.DatabaseUtils.executeStatement('DELETE FROM FunctionBlock', []);
});
afterEach(() => {
    child_process_1.exec(`rm -rf ${functionBlockMainController_1.functionBlockMainController._4diacFolder} ${functionBlockMainController_1.functionBlockMainController.functionBlocksBackupFolder} ${functionBlockMainController_1.functionBlockMainController.functionBlocksFolder}`);
    return database_1.DatabaseUtils.executeStatement('DELETE FROM FunctionBlock', []);
});
test('Delete Non Existing Function Block', () => {
    const response = new request_1.RequestResponse();
    return functionBlockMainController_1.functionBlockMainController.removeFunctionBlock(-1, response)
        .then((result) => { throw new Error('Deleted Function Block'); })
        .catch((error) => expect(error.getState().getMessage()).toBe('No Function Block found'));
});
test('Delete a Function Block', () => {
    const fb = {
        fbType: "SENSOR_SIMULATOR_3",
        fbDescription: "Simulate a Sensor_3",
        fbGeneralCategory: model_1.FBGeneralCategory.sensor,
        fbFbcId: 1,
        fbUserId: 1,
        fbInputVariables: [
            {
                variableName: "OFFSET",
                variableOpcua: "Constant",
                variableInoutType: model_1.InOutType.in,
                variableDataType: model_1.DataType.dtInt
            }
        ],
        fbOutputVariables: [
            {
                variableName: "VALUE",
                variableOpcua: "Variable",
                variableInoutType: model_1.InOutType.out,
                variableDataType: model_1.DataType.dtReal
            }
        ],
        fbInputEvents: [
            {
                eventName: "INIT",
                eventType: "Event",
                eventInoutType: model_1.InOutType.in,
                eventVariables: []
            },
            {
                eventName: "READ",
                eventType: "Event",
                eventInoutType: model_1.InOutType.in,
                eventVariables: []
            }
        ],
        fbOutputEvents: [
            {
                eventName: "INIT_O",
                eventType: "Event",
                eventInoutType: model_1.InOutType.out,
                eventVariables: []
            },
            {
                eventName: "READ_O",
                eventType: "Event",
                eventInoutType: model_1.InOutType.out,
                eventVariables: [
                    {
                        evEventName: "READ_O",
                        evVariableName: "VALUE"
                    }
                ]
            }
        ],
        fbExternalDependencies: []
    };
    return functionBlockMainController_1.functionBlockMainController.createFunctionBlock(fb, 'Implementation file test', new request_1.RequestResponse())
        .then((res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = (yield database_1.DatabaseUtils.executeStatement('SELECT fbId FROM FunctionBlock WHERE fbType = ?', [fb.fbType])).result[0].fbId;
        return functionBlockMainController_1.functionBlockMainController.removeFunctionBlock(id, new request_1.RequestResponse())
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            const totalWithId = (yield database_1.DatabaseUtils.executeStatement('SELECT Count(*) as total FROM FunctionBlock WHERE fbId = ?', [id])).result[0].total;
            const totalEventsWithId = (yield database_1.DatabaseUtils.executeStatement('SELECT Count(*) as total FROM Event WHERE eventfbId = ?', [id])).result[0].total;
            const totalVariablesWithId = (yield database_1.DatabaseUtils.executeStatement('SELECT Count(*) as total FROM Variable WHERE variablefbId = ?', [id])).result[0].total;
            expect(totalWithId).toBe(0);
            expect(totalEventsWithId).toBe(0);
            expect(totalVariablesWithId).toBe(0);
        }))
            .catch((error) => {
            console.error(error.getState().getMessage());
            throw new Error(error.getState().getMessage());
        });
    }))
        .catch((error) => {
        throw new Error(error);
    });
});
//# sourceMappingURL=functionBlockController.test.js.map