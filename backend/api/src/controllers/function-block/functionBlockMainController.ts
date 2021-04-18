import { DatabaseUtils, Statement, Operation } from "../../utils/database"
import { RequestResponse } from "../../utils/request"
import { GeneralErrors, Variable, ExternalDependency, FBCategory } from "../../model"
import { groupBy, fromB64, saveFile, deleteFile, createFileCopy, deleteDir, readConf, renameFileOrFolder, getFileStats } from "../../utils/utils"
import { InOutType, EventVariable, Event, Tables } from "../../model"
import { FunctionBlock } from "../../model"
import { Element, js2xml, Attributes } from "xml-js"
import { sep } from "path"
import { fstat, stat, Stats } from "fs"

const DEFAULT_FUNCTION_BLOCKS_FOLDER = `.${sep}public${sep}function-blocks`
const DEFAULT_FUNCTION_BLOCKS_BACKUP_FOLDER = `.${sep}public${sep}function-blocks-backup`
const DEFAULT_4DIAC_LIB_FOLDER = `.${sep}4diac-lib`

interface FunctionBlockFilePaths {
    py: string
    fbt:string
    folder:string
    tempFolder: string
    pyPath: string
    fbtPath: string
    pyTempPath: string
    fbtTempPath: string
    _4diacFolder: string
    fbt4diacPath: string
}

export class FunctionBlockMainController {

    public _4diacFolder : string
    public functionBlocksFolder : string
    public functionBlocksBackupFolder : string

    private buildFunctionBlockFilePathAndFolder = (fbType: string, fbCategory: string) : FunctionBlockFilePaths => {

        const folder = this.functionBlocksFolder + sep + fbCategory + sep + fbType
        const tempFolder = this.functionBlocksBackupFolder + sep + fbCategory + sep + fbType
        const _4diacFolder = this._4diacFolder + sep + fbCategory
        const py = fbType + '.py'
        const fbt = fbType + '.fbt'
        const pyPath = folder + sep + py
        const fbtPath = folder + sep + fbt
        const pyTempPath = tempFolder + sep + py
        const fbtTempPath = tempFolder + sep + fbt
        const fbt4diacPath = _4diacFolder + sep + fbt
        return {folder,tempFolder,py,fbt,pyPath,pyTempPath,fbtPath,fbtTempPath,_4diacFolder,fbt4diacPath}

    }

    constructor() {

        readConf()

            .then((conf:any) => {

                this._4diacFolder = conf._4diacLib || DEFAULT_4DIAC_LIB_FOLDER
                this.functionBlocksFolder = conf.functionBlocksFolder || DEFAULT_FUNCTION_BLOCKS_FOLDER
                this.functionBlocksBackupFolder = conf.functionBlocksFolder || DEFAULT_FUNCTION_BLOCKS_BACKUP_FOLDER

            })

            .catch(err => {

                this._4diacFolder = DEFAULT_4DIAC_LIB_FOLDER
                this.functionBlocksFolder = DEFAULT_FUNCTION_BLOCKS_FOLDER
                this.functionBlocksBackupFolder = DEFAULT_FUNCTION_BLOCKS_BACKUP_FOLDER

            })

    }

