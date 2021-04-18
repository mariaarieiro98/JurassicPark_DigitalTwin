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
const model_1 = require("../../model");
const utils_1 = require("../../utils/utils");
class AssociatedSmartComponentMainController {
    constructor() {
        this.processRawAssociatedSmartComponents = (raw) => {
            const grouped = utils_1.groupBy(raw, 'idAssociateSmartComponent', ['scFuncId', 'scName']);
            return grouped.map((associatedSc) => ({
                idAssociateSmartComponent: parseInt(associatedSc.idAssociateSmartComponent), scFuncId: associatedSc.scFuncId, scName: associatedSc.scName
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
        this.createAssociatedSmartComponent = (scName, scDtId, response) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log(scName);
                    const insertSmartComponent = 'Insert INTO AssociatedSmartComponent(scName, scDtId, associatedScUserId) VALUES(?,?,?)';
                    const result = yield database_1.DatabaseUtils.executeStatement(insertSmartComponent, [scName, scDtId, 1]);
                    response.setExtra({ lastInsertedId: result.result.insertId });
                    res(response);
                }
                catch (error) {
                    console.error(error);
                    response.setErrorState('Error Creating Associated Smart Component', model_1.GeneralErrors.general.code);
                    rej(response);
                }
            }));
        };
        // public removeDigitalTwin = (id: number, response: RequestResponse) : Promise<RequestResponse> => {
        //     return new Promise(async (res: Function, rej: Function) => {
        //         try {
        //             const oldDigitalTwin = (await DatabaseUtils.executeStatement('SELECT dtName FROM DigitalTwin WHERE dtId = ?', [id])).result[0]
        //             if(!oldDigitalTwin) {
        //                 response.setErrorState('No digital-twin found')
        //                 rej(response)
        //                 return
        //             }
        //         }
        //         catch(error) {
        //             console.error(error)
        //             response.setErrorState('Error Deleting Digital Twin',GeneralErrors.general.code)
        //             rej(response)
        //         }
        //     })
        // }
        // public editDigitalTwin = (id: number, name:string, response: RequestResponse) : Promise<RequestResponse> => {
        //     return new Promise(async (res: Function, rej: Function) => {
        //         try {
        //             const oldDigitalTwin= (await DatabaseUtils.executeStatement('SELECT dtName FROM DigitalTwin WHERE dtId = ?', [id])).result[0]
        //             if(!oldDigitalTwin) {
        //                 response.setErrorState('No digital-twin found')
        //                 rej(response)
        //                 return
        //             }
        //             if(oldDigitalTwin.dtName === name) {
        //                 res(response)
        //                 return
        //             }
        //             const updateDigitalTwinStmt : string = 'UPDATE DigitalTwin SET dtName = ? WHERE dtId = ?'
        //             await DatabaseUtils.executeStatement(updateDigitalTwinStmt, [name,id])
        //             res(response)
        //         }
        //         catch(error) {
        //             console.error(error)
        //             response.setErrorState('Error Updating Digital Twin',GeneralErrors.general.code)
        //             rej(response)
        //         }
        //     })
        // }
    }
}
exports.AssociatedSmartComponentMainController = AssociatedSmartComponentMainController;
exports.associatedSmartComponentMainController = new AssociatedSmartComponentMainController();
//# sourceMappingURL=AssociatedSmartComponentMainController.js.map