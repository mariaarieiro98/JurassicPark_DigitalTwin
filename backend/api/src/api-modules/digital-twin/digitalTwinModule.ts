import * as express from 'express'
import { ApiModule } from "../module"
import { Api, FRequest } from '../../Api';
import { RequestResponse, checkParameters } from '../../utils/request';
import { digitalTwinMainController } from '../../controllers/digital-twin/digitalTwinMainController';
import { Functionality, MonitoredEvent } from '../../model';
import { AssociatedSmartComponent } from '../../model/model/AssociatedSmartComponent';
import { MonitoredVariable } from '../../model/model/MonitoredVariable';

const digitalTwinModule : ApiModule = new ApiModule([])

digitalTwinModule.addRoute({
    
    path: /^\/functionality\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/functionality/', async (req: FRequest, res: express.Response) => {

            try {
                let response : RequestResponse = new RequestResponse()
                await digitalTwinMainController.getFunctionality(response)
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

digitalTwinModule.addRoute({   

    path: /^\/functionality\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.post('/functionality/', async (req: FRequest, res: express.Response) => {

            try {
                let response : RequestResponse = await checkParameters(['funcName', 'funcdtId', 'funcId', 'funcUserId'],req.body)
                const functionality : Functionality = req.body
                await digitalTwinMainController.createFunctionality(functionality,response)
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

digitalTwinModule.addRoute({
    
    path: /^\/functionality\/-?[0-9]+\/?$/,
    method: 'delete',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.delete('/functionality/:id', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['id'],req.params)
                await digitalTwinMainController.removeFunctionality(parseInt(req.params.id),response)
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

digitalTwinModule.addRoute({
    
    path: /^\/functionality\/-?[0-9]+\/?$/,
    method: 'put',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.put('/functionality/:id', async (req: FRequest, res: express.Response) => {

            try {
                //console.log(req.body)
                let response : RequestResponse = await checkParameters(['id'],req.params)
                //response = await checkParameters(['funcId'],req.body)
                await digitalTwinMainController.editFunctionality(parseInt(req.params.id), req.body, response)
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

digitalTwinModule.addRoute({
    
    path: /^\/functionality\/.+\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/functionality/:funcName', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['funcName'],req.params)
                await digitalTwinMainController.getFunctionality(response,[{key: 'funcName', value: req.params.funcName}])
                if(!response.getResult().length) {
                    res.status(404)
                    response.setErrorState('No functionality found with that id')
                }
                else
                    response.setResult((response.getResult()[0])) //only one functionality
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

digitalTwinModule.addRoute({
    
    path: /^\/digital-twin\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/digital-twin', async (req: FRequest, res: express.Response) => {

            try {

                let response : RequestResponse = new RequestResponse()
                await digitalTwinMainController.getDigitalTwins(response)
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

digitalTwinModule.addRoute({
    
    path: /^\/digital-twin\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.post('/digital-twin', async (req: FRequest, res: express.Response) => {

            try {
                let response : RequestResponse = await checkParameters(['digitalTwinName'],req.body)
                await digitalTwinMainController.createDigitalTwin(req.body.digitalTwinName,response)
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

digitalTwinModule.addRoute({
    
    path: /^\/digital-twin\/-?[0-9]+\/?$/,
    method: 'delete',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.delete('/digital-twin/:id', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['id'],req.params)
                await digitalTwinMainController.removeDigitalTwin(parseInt(req.params.id),response)
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

digitalTwinModule.addRoute({
    
    path: /^\/digital-twin\/-?[0-9]+\/?$/,
    method: 'put',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.put('/digital-twin/:id', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['id'],req.params)
                response = await checkParameters(['digitalTwinName'],req.body)
                await digitalTwinMainController.editDigitalTwin(parseInt(req.params.id), req.body.digitalTwinName, response)
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

digitalTwinModule.addRoute({
    
    path: /^\/associated-smart-components\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/associated-smart-components', async (req: FRequest, res: express.Response) => {

            try {

                let response : RequestResponse = new RequestResponse()
                await digitalTwinMainController.getAssociatedSmartComponent(response)
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

digitalTwinModule.addRoute({
    
    path: /^\/associated-smart-components\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        // api.app.post('/associated-smart-components', async (req: FRequest, res: express.Response) => {

        //     try {
        //         let response : RequestResponse = await checkParameters(['assSc','scDtId'],req.body)
        //         await digitalTwinMainController.createAssociatedSmartComponent(req.body.assSc,req.body.scDtId,response)
        //         res.json(response.get())
        //     }
    
        //     catch(error) {
        //         console.error(error)
        //         res.status(400)
        //         res.json(error)
        //     }
        // })

        api.app.post('/associated-smart-components/', async (req: FRequest, res: express.Response) => {

            try {
                let response : RequestResponse = await checkParameters(['scName', 'associatedScUserId' , 'scDtId' ],req.body)
                const associatedSmartComponent : AssociatedSmartComponent = req.body
                await digitalTwinMainController.createAssociatedSmartComponent(associatedSmartComponent,response)
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

digitalTwinModule.addRoute({
    
    path: /^\/monitored-variable\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/monitored-variable/', async (req: FRequest, res: express.Response) => {

            try {

                let response : RequestResponse = new RequestResponse()
                await digitalTwinMainController.getMonitoredVariable(response)
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

digitalTwinModule.addRoute({
    
    path: /^\/monitored-variable\/.+\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/monitored-variable/:funcIdAssociated', async (req: FRequest, res: express.Response) => {

            try {
                
                let response : RequestResponse = await checkParameters(['funcIdAssociated'],req.params)
                await digitalTwinMainController.getMonitoredVariable(response,[{key: 'funcIdAssociated', value: req.params.funcIdAssociated}])
                if(!response.getResult().length) {
                    res.status(404)
                    response.setErrorState('No monitoredVariable found with that funcId')
                }
                else
                    response.setResult((response.getResult()[0])) //only one monitoredVariable
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

digitalTwinModule.addRoute({
    
    path: /^\/monitored-variable\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.post('/monitored-variable/', async (req: FRequest, res: express.Response) => {

            try {
                let response : RequestResponse = await checkParameters(['funcIdAssociated' ,'fbAssociated', 'idMonitoredVariable', 'monitoredVariableName', 'scAssociated'],req.body)
                const monitoredVariable : MonitoredVariable = req.body
                await digitalTwinMainController.createMonitoredVariable(monitoredVariable,response)
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

digitalTwinModule.addRoute({
    
    path: /^\/monitored-event\/?$/,
    method: 'get',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.get('/monitored-event/', async (req: FRequest, res: express.Response) => {

            try {

                let response : RequestResponse = new RequestResponse()
                await digitalTwinMainController.getMonitoredEvent(response)
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

digitalTwinModule.addRoute({
    
    path: /^\/monitored-event\/?$/,
    method: 'post',
    withAuthentication: false,
    mountRoute: (api: Api) => {

        api.app.post('/monitored-event/', async (req: FRequest, res: express.Response) => {

            try {
                let response : RequestResponse = await checkParameters(['funcIdAssociated' ,'fbAssociated', 'idMonitoredEvent', 'monitoredEventName'],req.body)
                const monitoredEvent : MonitoredEvent = req.body
                await digitalTwinMainController.createMonitoredEvent(monitoredEvent,response)
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

export default digitalTwinModule
