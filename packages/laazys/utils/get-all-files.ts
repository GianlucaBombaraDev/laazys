import fs from 'fs'
import path from 'path'
import { parse } from 'comment-parser'

export const getAllFiles = function (
    dirPath: string,
    arrayOfFiles: any = [],
    arrayOfCodeFile: any = [],
    arrayOfJsFile: any = [],
) {
    let files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []
    arrayOfCodeFile = arrayOfCodeFile || []
    arrayOfJsFile = arrayOfJsFile || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles, arrayOfCodeFile, arrayOfJsFile)
        } else {
            if (path.extname(file) === '.vue') {
                arrayOfFiles.push(path.join(dirPath, '/', file))
                const fileContent = fs.readFileSync(path.join(dirPath, '/', file), { encoding: 'utf8' })
                arrayOfCodeFile.push({ path: path.join(dirPath, '/', file), file: fileContent })
            }

            if (path.extname(file) === '.js') {
                const filePath = path.join(dirPath, '/', file)
                const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
                const CommentParser = parse(fileContent)
                const fileInfo = extractFileInfo(filePath)
                arrayOfJsFile.push({
                    id: generateRandomHash(),
                    path: filePath,
                    name: fileInfo.name,
                    extension: fileInfo.extension,
                    code: fileContent,
                    methods: _parseCommentParser(CommentParser),
                })
            }
        }
    })

    return { paths: arrayOfFiles, files: arrayOfCodeFile, js: arrayOfJsFile }
}

function _parseCommentParser(fileContent: any) {
    let response = [...fileContent]

    response = response.map((method) => ({
        description: method.description,
        tags:
            method?.tags &&
            method?.tags.map((tagItem: any) => ({
                tag: tagItem.tag,
                name: tagItem.name,
                description: tagItem.description,
                type: tagItem.type,
            })),
    }))

    return response
}

export function extractFileInfo(path: string) {
    // Split the path by backslashes to get the parts
    const parts = path.split('\\')
    // Get the last part, which should be "useProva.js"
    const fileNameWithExt = parts[parts.length - 1]
    // Split the file name by dot to separate the name from the extension
    const [name, extension] = fileNameWithExt.split('.')
    // Return the object with the extracted information
    return { name, extension }
}

export function generateRandomHash() {
    const seed = new Date().getTime().toString() + Math.random().toString()
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
}
