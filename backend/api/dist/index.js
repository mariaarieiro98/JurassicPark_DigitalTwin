"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketEngine_1 = require("./SocketEngine");
const Api_1 = require("./Api");
const functionBlockModule_1 = require("./api-modules/function-block/functionBlockModule");
const smartComponentModule_1 = require("./api-modules/smart-component/smartComponentModule");
const digitalTwinModule_1 = require("./api-modules/digital-twin/digitalTwinModule");
const smartComponentMainController_1 = require("./controllers/smart-component/smartComponentMainController");
const apiPort = parseInt(process.env.APP_PORT) || 3000;
const socketPort = parseInt(process.env.SOCKET_PORT) || 3500;
exports.api = new Api_1.Api([functionBlockModule_1.default, smartComponentModule_1.default, digitalTwinModule_1.default]);
exports.socketEngine = new SocketEngine_1.SocketEngine([smartComponentMainController_1.smartComponentMainController]);
exports.api.start(apiPort)
    .then(_ => console.log(`api is listening on port ${apiPort}`))
    .catch(err => console.error(err));
exports.socketEngine.start(socketPort);
//# sourceMappingURL=index.js.map