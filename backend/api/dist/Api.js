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
const express = require("express");
const bodyParser = require("body-parser");
// import { verifyJWTToken, generateJWTSession } from './utils/auth';
const request_1 = require("./utils/request");
class Api {
    constructor(modules) {
        this.URLS_FILTERS_NO_COOKIE = [/^\/public\/.*\/?$/, /^\/$/];
        this.METHODS_FILTERS_NO_COOKIE = [['GET'], ['GET']];
        this.initialize = () => {
            // this.app.use('/public',express.static(__dirname + '/../public/')) 
            this.app.use(bodyParser.json({ limit: '20mb' }));
            // this.app.use(cookieParser())
            this.app.use(this.middleware);
            this.mountRoutes();
        };
        this.middleware = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const allowedOrigins = ['https://192.168.0.2:3000', 'https://192.168.0.2:7000', 'https://192.168.1.73:8080'];
            const index = allowedOrigins.indexOf(req.headers.origin);
            const matchDomain = (domain) => new RegExp(`^https?:/\\/${domain}`).test(req.headers.origin);
            if (index > -1 || matchDomain('localhost:8080') || matchDomain('127.0.0.1:8080') || matchDomain('localhost'))
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            //res.header("Access-Control-Allow-Origin", "*");
            //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.setHeader('Access-Control-Allow-Origin', req.header('origin') || req.header('x-forwarded-host') || req.header('referer') || req.header('host'));
            let response = new request_1.RequestResponse();
            if (req.method === 'POST' && !req.is('application/json')) {
                res.status(403);
                response.setErrorState('You can only post with json');
                res.json(response.get());
                return;
            }
            let byPassURL = false;
            let indexOfUrl = -1;
            for (let i = 0; i < this.URLS_FILTERS_NO_COOKIE.length; i++) {
                if (this.URLS_FILTERS_NO_COOKIE[i].test(req.path)) {
                    byPassURL = true;
                    indexOfUrl = i;
                    break;
                }
            }
            const methods = indexOfUrl != -1 ? this.METHODS_FILTERS_NO_COOKIE[indexOfUrl] : [];
            const byPassMethod = methods.includes(req.method);
            if ((byPassURL && byPassMethod) || req.method == 'OPTIONS') {
                next();
                return;
            }
            // if(isLogged)
            //     return next()
            res.status(401);
            response.setErrorState('You need to be logged to access this resource');
            res.json(response.get());
            return;
        });
        this.modules = modules;
        this.app = express();
        this.initialize();
        //var cors = require('cors')
        //this.app.use(cors()) // Use this after the variable declaration         
    }
    mountRoutes() {
        this.modules.forEach(module => module.mountRoutes(this));
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Hello World from Jurassic Park'
            });
        });
    }
    start(port) {
        return new Promise((res, rej) => {
            this.app.listen(port, (err) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(true);
            });
        });
    }
}
exports.Api = Api;
//# sourceMappingURL=Api.js.map