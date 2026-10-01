import type { File } from '../types/file.type'

export type AnalysisItem = { id: string; label: string; detail?: string }

const NO_STATUS = 'senza stato'

export function analyzeFiles(files: File[]) {
    const components = files.filter((file) => file.extension === 'vue')
    const composables = files.filter((file) => file.extension !== 'vue')

    const statusCounts: Record<string, number> = {}
    for (const component of components) {
        const status = component.status ? component.status.toLowerCase() : NO_STATUS
        statusCounts[status] = (statusCounts[status] ?? 0) + 1
    }

    const deprecated: AnalysisItem[] = components
        .filter((component) => component.status?.toLowerCase() === 'deprecated')
        .map((component) => ({ id: component.id, label: component.name }))

    const missingDescription: AnalysisItem[] = components
        .filter((component) => !component.description)
        .map((component) => ({ id: component.id, label: component.name }))

    const undocumentedMethods: AnalysisItem[] = files.flatMap((file) =>
        (file.methods ?? [])
            .filter((method) => !method.description)
            .map((method) => ({ id: file.id, label: `${method.name}()`, detail: file.name })),
    )

    return {
        components: components.length,
        composables: composables.length,
        statusCounts,
        deprecated,
        missingDescription,
        undocumentedMethods,
    }
}
