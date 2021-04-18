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
const digitalTwinMainController_1 = require("../../controllers/digital-twin/digitalTwinMainController");
const digitalTwinModule = new module_1.ApiModule([]);
digitalTwinModule.addRoute({
    path: /^\/functionality\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.get('/functionality/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = new request_1.RequestResponse();
                yield digitalTwinMainController_1.digitalTwinMainController.getFunctionality(response);
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
digitalTwinModule.addRoute({
    path: /^\/functionality\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.post('/functionality/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(req.body);
                let response = yield request_1.checkParameters(['funcName', 'funcdtId', 'funcId', 'funcUserId'], req.body);
                const functionality = req.body;
                yield digitalTwinMainController_1.digitalTwinMainController.createFunctionality(functionality, response);
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
digitalTwinModule.addRoute({
    path: /^\/functionality\/-?[0-9]+\/?$/,
    method: 'delete',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.delete('/functionality/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['id'], req.params);
                yield digitalTwinMainController_1.digitalTwinMainController.removeFunctionality(parseInt(req.params.id), response);
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
digitalTwinModule.addRoute({
    path: /^\/functionality\/-?[0-9]+\/?$/,
    method: 'put',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.put('/functionality/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                //console.log(req.body)
                let response = yield request_1.checkParameters(['id'], req.params);
                //response = await checkParameters(['funcId'],req.body)
                yield digitalTwinMainController_1.digitalTwinMainController.editFunctionality(parseInt(req.params.id), req.body, response);
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
digitalTwinModule.addRoute({
    path: /^\/functionality\/.+\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.get('/functionality/:funcName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['funcName'], req.params);
                yield digitalTwinMainController_1.digitalTwinMainController.getFunctionality(response, [{ key: 'funcName', value: req.params.funcName }]);
                if (!response.getResult().length) {
                    res.status(404);
                    response.setErrorState('No functionality found with that id');
                }
                else
                    response.setResult((response.getResult()[0])); //only one functionality
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
digitalTwinModule.addRoute({
    path: /^\/digital-twin\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.get('/digital-twin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = new request_1.RequestResponse();
                yield digitalTwinMainController_1.digitalTwinMainController.getDigitalTwins(response);
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
digitalTwinModule.addRoute({
    path: /^\/digital-twin\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.post('/digital-twin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['digitalTwinName'], req.body);
                yield digitalTwinMainController_1.digitalTwinMainController.createDigitalTwin(req.body.digitalTwinName, response);
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
digitalTwinModule.addRoute({
    path: /^\/digital-twin\/-?[0-9]+\/?$/,
    method: 'delete',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.delete('/digital-twin/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['id'], req.params);
                yield digitalTwinMainController_1.digitalTwinMainController.removeDigitalTwin(parseInt(req.params.id), response);
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
digitalTwinModule.addRoute({
    path: /^\/digital-twin\/-?[0-9]+\/?$/,
    method: 'put',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.put('/digital-twin/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['id'], req.params);
                response = yield request_1.checkParameters(['digitalTwinName'], req.body);
                yield digitalTwinMainController_1.digitalTwinMainController.editDigitalTwin(parseInt(req.params.id), req.body.digitalTwinName, response);
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
digitalTwinModule.addRoute({
    path: /^\/associated-smart-components\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.get('/associated-smart-components', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = new request_1.RequestResponse();
                yield digitalTwinMainController_1.digitalTwinMainController.getAssociatedSmartComponent(response);
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
digitalTwinModule.addRoute({
    path: /^\/associated-smart-components\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api) => {
        api.app.post('/associated-smart-components', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let response = yield request_1.checkParameters(['assSc', 'scDtId'], req.body);
                yield digitalTwinMainController_1.digitalTwinMainController.createAssociatedSmartComponent(req.body.assSc, req.body.scDtId, response);
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
exports.default = digitalTwinModule;
//# sourceMappingURL=digitalTwinModule.js.map