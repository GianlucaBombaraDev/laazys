export type PropTypes =
    'boolean' | 'number' | 'string' | 'object' | 'array' | 'null' | 'undefined' | 'function' | 'symbol' | 'bigint'

export type IProp = {
    name: string
    // vue-docgen-api shape, e.g. { func: false, value: "false" }
    defaultValue?: { func?: boolean; value: string }
    type?: { name: PropTypes }
}

export type File = {
    id: string
    name: string
    path: string
    extension: string
    description?: string
    requires?: string
    status?: string
    props?: IProp[]
    slots?: IProp[]
    events?: IProp[]
    methods?: IProp[]
    sourceCode?: string
}
