import * as express from 'express'
import * as bodyParser from 'body-parser'
// import * as cookieParser from 'cookie-parser'
// import { Session } from './model/Session'

import { ApiModule } from './api-modules/module'
// import { verifyJWTToken, generateJWTSession } from './utils/auth';
import { RequestResponse } from './utils/request';

export interface FRequest extends express.Request {
    // session : Session
}

export class Api {

    public app
    private modules : ApiModule[]

    URLS_FILTERS_NO_COOKIE : RegExp[] = [/^\/public\/.*\/?$/,  /^\/$/]
    
    METHODS_FILTERS_NO_COOKIE : string[][] =  [['GET'], ['GET']] 

    constructor (modules: ApiModule[]) {
        this.modules = modules
        this.app = express()
        this.initialize()  
        //var cors = require('cors')
        //this.app.use(cors()) // Use this after the variable declaration         
    }

    private initialize = () => {

        // this.app.use('/public',express.static(__dirname + '/../public/')) 
        this.app.use(bodyParser.json({limit: '20mb'}))
        // this.app.use(cookieParser())
        this.app.use(this.middleware)
        this.mountRoutes()

    }

    private mountRoutes () : void {

        this.modules.forEach(module => module.mountRoutes(this))
        
        this.app.get('/', (req : FRequest, res : express.Response) => {
                        
            res.json({
                
                message: 'Hello World from Jurassic Park'
                
            })
            
        })        
    }

    private middleware = async (req: FRequest,res: express.Response, next: express.NextFunction) => {
        
        const allowedOrigins = ['https://192.168.0.2:3000','https://192.168.0.2:7000','https://192.168.1.73:8080']
        const index = allowedOrigins.indexOf(req.headers.origin as string)
        
        const matchDomain = (domain:string) => new RegExp(`^https?:/\\/${domain}`).test(req.headers.origin as string)

        if(index > -1 || matchDomain('localhost:8080') || matchDomain('127.0.0.1:8080') || matchDomain('localhost')) 
            res.setHeader('Access-Control-Allow-Origin',req.headers.origin)

        res.setHeader('Access-Control-Allow-Methods','GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH')
        res.setHeader('Access-Control-Allow-Headers','Content-Type')
        res.setHeader('Access-Control-Allow-Credentials','true')
        //res.header("Access-Control-Allow-Origin", "*");
        //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader('Access-Control-Allow-Origin', req.header('origin') || req.header('x-forwarded-host') || req.header('referer') || req.header('host'));

        let response = new RequestResponse()

        if(req.method === 'POST' && !req.is('application/json')) {
            res.status(403)
            response.setErrorState('You can only post with json')
            res.json(response.get())
            return
        }
        
        let byPassURL = false
        let indexOfUrl = -1

        for(let i = 0; i < this.URLS_FILTERS_NO_COOKIE.length; i++) {

            if(this.URLS_FILTERS_NO_COOKIE[i].test(req.path)) {
                byPassURL = true
                indexOfUrl = i
                break
            }

        }

        const methods = indexOfUrl != -1 ?  this.METHODS_FILTERS_NO_COOKIE[indexOfUrl] : []
        const byPassMethod = methods.includes(req.method)

        if((byPassURL && byPassMethod) || req.method == 'OPTIONS') {
            next()
            return
        }

        // if(isLogged)
        //     return next()

        res.status(401)
        response.setErrorState('You need to be logged to access this resource')
        res.json(response.get())
        return
        
    }

    public start(port: number) : Promise<boolean> {

        return new Promise((res: Function, rej: Function) => {

            this.app.listen(port, (err: any) => {

                if(err) {
                    rej(err)
                    return
                }

                res(true)

            })

        })

    }

}