    private processRawFunctionBlocks = (raw: any[]) : FunctionBlock[] => {

        const grouped = groupBy(raw,'fbId',['fbUserId','fbFbcId','fbcName','fbGeneralCategory','fbType','fbDescription']) as any
                
        for (let i = 0; i < grouped.length; i++) {
            
            grouped[i].events = groupBy(grouped[i].content,'eventId',['eventName','eventType','eventOpcua','eventInoutType'])
                    
            grouped[i].events.forEach((element:any) => {
                
                const eventVariables : EventVariable[] = 

                groupBy(grouped[i].content,'evVariableId',['evVariableId','evEventId','eventVariableName','evValid'])
                    .filter((eventVariable:any) => eventVariable.evEventId == element.eventId)
                    .map((eventVariableM:any) => ({evEventId:eventVariableM.evEventId, evVariableId:eventVariableM.evVariableId, evEventName:eventVariableM.evEventName, evVariableName: eventVariableM.eventVariableName, evValid: eventVariableM.evValid}))

                element.eventVariables = eventVariables
                
            })

            const inEvents : Event[] = grouped[i].events.filter((event:any) => event.eventInoutType === InOutType.in)
            const outEvents : Event[] = grouped[i].events.filter((event:any) => event.eventInoutType === InOutType.out)

            grouped[i].fbInputEvents = inEvents.map((event:Event) => ({...event, content:null}))
            grouped[i].fbOutputEvents = outEvents.map((event:Event) => ({...event, content:null}))
            
            grouped[i].variables = groupBy(grouped[i].content,'variableId',['variableName','variableOpcua','variableInoutType','variableDataType'])
            
            const inVariables : Variable[] = grouped[i].variables.filter((variable:any) => variable.variableInoutType === InOutType.in)
            const outVariables : Variable[] = grouped[i].variables.filter((variable:any) => variable.variableInoutType === InOutType.out)
            
            grouped[i].fbInputVariables = inVariables.map((variable:Variable) => ({...variable, content:null}))
            grouped[i].fbOutputVariables = outVariables.map((variable:Variable) => ({...variable, content:null}))

            grouped[i].externalDependencies = groupBy(grouped[i].content,'edId',['edName','edVersion']).map((filteredEd: ExternalDependency) => ({edId: filteredEd.edId, edName: filteredEd.edName, edVersion: filteredEd.edVersion}))

        }


        return grouped.map((fb:any) => ({

            fbId: parseInt(fb.fbId), fbType:fb.fbType,fbDescription:fb.fbDescription,fbFbcId:fb.fbFbcId,fbCategoryName:fb.fbcName,
            fbUserId:fb.fbUserId, fbGeneralCategory:fb.fbGeneralCategory, fbInputVariables: fb.fbInputVariables, fbOutputVariables: fb.fbOutputVariables,
            fbInputEvents: fb.fbInputEvents, fbOutputEvents: fb.fbOutputEvents, fbExternalDependencies: fb.externalDependencies

        }))


    }
    
