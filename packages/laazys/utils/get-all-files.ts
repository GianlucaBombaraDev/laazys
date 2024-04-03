import fs from 'fs'
import path from 'path'

export const getAllFiles = function (dirPath: string, arrayOfFiles: any = []) {
    let files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
        } else {
            if (path.extname(file) === '.vue') arrayOfFiles.push(path.join(dirPath, '/', file))
        }
    })

    return arrayOfFiles
}
