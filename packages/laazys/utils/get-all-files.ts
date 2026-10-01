import fs from 'fs'
import path from 'path'
import { parse } from 'comment-parser'

const IGNORED_DIRS = ['node_modules', 'dist']

export const getAllFiles = function (
    dirPath: string,
    arrayOfFiles: any = [],
    arrayOfCodeFile: any = [],
    arrayOfJsFile: any = [],
) {
    const files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []
    arrayOfCodeFile = arrayOfCodeFile || []
    arrayOfJsFile = arrayOfJsFile || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            if (IGNORED_DIRS.includes(file) || file.startsWith('.')) return

            // The arrays are filled in place by the recursive call
            getAllFiles(dirPath + '/' + file, arrayOfFiles, arrayOfCodeFile, arrayOfJsFile)
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

// Map comment-parser blocks to the same shape produced by parseMethod for Vue files
function _parseCommentParser(fileContent: any) {
    const _cleanDescription = (description: string) => description.replace(/^-\s*/, '').trim()

    return [...fileContent]
        .filter((block: any) => block?.tags?.some((tagItem: any) => tagItem.tag === 'method'))
        .map((block: any) => {
            const methodTag = block.tags.find((tagItem: any) => tagItem.tag === 'method')
            const returnTags = block.tags.filter((tagItem: any) => ['return', 'returns'].includes(tagItem.tag))

            return {
                name: methodTag.name,
                description: [block.description, methodTag.description].filter(Boolean).join(' ').trim(),
                params: block.tags
                    .filter((tagItem: any) => tagItem.tag === 'param')
                    .map((tagItem: any) => ({
                        name: tagItem.name,
                        type: tagItem.type,
                        description: _cleanDescription(tagItem.description),
                    })),
                return: returnTags.map((tagItem: any) => ({
                    type: tagItem.type,
                    description: [tagItem.name, tagItem.description].filter(Boolean).join(' ').trim(),
                })),
            }
        })
}

export function extractFileInfo(filePath: string) {
    // Normalize Windows separators so it works on every platform
    const { name, ext } = path.parse(filePath.replace(/\\/g, '/'))
    return { name, extension: ext.replace(/^\./, '') }
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
