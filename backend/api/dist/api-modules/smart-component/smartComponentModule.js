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
const module_1 = require("../module");
const request_1 = require("../../utils/request");
const smartComponentMainController_1 = require("../../controllers/smart-component/smartComponentMainController");
const smartComponentModule = new module_1.ApiModule([]);
smartComponentModule.addNamespace('smart-component');
smartComponentModule.addRoute({
    path: /^\/smart-component\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.get('/smart-component', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = new request_1.RequestResponse();
                yield smartComponentMainController_1.smartComponentMainController.getSmartObjectSData(response);
                //console.log(response)
                res.json(response.get());
            }
            catch (error) {
                console.error(error);
                res.status(400);
                res.json(error);
            }
        }));
    }
});
smartComponentModule.addRoute({
    path: /^\/smart-component\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.post('/smart-component', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['opcAddress', 'opcPort', 'scName'], req.body);
                yield smartComponentMainController_1.smartComponentMainController.createOrUpdateSmartObject(response, req.body.opcAddress, parseInt(req.body.opcPort));
                res.json(response.get());
            }
            catch (error) {
                console.error(error);
                res.status(400);
                res.json(error);
            }
        }));
    }
});
exports.default = smartComponentModule;
//# sourceMappingURL=smartComponentModule.js.map