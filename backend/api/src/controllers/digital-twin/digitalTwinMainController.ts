import { DatabaseUtils, Statement, Operation } from "../../utils/database"
import { RequestResponse } from "../../utils/request"
import { GeneralErrors , Tables} from "../../model"
import { groupBy } from "../../utils/utils"
import { Functionality ,DigitalTwin} from "../../model"
import { AssociatedSmartComponent } from "../../model/model/AssociatedSmartComponent"

export class DigitalTwinMainController {

    private processRawFunctionalities = (raw: any[]) : Functionality[] => {

        const grouped = groupBy(raw,'funcId',['funcUserId','funcdtId','dtName','funcName']) as any

        return grouped.map((func:any) => ({

            funcId: parseInt(func.funcId), funcName:func.funcName, funcdtId:func.funcdtId, dtName:func.dtName,
            funcUserId:func.funcUserId, 
        }))

    }

    private processRawAssociatedSmartComponents = (raw: any[]) : AssociatedSmartComponent[] => {

        const grouped = groupBy(raw,'idAssociateSmartComponent',['scFuncId','scName']) as any

        return grouped.map((associatedSc:any) => ({

            idAssociateSmartComponent: parseInt(associatedSc.idAssociateSmartComponent), scFuncId:associatedSc.scFuncId, scName:associatedSc.scName
        }))

    }

