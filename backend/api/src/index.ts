import { SocketEngine } from './SocketEngine'
import { Api } from './Api'
import functionBlockModule from './api-modules/function-block/functionBlockModule'
import smartComponentModule from './api-modules/smart-component/smartComponentModule'
import digitalTwinModule from './api-modules/digital-twin/digitalTwinModule'
import {smartComponentMainController} from './controllers/smart-component/smartComponentMainController'

const apiPort = parseInt(process.env.APP_PORT) || 3000
const socketPort = parseInt(process.env.SOCKET_PORT) || 3500

export const api = new Api([functionBlockModule,smartComponentModule, digitalTwinModule])
export const socketEngine = new SocketEngine([smartComponentMainController])

api.start(apiPort)

    .then(_ => console.log(`api is listening on port ${apiPort}`))
    .catch(err => console.error(err))

socketEngine.start(socketPort)