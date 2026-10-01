// @ts-ignore
import { getAllFiles, extractFileInfo, generateRandomHash } from './get-all-files'
import path from 'path'
import vueDocs from 'vue-docgen-api'
import { parseDescription, parseRequires, parseStatus, parseProvide, parseMethod } from './doc-parser'
import prettier from 'prettier'

const tagToParser = {
    '@requires': parseRequires,
    '@status': parseStatus,
    '@description': parseDescription,
    '@method': parseMethod,
    '@provide': parseProvide,
}

export async function getDocumentation(pathDoc: string) {
    const list = []

    // @ts-ignore
    const fileNames = await getAllFiles(path.resolve(process.cwd(), pathDoc))

    for (const file of fileNames.paths) {
        try {
            const docVue = await vueDocs.parse(file, {
                // @ts-ignore
                addScriptHandlers: [
                    (documentation, componentDefinition, astPath) => _parseList(astPath, documentation),
                ],
            })
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
    // A component can document several methods, so they are collected instead of overwritten
    const customMethods: any[] = []

    componentDoc.forEach((cmp: any) => {
        // Iterate over each tag-parser pair in the mapping
        Object.entries(tagToParser).forEach(([tag, parser]) => {
            // Check if the component value includes the tag and act accordingly
            if (cmp.value.includes(tag)) {
                // Extract the key from the tag (e.g., '@requires' => 'requires')
                const key = tag.substring(1) // Removes the '@' at the beginning
                if (key === 'method') customMethods.push(parser(cmp.value))
                else documentation.set(key, parser(cmp.value))
            }
        })
    })

    if (customMethods.length) documentation.set('customMethods', customMethods)
}

async function _generateSourceCode(fileName: string, properties: any) {
    if (!properties.props?.length && !properties.slots?.length && !properties.events?.length) return

    const componentCodeSection = (type: string) => {
        let response = ``
        ;(properties[type] || []).forEach((prop: any) => {
            if (type === 'slots') response += `<slot name="${prop.name}"></slot>`
            if (type === 'props') response += `:${prop.name}=""`
            if (type === 'events') response += `@${prop.name}="() => {}"`
        })

        return response
    }

    const componentCode = `<${fileName} ${componentCodeSection('props')} ${componentCodeSection('events')}${properties.slots?.length ? `>${componentCodeSection('slots')}</${fileName}>` : '/>'}`

    // The vue parser is built into Prettier 3
    const formattedCode = await prettier.format(componentCode, { parser: 'vue' })

    return formattedCode
}

async function _generateList(docVue: any, fileNames: any, file: any) {
    const { tags, description, requires, status, props, events, slots, methods, customMethods, provide } = docVue
    // fileNames.files holds every .vue path, so the lookup always succeeds
    const fileCode = fileNames.files.find((fileItem: any) => fileItem.path === file).file
    const fileInfo = extractFileInfo(file)
    const sourceCode = await _generateSourceCode(fileInfo.name, { slots, props, events })

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
        methods: methods || customMethods ? [...(methods || []), ...(customMethods || [])] : undefined,
        provide,
    }
}
