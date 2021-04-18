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
const mysql = require("mysql2");
//create,edit,delete,get
class DatabaseUtils {
}
exports.DatabaseUtils = DatabaseUtils;
DatabaseUtils.connectionProps = {
    host: process.env.MYSQL_DATABASE_HOST,
    password: process.env.MYSQL_DATABASE_PWD,
    database: process.env.MYSQL_DATABASE_NAME,
    port: parseInt(process.env.MYSQL_DATABASE_PORT),
    user: process.env.MYSQL_DATABASE_USER,
    charset: 'utf8'
};
DatabaseUtils.getConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((res, rej) => {
        let connection = mysql.createConnection(DatabaseUtils.connectionProps);
        connection.connect(err => {
            if (err) {
                connection.end();
                rej(err);
            }
            else
                res(connection);
        });
    });
});
DatabaseUtils.executeStatement = (statement, params) => {
    return new Promise((res, rej) => {
        DatabaseUtils.getConnection()
            .then((connection) => {
            connection.query(statement, params, (err, result, fields) => {
                connection.end();
                if (err) {
                    rej(err);
                }
                else
                    res({ result: result, fields: fields });
            });
        })
            .catch(error => rej(error));
    });
};
DatabaseUtils.executeTransaction = (statements) => {
    return new Promise((res, rej) => {
        DatabaseUtils.getConnection()
            .then((connection) => {
            connection.beginTransaction((error) => __awaiter(void 0, void 0, void 0, function* () {
                if (error) {
                    rej(error);
                    connection.end();
                    return;
                }
                DatabaseUtils.executeNestedStatement(connection, statements, 0, {})
                    .then(result => {
                    res(result);
                })
                    .catch(error => rej(error))
                    .finally(() => connection.end());
            }));
        })
            .catch(error => rej(error));
    });
};
DatabaseUtils.executeNestedStatement = (connection, statements, index, lastInsertedIds) => {
    return new Promise((res, rej) => {
        if (!statements[index]) {
            connection.commit((err) => {
                if (err) {
                    console.error('error during commit');
                    return connection.rollback(() => {
                        console.error('rolling back due to err');
                        rej(err);
                    });
                }
                else {
                    res(lastInsertedIds);
                }
            });
        }
        else {
            if (statements[index].lastInsertedId) {
                for (let i = 0; i < statements[index].lastInsertedId.indexes.length; i++) {
                    let paramIndex = statements[index].lastInsertedId.indexes[i];
                    statements[index].params[paramIndex] = lastInsertedIds[statements[index].lastInsertedId.tables[i]];
                }
            }
            connection.query(statements[index].sql, statements[index].params, (error, results, fields) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('rolling back due to err');
                        console.error('statement with error: ');
                        console.error(statements[index]);
                        rej(error);
                    });
                }
                if (statements[index].type === Operation.insert && statements[index].insertTable) {
                    lastInsertedIds[statements[index].insertTable] = results.insertId;
                }
                res(DatabaseUtils.executeNestedStatement(connection, statements, index + 1, lastInsertedIds));
            });
        }
    });
};
var Operation;
(function (Operation) {
    Operation["insert"] = "insert";
    Operation["query"] = "query";
    Operation["delete"] = "delete";
    Operation["update"] = "update";
})(Operation = exports.Operation || (exports.Operation = {}));
//# sourceMappingURL=database.js.map