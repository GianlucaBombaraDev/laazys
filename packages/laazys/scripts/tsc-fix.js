import fs from 'fs'
import path from 'path'

function addJSToImports(dir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
        const fullPath = path.join(dir, file)
        if (fs.statSync(fullPath).isDirectory()) {
            addJSToImports(fullPath)
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8')
            content = content.replace(/from\s+['"](\..*?)['"]/g, (match, p1) => {
                if (!p1.endsWith('.js')) {
                    return `from '${p1}.js'`
                }
                return match
            })
            fs.writeFileSync(fullPath, content, 'utf8')
        }
    }
}

addJSToImports('./dist')
