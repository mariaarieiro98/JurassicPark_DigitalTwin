import * as fs from 'fs'
import {sep} from 'path'

export const secondsNow = (): number => {
	return Math.floor(new Date().getTime() / 1000)
}

export const secondsInADay = 24 * 60 * 60

export const groupBy = (array: any[], key: string, grouped?: string[]) => {

	let groupedObj = array.reduce((acum: any, elem: any) => {
		acum[elem[key]] = acum[elem[key]] || [];
		acum[elem[key]].push(elem);
		return acum;
	}, Object.create(null))


	var result = [];

	for (const keyValue in groupedObj) {
		
		if(!keyValue || keyValue === 'null')
			continue
		
		const value = groupedObj[keyValue]

		let item = {
			[key]: keyValue,
			content: value
		};

		if (grouped) {
			for (const groupedItem of grouped) {
				item = { ...item, [groupedItem]: value[0][groupedItem] }
			}
			item = { ...item, }
		}

		result.push(item)
	}
	
	return result
}

export const fromB64 = (input: string) : Uint8Array =>  {

	const atob = require('atob')

	const b64literal = ';base64,'
	// const dataLiteral = 'data:'
	// const typePos = input.indexOf(dataLiteral)
	const encodePos = input.indexOf(b64literal)
	const dataPos = encodePos + b64literal.length
	
	// const type = input.substr(typePos,encodePos)
	const b64= input.substr(dataPos)

	const content = atob(b64)
		
	let buffer = new ArrayBuffer(content.length)
	const view = new Uint8Array(buffer)

	for(let i = 0; i < content.length; i++) {
		view[i] = content.charCodeAt(i)
	}

	return view

}

export const createDir = (path: fs.PathLike) : Promise<string> => {

	return new Promise((res:Function, rej:Function) => {

		fs.stat(path, (err: NodeJS.ErrnoException, stats: fs.Stats) => {

			if(!err)
				res(`Folder ${path} Already Created.`)
			
			else {

				fs.mkdir(path, {recursive:true}, ((errCreating: NodeJS.ErrnoException) => {

					if(!errCreating) {
						res(`Folder ${path} Created.`)
					}
					else {
						rej(errCreating.message.toString())
					}
				
				}))
			}
		})
	})
}

export const deleteDir = (path: fs.PathLike) : Promise<string> => {

	return new Promise((res:Function, rej:Function) => {

		fs.stat(path, (err: NodeJS.ErrnoException, stats: fs.Stats) => {

			if(err) 
				res(`Folder ${path} does not exist.`)
			else {

				fs.rmdir(path, {}, (err: NodeJS.ErrnoException) => {

					if(!err) {
						res(`Folder ${path} Deleted.`)
					}
					else 
						rej(err.message.toString())

				})

			}
		})

	})

}

export const saveFile = (folderPath:string, fileWithExtension:string, data: string | Buffer | DataView | ArrayBuffer | ArrayBufferView | Uint8Array, options?: any) : Promise<string> =>  {

	return new Promise((res:Function, rej:Function) => {

		const createFile = () => {

			const cleanFolder = folderPath.charAt(folderPath.length-1) !== sep ? folderPath + '/' : folderPath
				
				const filePath = `${cleanFolder}${fileWithExtension}`

				fs.writeFile(filePath, data as string, options, (err:NodeJS.ErrnoException) => {
					
					if(err) {
						rej(err.message.toString())
					}
		
					else
						res(`File ${fileWithExtension} saved at ${folderPath}`)
				})

		}

		createDir(folderPath).then(_ => createFile())

	})

}

export const deleteFile = (filePath: string) : Promise<string> => {

	return new Promise((res:Function, rej:Function) => {

		fs.exists(filePath,(exists: boolean) => {

			if(!exists) {
				res(`File ${filePath} does not exist.`)
				return
			}

			fs.unlink(filePath, (err: NodeJS.ErrnoException) => {
	
				if(err)
					rej(err.message)
	
				else {
					res(`File ${filePath} deleted.`)
				}
	
			})

		})

	})

}

export const createFileCopy = (filePath: string, destinationFolder: string, fileName: string) : Promise<string> => {

	return new Promise((res:Function, rej:Function) => {

		fs.exists(filePath,(exists: boolean) => {

			if(!exists) {
				rej(`File ${filePath} does not exist.`)
				return
			}

			createDir(destinationFolder)

				.finally(() => {

					fs.copyFile(filePath, destinationFolder + '/' + fileName, (err: NodeJS.ErrnoException) => {
			
						if(err) 
							rej(err.message)
						
			
						else 
							res(`File ${filePath} copied to ${destinationFolder}.`)
			
					})

				})


		})

	})

}

export const readConf = () : Promise<any> => {

	return new Promise((res:Function, rej: Function) => {

		const CONF_FILE = '/opt/api/jurassic.config.json'

		fs.readFile(CONF_FILE, (err:NodeJS.ErrnoException, data:Buffer) => {

			if(err) {
				rej(err.toString())
			}
			else {
				res(JSON.parse(data.toString('utf8')))
			}

		})

	})

}

export const appendLineToFile = (data: string, file: string) : Promise<any> => {

	return new Promise((res:Function, rej: Function) => {

		const options = {
			flag: 'a'
		}

		try {
			fs.writeFile(file,data+'\n', options, (err:NodeJS.ErrnoException) => {
				if(err) {
					rej(err.toString())
				}
				else{
					res()
				}
			})
		}

		catch(err) {
			console.error(err)
			rej(err.toString())
		}

	})

}

export const getLinesOfFiles = (file:string) : Promise<string[]> => {

	return new Promise((res:Function, rej: Function) => {

		try {
			fs.readFile(file, (err:NodeJS.ErrnoException, data:any) => {
				if(err) {
					rej(err.toString())
				}
				else{
					//console.log(data.toString())
					res((data.toString() as string).split('\n').filter((s:string) => s !== ''))
				}
			})
		}

		catch(err) {
			console.error(err)
			rej(err.toString())
		}

	})

}

export const renameFileOrFolder = (oldName: string, newName: string) : Promise<any> => {

	return new Promise((res:Function, rej: Function) => {

		try {
			fs.rename(oldName,newName, (err:NodeJS.ErrnoException) => {
				if(err) {
					rej(err.toString())
				}
				else{
					res()
				}
			})
		}

		catch(err) {
			console.error(err)
			rej(err.toString())
		}

	})

}

export const getFileStats = (name: string) : Promise<{exists: boolean, stats?:fs.Stats}> => {

	return new Promise((res:Function, rej: Function) => {

		try {
			fs.stat(name, (err:NodeJS.ErrnoException, stats: fs.Stats) => {
				if(err) {
					res({exists:false})
				}
				else{
					res({exists: true, stats})
				}
			})
		}

		catch(err) {
			console.error(err)
			rej(err.toString())
		}

	})

}

export function startCountdown(seconds) {
	let counter = seconds;
	  
	const interval = setInterval(() => {
	  console.log(counter);
	  counter--;
		
	  if (counter < 0 ) {
		clearInterval(interval);
		console.log('Ding!');
	  }
	}, 1000);
}

