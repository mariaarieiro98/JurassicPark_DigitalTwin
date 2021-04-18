import * as mysql from 'mysql2'
import { Connection } from 'mysql'


//create,edit,delete,get

export class DatabaseUtils {

    static connectionProps = {
        host: process.env.MYSQL_DATABASE_HOST,
        password: process.env.MYSQL_DATABASE_PWD,
        database: process.env.MYSQL_DATABASE_NAME,
        port: parseInt(process.env.MYSQL_DATABASE_PORT),
        user: process.env.MYSQL_DATABASE_USER,
        charset: 'utf8'
    }

    static getConnection = async () : Promise<any>  => {

        return new Promise((res : Function, rej : Function) => {

            let connection = mysql.createConnection(DatabaseUtils.connectionProps)
            
            connection.connect(err => {

                if(err) {
                    connection.end()
                    rej(err)
                }

                else
                    res(connection)

            })

        })        
    }

    static executeStatement = (statement: string, params?: any[]) : Promise<any> => {

        return new Promise((res: Function, rej: Function) : void => {

            DatabaseUtils.getConnection()
            
            .then((connection : Connection) => {

                connection.query(statement,params,(err,result,fields) => {
    
                    connection.end()
                
                    if(err) {
                        rej(err)
                    }
                    else
                        res({result: result, fields:fields})
                })

            })

            .catch(error => rej(error))

        })

    }

    static executeTransaction = (statements: Statement[]) : Promise<any> => {

        return new Promise((res: Function, rej: Function) : void => {

            DatabaseUtils.getConnection()
            
            .then((connection : Connection) => {

                connection.beginTransaction(async (error: any) => {

                    if(error) {
                        rej(error)
                        connection.end()
                        return
                    }

                    DatabaseUtils.executeNestedStatement(connection,statements,0,{})

                        .then(result => {

                            res(result)

                        }) 

                        .catch(error => rej(error))

                        .finally(() => connection.end())
   
                })

            })

            .catch(error => rej(error))

        })
            
    }

    private static executeNestedStatement = (connection: Connection, statements: Statement[], index: number, lastInsertedIds: any) => {

        return new Promise((res:Function, rej: Function) => {

            if(!statements[index]) {
    
                connection.commit((err) => {
    
                    if(err) {
                        console.error('error during commit')
                        return connection.rollback(() => {
                            console.error('rolling back due to err')
                            rej(err)
                        })

                    }

                    else {
                        res(lastInsertedIds)
                    }

                })
    
            }

            else {

                
                if(statements[index].lastInsertedId) {
                                        
                    for(let i = 0; i < statements[index].lastInsertedId.indexes.length; i++) {

                        let paramIndex = statements[index].lastInsertedId.indexes[i]
                        statements[index].params[paramIndex] = lastInsertedIds[statements[index].lastInsertedId.tables[i]]
                    }
                }

                connection.query(statements[index].sql, statements[index].params, (error, results, fields) => {
                    
                    if (error) {
                      
                        return connection.rollback(() => {
                            console.error('rolling back due to err')
                            console.error('statement with error: ')
                            console.error(statements[index])
                            rej(error)

                      })
                    }

                    if(statements[index].type === Operation.insert && statements[index].insertTable) {

                        lastInsertedIds[statements[index].insertTable] = results.insertId

                    }

                    res(DatabaseUtils.executeNestedStatement(connection,statements,index+1,lastInsertedIds))

                })

            }

        })


    }

}

export enum Operation {
    insert = 'insert',
    query = 'query',
    delete = 'delete',
    update = 'update'
}

export interface Statement {

    sql: string,
    params: any[],
    type: Operation
    insertTable?: string
    lastInsertedId? : LastInsertedId
    
}

export interface LastInsertedId {
    indexes: number[],
    tables: string[]
}