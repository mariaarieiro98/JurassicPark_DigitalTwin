import {functionBlockMainController} from '../../controllers/function-block/functionBlockMainController'
import { RequestResponse } from '../../utils/request'
import { FunctionBlock, FBGeneralCategory, InOutType, DataType } from '../../model'
import { DatabaseUtils } from '../../utils/database'
import {exec, ExecException} from 'child_process'


beforeEach(() => {

    exec(`rm -rf ${functionBlockMainController._4diacFolder} ${functionBlockMainController.functionBlocksBackupFolder} ${functionBlockMainController.functionBlocksFolder}`)
    return DatabaseUtils.executeStatement('DELETE FROM FunctionBlock',[])
    
})

afterEach(() => {

    exec(`rm -rf ${functionBlockMainController._4diacFolder} ${functionBlockMainController.functionBlocksBackupFolder} ${functionBlockMainController.functionBlocksFolder}`)
    return DatabaseUtils.executeStatement('DELETE FROM FunctionBlock',[])

})

test('Delete Non Existing Function Block', () => {

    const response = new RequestResponse()

    return functionBlockMainController.removeFunctionBlock(-1,response)
        .then((result) => {throw new Error('Deleted Function Block')})
        .catch((error: RequestResponse) => expect(error.getState().getMessage()).toBe('No Function Block found'))

})

test('Delete a Function Block', () => {

    const fb : FunctionBlock = {

        fbType: "SENSOR_SIMULATOR_3",
        fbDescription: "Simulate a Sensor_3",
        fbGeneralCategory: FBGeneralCategory.sensor,
        fbFbcId: 1,
        fbUserId: 1,
        fbInputVariables: [
            {
                variableName: "OFFSET",
                variableOpcua: "Constant",
                variableInoutType: InOutType.in,
                variableDataType: DataType.dtInt
            }
        ],
        fbOutputVariables: [
            {
                variableName: "VALUE",
                variableOpcua: "Variable",
                variableInoutType: InOutType.out,
                variableDataType: DataType.dtReal
            }
        ],
        fbInputEvents: [
            {
                eventName: "INIT",
                eventType: "Event",
                eventInoutType: InOutType.in,
                eventVariables: []
            },
            {
                eventName: "READ",
                eventType: "Event",
                eventInoutType: InOutType.in,
                eventVariables: []
            }
        ],
        fbOutputEvents: [
            {
                eventName: "INIT_O",
                eventType: "Event",
                eventInoutType: InOutType.out,
                eventVariables: []
            },
            {
                eventName: "READ_O",
                eventType: "Event",
                eventInoutType: InOutType.out,
                eventVariables: [
                    {
                    	evEventName: "READ_O",
                        evVariableName: "VALUE"
                    }
                ]
            }
        ],
        fbExternalDependencies: []
    }

    return functionBlockMainController.createFunctionBlock(fb,'Implementation file test',new RequestResponse())

        .then(async (res: RequestResponse) => {

            const id = (await DatabaseUtils.executeStatement('SELECT fbId FROM FunctionBlock WHERE fbType = ?', [fb.fbType])).result[0].fbId
            
            return functionBlockMainController.removeFunctionBlock(id,new RequestResponse())

                .then(async (result:RequestResponse) => {

                    const totalWithId = (await DatabaseUtils.executeStatement('SELECT Count(*) as total FROM FunctionBlock WHERE fbId = ?', [id])).result[0].total
                    const totalEventsWithId = (await DatabaseUtils.executeStatement('SELECT Count(*) as total FROM Event WHERE eventfbId = ?', [id])).result[0].total
                    const totalVariablesWithId = (await DatabaseUtils.executeStatement('SELECT Count(*) as total FROM Variable WHERE variablefbId = ?', [id])).result[0].total
                    
                    expect(totalWithId).toBe(0)
                    expect(totalEventsWithId).toBe(0)
                    expect(totalVariablesWithId).toBe(0)

                })

                .catch((error:RequestResponse) => {
                    console.error(error.getState().getMessage())
                    throw new Error(error.getState().getMessage())

                })

        })

        .catch((error) => {
            throw new Error(error)
        })

})