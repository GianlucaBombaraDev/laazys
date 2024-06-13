export type PropTypes =
    | 'boolean'
    | 'number'
    | 'string'
    | 'object'
    | 'array'
    | 'null'
    | 'undefined'
    | 'function'
    | 'symbol'
    | 'bigint'

export type IProp = {
    name: string
    defaultValue?: string
    type?: { name: PropTypes }
}

export type File = {
    id: string
    name: string
    path: string
    props?: IProp[]
    slots?: IProp[]
    events?: IProp[]
    methods?: IProp[]
    sourceCode: string
}

export type FileBox = {
    name: string
    description?: string
    required?: string
    properties: IProp[]
}

export type Properties = {
    props: IProp[]
    slots: IProp[]
    events: IProp[]
}