    public getFunctionBlocks = (response: RequestResponse, filters?: {key?:string, value?: number | string | boolean } []) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {

                let query = `SELECT FB.*, 
                                FBC.fbcId, FBC.fbcName,
                                E.eventId,E.eventName,E.eventType,E.eventOpcua, E.eventInoutType, 
                                V.variableId,V.variableName,V.variableOpcua, V.variableInoutType, V.variableDataType,
                                EV.evEventId,EV.evVariableId, EV.evValid,
                                EVV.variableName as eventVariableName,
                                ED.edId, ED.edName, FBED.fbEdVersion as edVersion
                               FROM FunctionBlock as FB
                               JOIN FBCategory as FBC ON FBC.fbcId = FB.fbFbcId
                               LEFT JOIN Event as E ON E.eventFbId = FB.fbId
                               LEFT JOIN Variable as V ON V.variableFbId = FB.fbId
                               LEFT JOIN EventVariable as EV ON EV.evEventId = E.eventId
                               LEFT JOIN Variable as EVV ON EVV.variableId = EV.evVariableId
                               LEFT JOIN FunctionBlockExternalDependency as FBED ON FBED.fbedFbId = FB.fbId
                               LEFT JOIN ExternalDependency as ED ON ED.edId = FBED.fbedEdId `



                filters?.forEach((filter: {key?:string, value?: number | string | boolean}, index:number) => {

                    query += `${!index ? 'WHERE': 'AND'} ${filter.key} = ? `

                })
                
                const result = await DatabaseUtils.executeStatement(query,filters?.map(f => f.value) ?? [])

                response.setResult(this.processRawFunctionBlocks(result.result))

                res(response)

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Getting Function Blocks',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    public createFunctionBlock = (functionBlock: FunctionBlock, fbImplemenationFile:string, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            const validFunctionBlock = this.validateFunctionBlock(functionBlock)

            if(!validFunctionBlock.valid) {
                response.setErrorState(validFunctionBlock.reason)
                rej(response)
                return
            }

            try {

                const stmtFunctionBlock : Statement = {
                    sql: 'INSERT INTO FunctionBlock(fbType,fbDescription,fbUserId,fbFbcId,fbGeneralCategory) VALUES(?,?,?,?,?)',
                    params: [functionBlock.fbType, functionBlock.fbDescription, functionBlock.fbUserId, functionBlock.fbFbcId, functionBlock.fbGeneralCategory],
                    type: Operation.insert,
                    insertTable: Tables.functionBlock
                }

                const {varsStmts, evsStmts, evVarsStmt, newEdsStmts, fbEdsStmt} = await this.getFbEvsVarsEdStmts(functionBlock,Operation.insert)
                
                const insertIds = await DatabaseUtils.executeTransaction([stmtFunctionBlock,...varsStmts,...evsStmts,...evVarsStmt,...newEdsStmts,fbEdsStmt])
                await this.saveFunctionBlockFiles(functionBlock,fbImplemenationFile)
                response.setExtra({lastInsertedId: insertIds.FunctionBlock})
                res(response)

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Creating Function Block',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    private getFunctionBlockPathFiles = (functionBlock: FunctionBlock) : Promise<FunctionBlockFilePaths> => {

        return new Promise(async (res:Function,rej:Function) => {
            try {
                const queryResult = (await DatabaseUtils.executeStatement('SELECT fbcName from FBCategory WHERE fbcId = ?',[functionBlock.fbFbcId])).result[0]
                if(!queryResult)
                    rej('No category with this id')
                else
                    res(this.buildFunctionBlockFilePathAndFolder(functionBlock.fbType,queryResult.fbcName))

            }
            catch(err) {
                rej(err.toString())
            }

        })

    }

    private saveFunctionBlockFBTFile = (functionBlock: FunctionBlock, filePaths: FunctionBlockFilePaths) : Promise<string> => {

        return new Promise(async (res:Function,rej:Function) => {

            try {
                const fbFile = this.generateFBT(functionBlock)
                res(await Promise.all([saveFile(filePaths.folder,filePaths.fbt, fbFile), saveFile(filePaths._4diacFolder,filePaths.fbt, fbFile)]))
            }
            catch(err) {
                rej(err.toString())
            }

        })

    } 

    private saveFunctionBlockImplFile = (fileB64: string, filePaths: FunctionBlockFilePaths) : Promise<any> => {

        return new Promise(async (res:Function,rej:Function) => {

            try {
                res(await saveFile(filePaths.folder,filePaths.py, fromB64(fileB64)))
            }
            catch(err) {
                rej(err.toString())
            }

        })

    }


    private saveFunctionBlockFiles = (functionBlock: FunctionBlock, fileB64: string, files?: FunctionBlockFilePaths) : Promise<string> => {

        return new Promise(async (res:Function,rej:Function) => {

            try {

                const filePaths = files ? files : await this.getFunctionBlockPathFiles(functionBlock)
                const promisesArray = [this.saveFunctionBlockFBTFile(functionBlock,filePaths),this.saveFunctionBlockImplFile(fileB64,filePaths)]
                const result = await Promise.all(promisesArray)
                res(result)

            }

            catch(err) {
                console.error(err)
                rej(err)
            }

        })

    }

    private generateFBT = (functionBlock: FunctionBlock) : string => {

        const buildElement = (name?: string, elements?:Element[], attributes?: Attributes, type: 'element' | 'doctype' = 'element', doctype?: string) : Element => ({type,name,doctype,elements,attributes})
        
        const getEvents = (events: Event[]) : Element[] => events.map((event:Event) => buildElement('Event',event.eventVariables.map((eventVariable: EventVariable) => buildElement('With',undefined,{Var: eventVariable.evVariableName})),{Name: event.eventName,Type: event.eventType, OpcUa:event.eventOpcua}))

        const getVariables = (variables: Variable[]) : Element[] => variables.map((variable:Variable) => buildElement('VarDeclaration',undefined,{Name: variable.variableName,Type: variable.variableDataType,OpcUa: variable.variableOpcua}))

        const eventInputs : Element = buildElement('EventInputs',getEvents(functionBlock.fbInputEvents))
        const eventOutputs : Element = buildElement('EventOutputs',getEvents(functionBlock.fbOutputEvents))
        
        const variableInputs : Element = buildElement('InputVars',getVariables(functionBlock.fbInputVariables))
        const variableOutputs : Element = buildElement('OutputVars',getVariables(functionBlock.fbOutputVariables))

        const interfaceList : Element = buildElement('InterfaceList',[eventInputs,eventOutputs,variableInputs,variableOutputs])

        let functionBlockJS : Element = {
            declaration: {
                attributes: {
                    version: '1.0',
                    encoding: 'UTF-8',
                    standalone: 'no'
                }
            },
            elements: [
                buildElement(undefined,undefined,undefined,'doctype','FBType SYSTEM "http://www.holobloc.com/xml/LibraryElement.dtd"'),
                {
                    name: 'FBType',
                    attributes: {
                        Name: functionBlock.fbType,
                        OpcUa: functionBlock.fbGeneralCategory
                    },
                    type: 'element',
                    elements: [interfaceList]
                }
            ]
        }

        return js2xml(functionBlockJS,{spaces:2})

    }

    public removeFunctionBlock = (id: number, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res:Function, rej: Function) => {

            let fbData : any

            try {
                const query = 'SELECT fbType, fbcName FROM FunctionBlock JOIN FBCategory ON FunctionBlock.fbFbcId = FBCategory.fbcId WHERE fbId = ?'
                fbData = await DatabaseUtils.executeStatement(query,[id])
                if(!fbData.result.length) {
                    response.setErrorState('No Function Block found')
                    rej(response)
                    return
                }
            }

            catch(err) {
                console.error(err)
                rej(err)
            }

            const files = this.buildFunctionBlockFilePathAndFolder(fbData.result[0].fbType, fbData.result[0].fbcName)

            try {

                const stmt = 'DELETE FROM FunctionBlock WHERE fbId = ?'
                await DatabaseUtils.executeStatement(stmt,[id])
                res(response)

            }
            catch(err) {
                console.error(err)
                rej(err)
            }
            
            finally {

                try {
                    await Promise.all([deleteFile(files.fbtPath),deleteFile(files.pyPath),deleteFile(files.fbt4diacPath)])
                    await deleteDir(files.folder)
                }

                catch(err) {
                    console.error(err)
                }
            }
        })
    }

    public updateFunctionBlock = (id: number, functionBlock: FunctionBlock, response: RequestResponse, fbImplemenationFile?:string) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            const validFunctionBlock = this.validateFunctionBlock(functionBlock)

            if(!validFunctionBlock.valid) {
                response.setErrorState(validFunctionBlock.reason)
                rej(response)
                return
            }

            try {

                const queryCurrentFBs : FunctionBlock[] = (await this.getFunctionBlocks(new RequestResponse())).getResult().filter((fb:FunctionBlock) => fb.fbId === id)
                if(!queryCurrentFBs.length) {

                    response.setErrorState('No function block found with that id')
                    rej(response)
                    return
                }

                functionBlock.fbId = id

                const stmtFunctionBlock : Statement = {
                    sql: 'UPDATE FunctionBlock SET fbType = ?, fbDescription = ? ,fbUserId = ?, fbFbcId = ?, fbGeneralCategory = ? WHERE fbId = ?',
                    params: [functionBlock.fbType, functionBlock.fbDescription, functionBlock.fbUserId, functionBlock.fbFbcId, functionBlock.fbGeneralCategory, id],
                    type: Operation.update,
                } 

                const stmtDeleteVariables : Statement = {
                    sql: 'DELETE FROM Variable WHERE variableFbId = ?',
                    params: [id],
                    type: Operation.delete,
                }

                const stmtDeleteEvents : Statement = {
                    sql: 'DELETE FROM Event WHERE eventFbId = ?',
                    params: [id],
                    type: Operation.delete,
                }

                const stmtDeleteFbEds : Statement = {
                    sql: 'DELETE FROM FunctionBlockExternalDependency WHERE fbedFbId = ?',
                    params: [id],
                    type: Operation.delete
                }

                const {varsStmts, evsStmts, evVarsStmt, newEdsStmts, fbEdsStmt} = await this.getFbEvsVarsEdStmts(functionBlock, Operation.update)

                await DatabaseUtils.executeTransaction([stmtFunctionBlock,stmtDeleteVariables,stmtDeleteEvents,...varsStmts,...evsStmts,...evVarsStmt, ...newEdsStmts,stmtDeleteFbEds, fbEdsStmt])
                
                const filePaths = await this.getFunctionBlockPathFiles(functionBlock)
                
                await this.saveFunctionBlockFBTFile(functionBlock,filePaths)
                if(fbImplemenationFile) 
                    await this.saveFunctionBlockImplFile(fbImplemenationFile, filePaths)
                
                const oldFb : FunctionBlock = queryCurrentFBs[0]

                if((functionBlock.fbType !== oldFb.fbType) || (functionBlock.fbFbcId !== oldFb.fbFbcId)) {

                    const oldFilePaths = await this.getFunctionBlockPathFiles(oldFb)

                    if(!fbImplemenationFile) 
                        await createFileCopy(oldFilePaths.pyPath,filePaths.folder,filePaths.py)
                    
                    await Promise.all([deleteFile(oldFilePaths.pyPath), deleteFile(oldFilePaths.fbtPath), deleteFile(oldFilePaths.fbt4diacPath)])
                    await deleteDir(oldFilePaths.folder)

                }

                res(response)

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Updating Function Block',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    private getFbEvsVarsEdStmts = (functionBlock: FunctionBlock, type: Operation.insert | Operation.update) : Promise<{varsStmts: Statement[], evsStmts: Statement[], evVarsStmt: Statement[], newEdsStmts: Statement[], fbEdsStmt:Statement}> => {

        return new Promise(async (res: Function, rej:Function) => {

            try {

                let existingDependencies : ExternalDependency[] = []

                const dependenciesNames = functionBlock.fbExternalDependencies.map((ed:ExternalDependency) => ed.edName)

                if(functionBlock.fbExternalDependencies.length) {

                    const query = `SELECT * FROM ExternalDependency WHERE edName IN (?)`
                    const queryResult = await DatabaseUtils.executeStatement(query,[dependenciesNames])
                    existingDependencies = queryResult.result

                }


                let existingDependenciesNames = existingDependencies.map((ed: ExternalDependency) => ed.edName)
                let newDependencies : ExternalDependency[] = functionBlock.fbExternalDependencies.filter((ed:ExternalDependency) => !existingDependenciesNames.includes(ed.edName))
                
                const varsStmts : Statement[] = functionBlock.fbInputVariables.concat(functionBlock.fbOutputVariables).map((variable: Variable) => ({
                    sql: 'INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES(?,?,?,?,?)',
                    params: [variable.variableName,variable.variableOpcua,variable.variableInoutType,variable.variableDataType,functionBlock.fbId],
                    type: Operation.insert,
                    insertTable: Tables.variable,
                    
                    lastInsertedId: 
                        type === Operation.insert 
                        ? {
                            tables: [Tables.functionBlock],
                            indexes: [4]
                        }
                        : undefined
                }))

                const evsStmts : Statement[] = functionBlock.fbInputEvents.concat(functionBlock.fbOutputEvents).map((event: Event) => ({
                    sql: 'INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES(?,?,?,?,?)',
                    params: [event.eventName,event.eventType,event.eventOpcua,event.eventInoutType,functionBlock.fbId],
                    type: Operation.insert,
                    insertTable: Tables.event,
                    lastInsertedId: 
                        type === Operation.insert 
                        ? {
                            tables: [Tables.functionBlock],
                            indexes: [4]
                        }
                        : undefined
                }))

                const evVarsStmt : Statement[] = functionBlock.fbInputEvents
                    .concat(functionBlock.fbOutputEvents)
                    .reduce((acc: EventVariable[], ev: Event) => acc.concat(ev.eventVariables),[])
                    .map((evar: EventVariable) => ({

                        sql: `INSERT INTO EventVariable(evEventId,evVariableId) 
                                SELECT Event.eventId,Variable.variableId 
                                FROM Event,Variable 
                                WHERE Event.eventName = ? and Variable.variableName = ? and Event.eventFbId = ? AND Variable.variableFbId = ?`,
                        params: [evar.evEventName,evar.evVariableName,functionBlock.fbFbcId,functionBlock.fbId],
                        type: Operation.insert,
                        lastInsertedId: 
                            type === Operation.insert 
                            ? {
                                tables: [Tables.functionBlock,Tables.functionBlock],
                                indexes: [2,3]
                            }
                            : undefined
                }))

                const newEdsStmts : Statement[] = newDependencies.map((ed: ExternalDependency) => ({

                    sql: 'INSERT INTO ExternalDependency(edName) VALUES(?)',
                    params: [ed.edName],
                    type: Operation.insert

                }))

                const fbEdsStmt : Statement = {

                    sql: `INSERT INTO FunctionBlockExternalDependency(fbedEdId,fbedFbId) 
                            SELECT edId, ? 
                            FROM ExternalDependency 
                            WHERE BINARY edName IN (?)`,
                    params:[functionBlock.fbId,dependenciesNames.length ? dependenciesNames : ['']],
                    type: Operation.insert,
                    lastInsertedId: 
                    type === Operation.insert
                        ? {
                            tables: [Tables.functionBlock],
                            indexes: [0]
                        }
                        : undefined

                }
                res({varsStmts,evsStmts,evVarsStmt,newEdsStmts,fbEdsStmt})

            }
            catch(err) {
                rej(err.toString())
            }
        })

    }

    public getFunctionBlockCategories = (response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {

                const ctgQuery : string = 'SELECT * FROM FBCategory'
                const result = await DatabaseUtils.executeStatement(ctgQuery)

                const functionBlocks : {fbType:string,fbFbcId:number}[] = (await this.getFunctionBlocks(new RequestResponse())).getResult().map((fb:FunctionBlock) => ({fbType: fb.fbType, fbFbcId:fb.fbFbcId}))
                
                const categories : FBCategory[] = result.result
                for(let i = 0; i < categories.length; i++) {

                    const category = categories[i]
                    category.functionBlocks = []
                    const inserted = []
                   
                    for(let j = 0; j < functionBlocks.length; j++) {

                        const fb = functionBlocks[j]

                        if(category.fbcId === fb.fbFbcId) {

                            category.functionBlocks.push(fb.fbType)
                            inserted.push(j)
                        }

                    }

                    for(let k = 0; k < inserted.length; k++) {
                        functionBlocks.splice(inserted[k]-k,1)
                    }

                }
                
                response.setResult(categories)
                res(response)
            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Getting FB Categories',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    public createFunctionBlockCategory = (categoryName: string, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {

                const insertCategoryStmt : string = 'Insert INTO FBCategory(fbcName,fbcUserId) VALUES(?,?)'
                const result = await DatabaseUtils.executeStatement(insertCategoryStmt, [categoryName,1])
                response.setExtra({lastInsertedId:result.result.insertId})
                res(response)

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Creating FB Category',GeneralErrors.general.code)
                rej(response)
            }

        })

    }


    public removeFunctionBlockCategory = (id: number, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {

                const oldFbCategory = (await DatabaseUtils.executeStatement('SELECT fbcName FROM FBCategory WHERE fbcId = ?', [id])).result[0]
                if(!oldFbCategory) {
                    response.setErrorState('No category found')
                    rej(response)
                    return
                }

                const deleteCategoryStmt : string = 'DELETE FROM FBCategory WHERE fbcId = ?'
                await DatabaseUtils.executeStatement(deleteCategoryStmt, [id])
                const oldCatFolder = this.functionBlocksFolder + sep + oldFbCategory.fbcName
                const oldCatFolder4Diac = this._4diacFolder + sep + oldFbCategory.fbcName
                await deleteDir(oldCatFolder)
                await deleteDir(oldCatFolder4Diac)
                res(response)

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Deleting FB Category',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    public editFunctionBlockCategory = (id: number, name:string, response: RequestResponse) : Promise<RequestResponse> => {

        return new Promise(async (res: Function, rej: Function) => {

            try {
                
                const oldFbCategory = (await DatabaseUtils.executeStatement('SELECT fbcName FROM FBCategory WHERE fbcId = ?', [id])).result[0]

                if(!oldFbCategory) {
                    response.setErrorState('No category found')
                    rej(response)
                    return
                }

                if(oldFbCategory.fbcName === name) {
                    res(response)
                    return
                }
                
                const updateCategoryStmt : string = 'UPDATE FBCategory SET fbcName = ? WHERE fbcId = ?'
                await DatabaseUtils.executeStatement(updateCategoryStmt, [name,id])


                const oldCatFolder = this.functionBlocksFolder + sep + oldFbCategory.fbcName
                const oldCatFolder4Diac = this._4diacFolder + sep + oldFbCategory.fbcName

                const oldCatFolderStat : {exists: boolean, stats?:Stats} = await getFileStats(oldCatFolder)
                const oldCatFolder4DiacStat  : {exists: boolean, stats?:Stats} = await getFileStats(oldCatFolder4Diac)

                if(oldCatFolderStat.exists && oldCatFolderStat.stats?.isDirectory()) {
                    const newCatFolder = this.functionBlocksFolder + sep + name
                    await renameFileOrFolder(oldCatFolder,newCatFolder)

                }

                if(oldCatFolder4DiacStat.exists && oldCatFolderStat.stats?.isDirectory()) {
                    const newCatFolder4Diac = this._4diacFolder + sep + name
                    await renameFileOrFolder(oldCatFolder4Diac,newCatFolder4Diac)
                }

                res(response)

            }

            catch(error) {
                console.error(error)
                response.setErrorState('Error Updating FB Category',GeneralErrors.general.code)
                rej(response)
            }

        })

    }

    private validateFunctionBlock(fb:FunctionBlock) : {valid: boolean, reason?: string} {

        if(fb.fbType === '')
            return {valid: false, reason: 'Function Block Type not well Formed'}
            
        if(!fb.fbGeneralCategory)
            return {valid: false, reason: 'Function Block General Category not well Formed'}
        
        if(!fb.fbFbcId)
            return {valid: false, reason: 'Function Block Category not well Formed'}

        return  {valid: true, reason: ''}

    }

}

export const functionBlockMainController = new FunctionBlockMainController()
