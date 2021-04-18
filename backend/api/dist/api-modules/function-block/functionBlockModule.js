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
const functionBlockMainController_1 = require("../../controllers/function-block/functionBlockMainController");
const functionBlockModule = new module_1.ApiModule([]);
functionBlockModule.addRoute({
    path: /^\/function-block\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.get('/function-block', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = new request_1.RequestResponse();
                yield functionBlockMainController_1.functionBlockMainController.getFunctionBlocks(response);
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
functionBlockModule.addRoute({
    path: /^\/function-block\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.post('/function-block/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['functionBlock', 'fileB64'], req.body);
                const functionBlock = req.body.functionBlock;
                const fileB64 = req.body.fileB64;
                yield functionBlockMainController_1.functionBlockMainController.createFunctionBlock(functionBlock, fileB64, response);
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
functionBlockModule.addRoute({
    path: /^\/function-block\/-?[0-9]+\/?$/,
    method: 'delete',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.delete('/function-block/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['id'], req.params);
                yield functionBlockMainController_1.functionBlockMainController.removeFunctionBlock(parseInt(req.params.id), response);
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
functionBlockModule.addRoute({
    path: /^\/function-block\/-?[0-9]+\/?$/,
    method: 'put',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.put('/function-block/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['id'], req.params);
                response = yield request_1.checkParameters(['functionBlock'], req.body);
                yield functionBlockMainController_1.functionBlockMainController.updateFunctionBlock(parseInt(req.params.id), req.body.functionBlock, response, req.body.fileB64);
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
functionBlockModule.addRoute({
    path: /^\/function-block\/.+\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.get('/function-block/:fbType', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['fbType'], req.params);
                yield functionBlockMainController_1.functionBlockMainController.getFunctionBlocks(response, [{ key: 'fbType', value: req.params.fbType }]);
                if (!response.getResult().length) {
                    res.status(404);
                    response.setErrorState('No function block found with that id');
                }
                else
                    response.setResult((response.getResult()[0])); //only one fb
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
functionBlockModule.addRoute({
    path: /^\/function-block-category\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.get('/function-block-category', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = new request_1.RequestResponse();
                yield functionBlockMainController_1.functionBlockMainController.getFunctionBlockCategories(response);
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
functionBlockModule.addRoute({
    path: /^\/function-block-category\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.post('/function-block-category', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['categoryName'], req.body);
                yield functionBlockMainController_1.functionBlockMainController.createFunctionBlockCategory(req.body.categoryName, response);
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
functionBlockModule.addRoute({
    path: /^\/function-block-category\/-?[0-9]+\/?$/,
    method: 'delete',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.delete('/function-block-category/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['id'], req.params);
                yield functionBlockMainController_1.functionBlockMainController.removeFunctionBlockCategory(parseInt(req.params.id), response);
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
functionBlockModule.addRoute({
    path: /^\/function-block-category\/-?[0-9]+\/?$/,
    method: 'put',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.put('/function-block-category/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['id'], req.params);
                response = yield request_1.checkParameters(['categoryName'], req.body);
                yield functionBlockMainController_1.functionBlockMainController.editFunctionBlockCategory(parseInt(req.params.id), req.body.categoryName, response);
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
exports.default = functionBlockModule;
//# sourceMappingURL=functionBlockModule.js.map