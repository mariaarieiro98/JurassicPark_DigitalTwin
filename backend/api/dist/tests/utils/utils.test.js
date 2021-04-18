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
const utils_1 = require("../../utils/utils");
const fs_1 = require("fs");
const mainFolder = './test-results/';
const folderPathNoSep = `${mainFolder}testDirectory`;
const folderPathSep = `${mainFolder}testDirectory/`;
const fileName = 'test.xml';
const filePath = `${folderPathNoSep}/${fileName}`;
const file = `Hello 
<This is a file>`;
const tempFolderPath = `${mainFolder}temp`;
const tempFileName = `test-temp.xml`;
afterAll(() => utils_1.deleteDir(mainFolder));
test('Create Inexistent Directory', () => {
    return utils_1.createDir(folderPathNoSep)
        .then((result) => {
        expect(result).toBe(`Folder ${folderPathNoSep} Created.`);
    })
        .catch((result) => {
        expect(result).not.toBe(`Folder ${folderPathNoSep} Already Created.`);
    })
        .finally(() => utils_1.deleteDir(folderPathNoSep));
});
test('Create Existing Directory', () => {
    return utils_1.createDir(folderPathNoSep)
        .then(_ => {
        return utils_1.createDir(folderPathNoSep)
            .then((error) => {
            expect(error).toBe(`Folder ${folderPathNoSep} Already Created.`);
        })
            .finally(() => utils_1.deleteDir(folderPathNoSep));
    });
});
test('Save File', (done) => {
    return utils_1.saveFile(folderPathNoSep, fileName, file)
        .then((result) => {
        expect(result).toBe(`File ${fileName} saved at ${folderPathNoSep}`);
        fs_1.readFile(`${folderPathNoSep}/${fileName}`, (err, data) => {
            if (err) {
                throw new Error(err.toString());
            }
            expect(file.length).toBe(data.length);
            for (let i = 0; i < data.length; i++) {
                expect(data[i]).toBe(file.charCodeAt(i));
            }
            done();
        });
    })
        .finally(() => utils_1.deleteFile(`${folderPathNoSep}/${fileName}`).then(_ => utils_1.deleteDir(folderPathNoSep)));
});
test('Save File No sep', (done) => {
    return utils_1.saveFile(folderPathSep, fileName, file)
        .then((result) => {
        expect(result).toBe(`File ${fileName} saved at ${folderPathSep}`);
        fs_1.readFile(`${folderPathNoSep}/${fileName}`, (err, data) => {
            if (err) {
                throw new Error(err.toString());
            }
            expect(file.length).toBe(data.length);
            for (let i = 0; i < data.length; i++) {
                expect(data[i]).toBe(file.charCodeAt(i));
            }
            done();
        });
    })
        .finally(() => utils_1.deleteFile(`${folderPathSep}${fileName}`).then(_ => utils_1.deleteDir(folderPathSep)));
});
test('Delete Existing File', () => {
    return utils_1.saveFile(folderPathNoSep, fileName, file)
        .then(_ => {
        return utils_1.deleteFile(filePath)
            .then((result) => {
            expect(result).toBe(`File ${filePath} deleted.`);
        })
            .catch((result) => {
            expect(result).not.toBe(`File ${filePath} does not exist`);
        })
            .finally(() => utils_1.deleteDir(folderPathNoSep));
    });
});
test('Delete Non Existing File', () => {
    return utils_1.deleteFile(filePath)
        .then((result) => {
        expect(result).toBe(`File ${filePath} does not exist.`);
    });
});
test('Copy File', (done) => {
    return utils_1.saveFile(folderPathNoSep, fileName, file)
        .then((result) => {
        return utils_1.createFileCopy(filePath, tempFolderPath, tempFileName)
            .then((result) => {
            expect(result).toBe(`File ${filePath} copied to ${tempFolderPath}.`);
            fs_1.readFile(`${folderPathNoSep}/${fileName}`, (err, data) => {
                if (err) {
                    throw new Error(err.toString());
                }
                fs_1.readFile(`${tempFolderPath}/${tempFileName}`, (errCopiedFile, dataCopiedFile) => {
                    expect(file.length).toBe(data.length);
                    expect(dataCopiedFile.length).toBe(data.length);
                    for (let i = 0; i < data.length; i++) {
                        expect(data[i]).toBe(file.charCodeAt(i));
                        expect(data[i]).toBe(dataCopiedFile[i]);
                    }
                    done();
                });
            });
        })
            .catch((result) => {
            expect(result).not.toBe(`File ${filePath} does not exist.`);
        })
            .finally(() => __awaiter(void 0, void 0, void 0, function* () {
            yield utils_1.deleteFile(`${folderPathNoSep}/${fileName}`);
            yield utils_1.deleteDir(folderPathNoSep);
            yield utils_1.deleteFile(`${tempFolderPath}/${tempFileName}`);
            yield utils_1.deleteDir(tempFolderPath);
        }));
    })
        .catch((result) => console.error(result));
});
test('Copy Inexistent File', () => {
    return utils_1.createFileCopy('./does-not-exist', tempFolderPath, tempFileName)
        .then((error) => expect(error).not.toBe(`File ./does-not-exist copied to ${tempFolderPath}.`))
        .catch((result) => expect(result).toBe('File ./does-not-exist does not exist.'));
});
//# sourceMappingURL=utils.test.js.map