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
const request_1 = require("../../utils/request");
const SmartComponentController_1 = require("./SmartComponentController");
const utils_1 = require("../../utils/utils");
class SmartComponentMainController {
    constructor() {
        this.namespace = 'smart-component';
        this.smartComponentIndividualControllers = [];
        this.fetched = false;
        this.initializer = {
            data: () => this.getSmartObjectSData(new request_1.RequestResponse())
        };
        utils_1.getLinesOfFiles(SmartComponentMainController.RUNNING_SC_FILE)
            .then((runningSmartComponents) => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < runningSmartComponents.length; i++) {
                const runningSmartComponent = runningSmartComponents[i];
                const [address, port, lastName, lastType] = runningSmartComponent.split(';');
                yield this.createOrUpdateSmartObject(new request_1.RequestResponse(), address, parseInt(port), true, lastName, lastType);
            }
        }))
            .catch(error => console.error('Error reading running scs file', error));
    }
    getSmartObjectSData(response, filters) {
        const result = this.getSmartObjects(response, filters).getResult().map((sc) => sc.data);
        response.setResult(result);
        return response;
    }
    getSmartObjects(response, filters) {
        var _a;
        const finalResult = (_a = this.smartComponentIndividualControllers) === null || _a === void 0 ? void 0 : _a.filter((sc) => {
            let filtered = true;
            for (let i = 0; i < (filters === null || filters === void 0 ? void 0 : filters.length); i++) {
                let filter = filters[i];
                if (sc.data[filter.key] !== filter.value) {
                    filtered = false;
                    break;
                }
            }
            return filtered;
        });
        response.setResult(finalResult);
        return response;
    }
    createOrUpdateSmartObject(response, address, port, previousRunning = false, name, type) {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            try {
                let scController;
                let existingSCS = this.getSmartObjects(new request_1.RequestResponse(), [{ key: 'scAddress', value: address }, { key: 'scPort', value: port }]);
                if (existingSCS.getResult().length) {
                    scController = existingSCS.getResult()[0];
                    yield scController.reconnectToOpcUa();
                    response.setResult(`Smart Object ${scController.data.scName} updated`);
                    res(response);
                }
                else {
                    scController = yield SmartComponentController_1.SmartComponentController.buildSmartComponentController(address, port, SmartComponentMainController.id++, name, type);
                    this.smartComponentIndividualControllers.push(scController);
                    response.setResult('Smart Object Registered');
                    res(response);
                    if (!previousRunning)
                        yield utils_1.appendLineToFile(`${address};${port};${scController.data.scName};${scController.data.scType}`, SmartComponentMainController.RUNNING_SC_FILE);
                }
            }
            catch (err) {
                console.error('Error during creating or updating Smart Component');
                console.error(err);
                response.setErrorState(err);
                rej(response);
            }
        }));
    }
}
SmartComponentMainController.RUNNING_SC_FILE = './.running_sc.csv';
SmartComponentMainController.id = 1;
exports.smartComponentMainController = new SmartComponentMainController();
//# sourceMappingURL=smartComponentMainController.js.map