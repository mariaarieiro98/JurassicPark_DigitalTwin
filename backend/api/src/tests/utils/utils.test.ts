import { createDir, deleteDir, saveFile, deleteFile,createFileCopy } from "../../utils/utils"
import {readFile} from 'fs'

const mainFolder = './test-results/'
const folderPathNoSep = `${mainFolder}testDirectory`
const folderPathSep = `${mainFolder}testDirectory/`
const fileName = 'test.xml'
const filePath = `${folderPathNoSep}/${fileName}`
const file = 
`Hello 
<This is a file>`

const tempFolderPath = `${mainFolder}temp`
const tempFileName = `test-temp.xml`

afterAll(() => deleteDir(mainFolder))

test('Create Inexistent Directory', () => {

    return createDir(folderPathNoSep)
        .then((result:string) => { 
            expect(result).toBe(`Folder ${folderPathNoSep} Created.`)
        })
        .catch((result:string) => {
            expect(result).not.toBe(`Folder ${folderPathNoSep} Already Created.`)
        })
        .finally(() => deleteDir(folderPathNoSep))
})

        
test('Create Existing Directory', () => {

    return createDir(folderPathNoSep)
        .then(_ => {

            return createDir(folderPathNoSep)
                .then((error: string) => {
                    expect(error).toBe(`Folder ${folderPathNoSep} Already Created.`)
                })
                .finally(() => deleteDir(folderPathNoSep))
        })
})

test('Save File', (done:Function) => {

    return saveFile(folderPathNoSep,fileName,file)

        .then((result:string) => {

            expect(result).toBe(`File ${fileName} saved at ${folderPathNoSep}`)

            readFile(`${folderPathNoSep}/${fileName}`,(err:NodeJS.ErrnoException,data:Buffer) => {

                if(err) {
                    throw new Error(err.toString())
                }

                expect(file.length).toBe(data.length)

                for(let i = 0; i < data.length; i++) {
                    expect(data[i]).toBe(file.charCodeAt(i))
                }
                done()

            })

        })
        .finally(() => deleteFile(`${folderPathNoSep}/${fileName}`).then(_ => deleteDir(folderPathNoSep)))
})

test('Save File No sep', (done:Function) => {

    return saveFile(folderPathSep,fileName,file)

        .then((result:string) => {

            expect(result).toBe(`File ${fileName} saved at ${folderPathSep}`)

            readFile(`${folderPathNoSep}/${fileName}`,(err:NodeJS.ErrnoException,data:Buffer) => {

                if(err) {
                    throw new Error(err.toString())
                }

                expect(file.length).toBe(data.length)

                for(let i = 0; i < data.length; i++) {
                    expect(data[i]).toBe(file.charCodeAt(i))
                }
                done()

            })

        })
        .finally(() => deleteFile(`${folderPathSep}${fileName}`).then(_ => deleteDir(folderPathSep)))
})

test('Delete Existing File', () => {

    return saveFile(folderPathNoSep,fileName,file)
        .then(_ => {

            return deleteFile(filePath)
                .then((result: string) => {
                    expect(result).toBe(`File ${filePath} deleted.`)
                })
                .catch((result:string) => {
                    expect(result).not.toBe(`File ${filePath} does not exist`)
                })
                .finally(() => deleteDir(folderPathNoSep))
        })

})

test('Delete Non Existing File', () => {

    return deleteFile(filePath)
        .then((result: string) => {
            expect(result).toBe(`File ${filePath} does not exist.`)
        })
        
})

test('Copy File', (done:Function) => {

    return saveFile(folderPathNoSep,fileName,file)

        .then((result:string) => {

            return createFileCopy(filePath, tempFolderPath,tempFileName)

                .then((result:string) => {

                    expect(result).toBe(`File ${filePath} copied to ${tempFolderPath}.`)

                    readFile(`${folderPathNoSep}/${fileName}`,(err:NodeJS.ErrnoException,data:Buffer) => {

                        if(err) {
                            throw new Error(err.toString())
                        }

                        readFile(`${tempFolderPath}/${tempFileName}`, (errCopiedFile: NodeJS.ErrnoException, dataCopiedFile:Buffer) => {

                            expect(file.length).toBe(data.length)
                            expect(dataCopiedFile.length).toBe(data.length)
    
                            for(let i = 0; i < data.length; i++) {
                                expect(data[i]).toBe(file.charCodeAt(i))
                                expect(data[i]).toBe(dataCopiedFile[i])
                            }
                            done()
                        })
                    })
                })

                .catch((result:string) => {

                    expect(result).not.toBe(`File ${filePath} does not exist.`)

                })

                .finally(async () => {

                    await deleteFile(`${folderPathNoSep}/${fileName}`)
                    await deleteDir(folderPathNoSep)
                    await deleteFile(`${tempFolderPath}/${tempFileName}`)
                    await deleteDir(tempFolderPath)

                } )

        })

        .catch((result) => console.error(result))

})

test('Copy Inexistent File', () => {

    return createFileCopy('./does-not-exist', tempFolderPath, tempFileName)

        .then((error:string) => expect(error).not.toBe(`File ./does-not-exist copied to ${tempFolderPath}.`))

        .catch((result:string) => expect(result).toBe('File ./does-not-exist does not exist.'))

})