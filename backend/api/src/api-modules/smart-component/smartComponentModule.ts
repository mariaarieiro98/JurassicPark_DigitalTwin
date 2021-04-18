import { ApiModule } from "../module"
import { FRequest, Api } from "../../Api"
import * as express from 'express'
import { RequestResponse, checkParameters } from "../../utils/request"
import {smartComponentMainController} from '../../controllers/smart-component/smartComponentMainController'

const smartComponentModule : ApiModule = new ApiModule([])

smartComponentModule.addNamespace('smart-component')

smartComponentModule.addRoute({
    
    path: /^\/smart-component\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/smart-component', async (req: FRequest, res: express.Response) => {

            try {

                let response : RequestResponse = new RequestResponse()
                await smartComponentMainController.getSmartObjectSData(response)
                //console.log(response)
                res.json(response.get())
            }
    
            catch(error) {
                console.error(error)
                res.status(400)
                res.json(error)
            }
        })

    }
})

smartComponentModule.addRoute({
    
    path: /^\/smart-component\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.post('/smart-component', async (req: FRequest, res: express.Response) => {
           
            try {

                let response : RequestResponse = await checkParameters(['opcAddress','opcPort','scName'],req.body)
                await smartComponentMainController.createOrUpdateSmartObject(response, req.body.opcAddress, parseInt(req.body.opcPort))
                res.json(response.get())
            }
    
            catch(error) {
                console.error(error)
                res.status(400)
                res.json(error)
            }
        })
    }
})

export default smartComponentModule