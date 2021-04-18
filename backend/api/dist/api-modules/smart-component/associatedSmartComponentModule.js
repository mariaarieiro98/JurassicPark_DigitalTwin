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
const AssociatedSmartComponentMainController_1 = require("../../controllers/smart-component/AssociatedSmartComponentMainController");
const associatedSmartComponentModule = new module_1.ApiModule([]);
associatedSmartComponentModule.addRoute({
    path: /^\/associated-smart-component\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.get('associated-smart-component', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = new request_1.RequestResponse();
                yield AssociatedSmartComponentMainController_1.AssociatedSmartMainController.getAssociatedSmartComponent(response);
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
associatedSmartComponentModule.addRoute({
    path: /^\/associated-smart-component\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.post('associated-smart-component', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['digitalTwinName'], req.body);
                yield AssociatedSmartComponentMainController_1.AssociatedSmartMainController.createAssociatedSmartComponent(req.body.digitalTwinName, response);
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
// associatedSmartComponentModule.addRoute({
//     path: /^\/digital-twin\/-?[0-9]+\/?$/,
//     method: 'delete',
//     withAuthentication: false,
//     mountRoute: (api: Api) => {
//         api.app.delete('/digital-twin/:id', async (req: FRequest, res: express.Response) => {
//             try {
//                 let response : RequestResponse = await checkParameters(['id'],req.params)
//                 await digitalTwinMainController.removeDigitalTwin(parseInt(req.params.id),response)
//                 res.json(response.get())
//             }
//             catch(error) {
//                 console.error(error)
//                 res.status(400)
//                 res.json(error)
//             }
//         })
//     }
// })
// associatedSmartComponentModule.addRoute({
//     path: /^\/digital-twin\/-?[0-9]+\/?$/,
//     method: 'put',
//     withAuthentication: false,
//     mountRoute: (api: Api) => {
//         api.app.put('/digital-twin/:id', async (req: FRequest, res: express.Response) => {
//             try {
//                 let response : RequestResponse = await checkParameters(['id'],req.params)
//                 response = await checkParameters(['digitalTwinName'],req.body)
//                 await digitalTwinMainController.editDigitalTwin(parseInt(req.params.id), req.body.digitalTwinName, response)
//                 res.json(response.get())
//             }
//             catch(error) {
//                 console.error(error)
//                 res.status(400)
//                 res.json(error)
//             }
//         })
//     }
// })
exports.default = associatedSmartComponentModule;
//# sourceMappingURL=associatedSmartComponentModule.js.map