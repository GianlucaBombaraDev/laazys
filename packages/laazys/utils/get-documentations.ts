// @ts-ignore
import { getAllFiles, extractFileInfo, generateRandomHash } from './get-all-files'
import path from 'path'
import vueDocs from 'vue-docgen-api'
import { fileURLToPath } from 'url'
import { parseDescription, parseRequires, parseStatus, parseProvide, parseMethod } from './doc-parser'
import prettier from 'prettier'
// @ts-ignore
import parseVue from 'prettier-plugin-vue' // Required for HTML formatting

const tagToParser = {
    '@requires': parseRequires,
    '@status': parseStatus,
    '@description': parseDescription,
    '@method': parseMethod,
    '@provide': parseProvide,
}

export async function getDocumentation(pathDoc: string) {
    let list = []

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const processPath = path.join(process.cwd(), pathDoc)
    // @ts-ignore
    const fileNames = await getAllFiles(path.resolve(__dirname, processPath))

    for (let file of fileNames.paths) {
        try {
            const docVue = await vueDocs
                .parse(file, {
                    // @ts-ignore
                    addScriptHandlers: [
                        (documentation, componentDefinition, astPath, opt) => _parseList(astPath, documentation),
                    ],
                })
                .then((ci) => ci)
            list.push(await _generateList(docVue, fileNames, file))
        } catch (error) {
            console.error(error)
        }
    }

    list.push(...fileNames.js)

    return list
}

function _parseList(astPath: any, documentation: any) {
    const componentDoc = astPath.tokens.filter((token: any) => token.type === 'CommentBlock')
    if (componentDoc) {
        componentDoc.forEach((cmp: any) => {
            // Iterate over each tag-parser pair in the mapping
            Object.entries(tagToParser).forEach(([tag, parser]) => {
                // Check if the component value includes the tag and act accordingly
                if (cmp.value.includes(tag)) {
                    // Extract the key from the tag (e.g., '@requires' => 'requires')
                    const key = tag.substring(1) // Removes the '@' at the beginning
                    documentation.set(key, parser(cmp.value))
                }
            })
        })
    }
}

async function _generateSourceCode(fileName: string, properties: any) {
    if (!properties.props && !properties.slots && !properties.event) return

    const componentCodeSection = (type: string) => {
        let response = ``
        properties[type].forEach((prop: any) => {
            if (type === 'slots') response += `<slot name="${prop.name}"></slot>`
            if (type === 'props') response += `:${prop.name}=""`
            if (type === 'events') response += `@${prop.name}="() => {}"`
        })

        return response
    }

    const componentCode = `<${fileName} ${componentCodeSection('props')} ${componentCodeSection('events')}${properties?.slots ? `>${componentCodeSection('slots')}</${fileName}>` : '/>'}`

    const formattedCode = await prettier.format(componentCode, {
        parser: 'vue',
        plugins: [parseVue],
    })

    return formattedCode
}

async function _generateList(docVue: any, fileNames: any, file: any) {
    const { tags, description, requires, status, props, events, slots, methods, provide } = docVue
    const fileCode = fileNames.files.find((fileItem: any) => fileItem.path === file)?.file
    const fileInfo = extractFileInfo(file)
    const sourceCode =
        fileInfo.extension === 'vue' ? await _generateSourceCode(fileInfo.name, { slots, props, events }) : null

    return {
        id: generateRandomHash(),
        sourceCode: sourceCode,
        path: file,
        name: fileInfo.name,
        extension: fileInfo.extension,
        code: fileCode,
        tags,
        description,
        requires,
        status,
        props,
        events,
        slots,
        methods,
        provide,
    }
}
