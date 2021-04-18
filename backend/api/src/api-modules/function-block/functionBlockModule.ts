import * as express from 'express'
import { ApiModule } from "../module"
import { Api, FRequest } from '../../Api';
import { RequestResponse, checkParameters } from '../../utils/request';
import { functionBlockMainController } from '../../controllers/function-block/functionBlockMainController';
import { FunctionBlock } from '../../model';

const functionBlockModule : ApiModule = new ApiModule([])

functionBlockModule.addRoute({
    
    path: /^\/function-block\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/function-block', async (req: FRequest, res: express.Response) => {

            try {

                let response : RequestResponse = new RequestResponse()
                await functionBlockMainController.getFunctionBlocks(response)

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

functionBlockModule.addRoute({
    
    path: /^\/function-block\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.post('/function-block/', async (req: FRequest, res: express.Response) => {

            try {
                let response : RequestResponse = await checkParameters(['functionBlock','fileB64'],req.body)
                const functionBlock : FunctionBlock = req.body.functionBlock
                const fileB64 : string = req.body.fileB64
                await functionBlockMainController.createFunctionBlock(functionBlock,fileB64,response)

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

functionBlockModule.addRoute({
    
    path: /^\/function-block\/-?[0-9]+\/?$/,
    method: 'delete',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.delete('/function-block/:id', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['id'],req.params)
                await functionBlockMainController.removeFunctionBlock(parseInt(req.params.id),response)
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

functionBlockModule.addRoute({
    
    path: /^\/function-block\/-?[0-9]+\/?$/,
    method: 'put',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.put('/function-block/:id', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['id'],req.params)
                response = await checkParameters(['functionBlock'],req.body)
                await functionBlockMainController.updateFunctionBlock(parseInt(req.params.id), req.body.functionBlock, response, req.body.fileB64)
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

functionBlockModule.addRoute({
    
    path: /^\/function-block\/.+\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/function-block/:fbType', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['fbType'],req.params)
                await functionBlockMainController.getFunctionBlocks(response,[{key: 'fbType', value: req.params.fbType}])
                if(!response.getResult().length) {
                    res.status(404)
                    response.setErrorState('No function block found with that id')
                }
                else
                    response.setResult((response.getResult()[0])) //only one fb
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

functionBlockModule.addRoute({
    
    path: /^\/function-block-category\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/function-block-category', async (req: FRequest, res: express.Response) => {

            try {

                let response : RequestResponse = new RequestResponse()
                await functionBlockMainController.getFunctionBlockCategories(response)
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

functionBlockModule.addRoute({
    
    path: /^\/function-block-category\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.post('/function-block-category', async (req: FRequest, res: express.Response) => {

            try {
                let response : RequestResponse = await checkParameters(['categoryName'],req.body)
                await functionBlockMainController.createFunctionBlockCategory(req.body.categoryName,response)
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

functionBlockModule.addRoute({
    
    path: /^\/function-block-category\/-?[0-9]+\/?$/,
    method: 'delete',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.delete('/function-block-category/:id', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['id'],req.params)
                await functionBlockMainController.removeFunctionBlockCategory(parseInt(req.params.id),response)
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

functionBlockModule.addRoute({
    
    path: /^\/function-block-category\/-?[0-9]+\/?$/,
    method: 'put',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.put('/function-block-category/:id', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['id'],req.params)
                response = await checkParameters(['categoryName'],req.body)
                await functionBlockMainController.editFunctionBlockCategory(parseInt(req.params.id), req.body.categoryName, response)
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

export default functionBlockModule
