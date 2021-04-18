"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path_1 = require("path");
exports.secondsNow = () => {
    return Math.floor(new Date().getTime() / 1000);
};
exports.secondsInADay = 24 * 60 * 60;
exports.groupBy = (array, key, grouped) => {
    let groupedObj = array.reduce((acum, elem) => {
        acum[elem[key]] = acum[elem[key]] || [];
        acum[elem[key]].push(elem);
        return acum;
    }, Object.create(null));
    var result = [];
    for (const keyValue in groupedObj) {
        if (!keyValue || keyValue === 'null')
            continue;
        const value = groupedObj[keyValue];
        let item = {
            [key]: keyValue,
            content: value
        };
        if (grouped) {
            for (const groupedItem of grouped) {
                item = Object.assign(Object.assign({}, item), { [groupedItem]: value[0][groupedItem] });
            }
            item = Object.assign({}, item);
        }
        result.push(item);
    }
    return result;
};
exports.fromB64 = (input) => {
    const atob = require('atob');
    const b64literal = ';base64,';
    // const dataLiteral = 'data:'
    // const typePos = input.indexOf(dataLiteral)
    const encodePos = input.indexOf(b64literal);
    const dataPos = encodePos + b64literal.length;
    // const type = input.substr(typePos,encodePos)
    const b64 = input.substr(dataPos);
    const content = atob(b64);
    let buffer = new ArrayBuffer(content.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < content.length; i++) {
        view[i] = content.charCodeAt(i);
    }
    return view;
};
exports.createDir = (path) => {
    return new Promise((res, rej) => {
        fs.stat(path, (err, stats) => {
            if (!err)
                res(`Folder ${path} Already Created.`);
            else {
                fs.mkdir(path, { recursive: true }, ((errCreating) => {
                    if (!errCreating) {
                        res(`Folder ${path} Created.`);
                    }
                    else {
                        rej(errCreating.message.toString());
                    }
                }));
            }
        });
    });
};
exports.deleteDir = (path) => {
    return new Promise((res, rej) => {
        fs.stat(path, (err, stats) => {
            if (err)
                res(`Folder ${path} does not exist.`);
            else {
                fs.rmdir(path, {}, (err) => {
                    if (!err) {
                        res(`Folder ${path} Deleted.`);
                    }
                    else
                        rej(err.message.toString());
                });
            }
        });
    });
};
exports.saveFile = (folderPath, fileWithExtension, data, options) => {
    return new Promise((res, rej) => {
        const createFile = () => {
            const cleanFolder = folderPath.charAt(folderPath.length - 1) !== path_1.sep ? folderPath + '/' : folderPath;
            const filePath = `${cleanFolder}${fileWithExtension}`;
            fs.writeFile(filePath, data, options, (err) => {
                if (err) {
                    rej(err.message.toString());
                }
                else
                    res(`File ${fileWithExtension} saved at ${folderPath}`);
            });
        };
        exports.createDir(folderPath).then(_ => createFile());
    });
};
exports.deleteFile = (filePath) => {
    return new Promise((res, rej) => {
        fs.exists(filePath, (exists) => {
            if (!exists) {
                res(`File ${filePath} does not exist.`);
                return;
            }
            fs.unlink(filePath, (err) => {
                if (err)
                    rej(err.message);
                else {
                    res(`File ${filePath} deleted.`);
                }
            });
        });
    });
};
exports.createFileCopy = (filePath, destinationFolder, fileName) => {
    return new Promise((res, rej) => {
        fs.exists(filePath, (exists) => {
            if (!exists) {
                rej(`File ${filePath} does not exist.`);
                return;
            }
            exports.createDir(destinationFolder)
                .finally(() => {
                fs.copyFile(filePath, destinationFolder + '/' + fileName, (err) => {
                    if (err)
                        rej(err.message);
                    else
                        res(`File ${filePath} copied to ${destinationFolder}.`);
                });
            });
        });
    });
};
exports.readConf = () => {
    return new Promise((res, rej) => {
        const CONF_FILE = '/opt/api/jurassic.config.json';
        fs.readFile(CONF_FILE, (err, data) => {
            if (err) {
                rej(err.toString());
            }
            else {
                res(JSON.parse(data.toString('utf8')));
            }
        });
    });
};
exports.appendLineToFile = (data, file) => {
    return new Promise((res, rej) => {
        const options = {
            flag: 'a'
        };
        try {
            fs.writeFile(file, data + '\n', options, (err) => {
                if (err) {
                    rej(err.toString());
                }
                else {
                    res();
                }
            });
        }
        catch (err) {
            console.error(err);
            rej(err.toString());
        }
    });
};
exports.getLinesOfFiles = (file) => {
    return new Promise((res, rej) => {
        try {
            fs.readFile(file, (err, data) => {
                if (err) {
                    rej(err.toString());
                }
                else {
                    res(data.toString().split('\n').filter((s) => s !== ''));
                }
            });
        }
        catch (err) {
            console.error(err);
            rej(err.toString());
        }
    });
};
exports.renameFileOrFolder = (oldName, newName) => {
    return new Promise((res, rej) => {
        try {
            fs.rename(oldName, newName, (err) => {
                if (err) {
                    rej(err.toString());
                }
                else {
                    res();
                }
            });
        }
        catch (err) {
            console.error(err);
            rej(err.toString());
        }
    });
};
exports.getFileStats = (name) => {
    return new Promise((res, rej) => {
        try {
            fs.stat(name, (err, stats) => {
                if (err) {
                    res({ exists: false });
                }
                else {
                    res({ exists: true, stats });
                }
            });
        }
        catch (err) {
            console.error(err);
            rej(err.toString());
        }
    });
};
//# sourceMappingURL=utils.js.map