    public getAssociatedSmartComponent = (response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {

                const scQuery : string = 'SELECT * FROM AssociatedSmartComponent'
                const result = await DatabaseUtils.executeStatement(scQuery)
                
                const smartComponents: AssociatedSmartComponent[] = result.result
                
                response.setResult(smartComponents)
                res(response)
            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Getting AssociatedSmartComponents',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    public createAssociatedSmartComponent = (scName: string, scDtId: number , response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {
                console.log(scName)
                const insertSmartComponent : string = 'Insert INTO AssociatedSmartComponent(scName, scDtId, associatedScUserId) VALUES(?,?,?)'
                const result = await DatabaseUtils.executeStatement(insertSmartComponent, [scName,scDtId,1])
                response.setExtra({lastInsertedId:result.result.insertId})
                res(response)

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Creating Associated Smart Component',GeneralErrors.general.code)
                rej(response)
            }

        })

    }


    public getFunctionality = (response: RequestResponse, filters?: {key?:string, value?: number | string | boolean } []) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {

                let query = `SELECT FUNC.*, 
                                DT.dtId, DT.dtName
                               FROM Functionality as FUNC
                               JOIN DigitalTwin as DT ON DT.dtId = FUNC.funcdtId`

                filters?.forEach((filter: {key?:string, value?: number | string | boolean}, index:number) => {

                    query += `${!index ? 'WHERE': 'AND'} ${filter.key} = ? `

                })

                
                const result = await DatabaseUtils.executeStatement(query,filters?.map(f => f.value) ?? [])

                response.setResult(this.processRawFunctionalities(result.result))

                res(response)
            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Getting Functionalities',GeneralErrors.general.code)
                rej(response)
            }

        })
    }

    private validateFunctionality(func:Functionality) : {valid: boolean, reason?: string} {

        if(func.funcName === '')
            return {valid: false, reason: 'Functionality Name not well Formed'}
        if(!func.funcdtId)
            return {valid: false, reason: 'Digital Twin associated not well Formed'}

        return  {valid: true, reason: ''}

    }

    public createFunctionality = (functionality: Functionality,  response: RequestResponse) : Promise<RequestResponse> => {
        
        return new Promise(async (res: Function, rej: Function) => {

            try {
                const stmtFunctionality: Statement = {
                    sql:  'Insert INTO Functionality(funcName,funcUserId,funcdtId) VALUES(?,?,?)',
                    params: [functionality.funcName, functionality.funcUserId, functionality.funcdtId],
                    type: Operation.insert,
                    insertTable: Tables.functionality
                }
                
                const insertIds = await DatabaseUtils.executeTransaction([stmtFunctionality])
                response.setExtra({lastInsertedId: insertIds.FunctionBlock})
                res(response)
            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Creating Functionality',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    public removeFunctionality = (id: number, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res:Function, rej: Function) => {

            let funcData : any

            try {
                const query = 'SELECT funcName, dtName FROM Functionality JOIN DigitalTwin ON Functionality.funcdtId = DigitalTwin.dtId WHERE funcId = ?'
                funcData = await DatabaseUtils.executeStatement(query,[id])
                if(!funcData.result.length) {
                    response.setErrorState('No Functionality found')
                    rej(response)
                    return
                }
            }

            catch(err) {
                console.error(err)
                rej(err)
            }

            try {

                const stmt = 'DELETE FROM Functionality WHERE funcId = ?'
                await DatabaseUtils.executeStatement(stmt,[id])
                res(response)

            }
            catch(err) {
                console.error(err)
                rej(err)
            }
            
        })
    }

    public editFunctionality = (id: number, functionality: Functionality, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {
                
                const oldFunctionality = (await DatabaseUtils.executeStatement('SELECT funcName FROM Functionality WHERE funcId = ?', [id])).result[0]

                if(!oldFunctionality) {
                    response.setErrorState('No functionality found')
                    rej(response)
                    return
                }

                // if(oldFunctionality.funcName === functionality.funcName) {
                //     res(response)
                //     return
                // }
                
                if (functionality.funcscName === null || functionality.funcscId === null) {
                    const updateFunctionalityStmt : string = 'UPDATE Functionality SET funcName = ? WHERE funcId = ?'
                    await DatabaseUtils.executeStatement(updateFunctionalityStmt, [functionality.funcName,id])            
                    res(response)
                }

                console.log(functionality.funcscName)
                if (functionality.funcscName !== null){
                    console.log(functionality.funcscName)
                    const updateFunctionalityStmt : string = 'UPDATE Functionality SET funcscId = ?, funcscName = ? WHERE funcId = ?'
                    await DatabaseUtils.executeStatement(updateFunctionalityStmt, [functionality.funcscId, functionality.funcscName, id])            
                    res(response)
                }

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Updating Functionality',GeneralErrors.general.code)
                rej(response)
            }

        })
    }

    public getDigitalTwins = (response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {

                const dtQuery : string = 'SELECT * FROM DigitalTwin'
                const result = await DatabaseUtils.executeStatement(dtQuery)

                const functionalities : {funcName:string, funcdtId:number}[] = (await this.getFunctionality(new RequestResponse())).getResult().map((func:Functionality) => ({funcName: func.funcName, funcdtId:func.funcdtId}))
                
                const associatedSmartComponents: {scName: string, scDtId: number}[] = (await this.getAssociatedSmartComponent(new RequestResponse())).getResult().map((assSc: AssociatedSmartComponent) => ({scName: assSc.scName, scDtId:assSc.scDtId}))
                const digitalTwins : DigitalTwin[] = result.result
                
                for(let i = 0; i < digitalTwins.length; i++) {

                    const digitalTwin = digitalTwins[i]
                    digitalTwin.functionalities = []
                    const inserted = []
                   
                    for(let j = 0; j < functionalities.length; j++) {

                        const func = functionalities[j]

                        if(digitalTwin.dtId === func.funcdtId) {

                            digitalTwin.functionalities.push(func.funcName)
                            inserted.push(j)
                        }

                    }

                    for(let k = 0; k < inserted.length; k++) {
                        functionalities.splice(inserted[k]-k,1)
                    }

                }

                for(let i = 0; i < digitalTwins.length; i++) {

                    const digitalTwin = digitalTwins[i]
                    digitalTwin.associatedSmartComponents = []
                    const inserted = []
                   
                    for(let j = 0; j < associatedSmartComponents.length; j++) {

                        const assSc = associatedSmartComponents[j]
    
                        if(digitalTwin.dtId === assSc.scDtId) {
    
                            digitalTwin.associatedSmartComponents.push(assSc.scName)
                            inserted.push(j)
                        }
    
                    }

                    for(let k = 0; k < inserted.length; k++) {
                        associatedSmartComponents.splice(inserted[k]-k,1)
                    }
                }

                response.setResult(digitalTwins)
                res(response)
            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Getting Digital Twins',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    public createDigitalTwin = (dtName: string, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {

                const insertDigitalTwin : string = 'Insert INTO DigitalTwin(dtName, dtUserId) VALUES(?,?)'
                const result = await DatabaseUtils.executeStatement(insertDigitalTwin, [dtName,1])
                response.setExtra({lastInsertedId:result.result.insertId})
                res(response)

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Creating Digital Twin',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    public removeDigitalTwin = (id: number, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {

                const oldDigitalTwin = (await DatabaseUtils.executeStatement('SELECT dtName FROM DigitalTwin WHERE dtId = ?', [id])).result[0]
                if(!oldDigitalTwin) {
                    response.setErrorState('No digital-twin found')
                    rej(response)
                    return
                }
            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Deleting Digital Twin',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    public editDigitalTwin = (id: number, name:string, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {
                
                const oldDigitalTwin= (await DatabaseUtils.executeStatement('SELECT dtName FROM DigitalTwin WHERE dtId = ?', [id])).result[0]

                if(!oldDigitalTwin) {
                    response.setErrorState('No digital-twin found')
                    rej(response)
                    return
                }

                if(oldDigitalTwin.dtName === name) {
                    res(response)
                    return
                }
                
                const updateDigitalTwinStmt : string = 'UPDATE DigitalTwin SET dtName = ? WHERE dtId = ?'
                await DatabaseUtils.executeStatement(updateDigitalTwinStmt, [name,id])
                res(response)

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Updating Digital Twin',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

}

export const digitalTwinMainController = new DigitalTwinMainController()
