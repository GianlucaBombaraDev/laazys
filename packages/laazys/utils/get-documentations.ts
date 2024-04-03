// @ts-ignore
import { getAllFiles } from './get-all-files'
import path from 'path'
import vueDocs from 'vue-docgen-api'
import { fileURLToPath } from 'url'

const _parseRequires = (text: string) =>
    text
        .replaceAll('\r', '')
        .replace(/@requires */, '')
        .replace(/^[*\n ]*/, '')
        .replace(/[*\n ]*$/, '')
        .replaceAll(/\n *\* +/g, ' ')

export async function getDocumentation(pathDoc: string) {
    let list = []

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    // @ts-ignore
    const fileNames = await getAllFiles(path.resolve(__dirname, pathDoc))

    for (let file of fileNames) {
        try {
            const docVue = await vueDocs
                .parse(file, {
                    // @ts-ignore
                    addScriptHandlers: [
                        function (documentation, componentDefinition, astPath, opt) {
                            // @ts-ignore
                            const componentDoc = astPath.tokens
                                .filter((token) => token.type === 'CommentBlock')
                                .find(() => true)
                            if (componentDoc) {
                                // @requires
                                const text = componentDoc.value.split('@requires')
                                if (text[1] !== undefined) documentation.set('requires', _parseRequires(text[1]))
                            }
                        },
                    ],
                })
                .then((ci) => ci)
            list.push({
                path: file,
                description: docVue.description,
                requires: docVue?.requires,
                props: docVue.props,
                events: docVue.events,
                slots: docVue.slots,
                methods: docVue.methods,
            })
        } catch (error) {
            console.error(error)
        }
    }

    return list
}
