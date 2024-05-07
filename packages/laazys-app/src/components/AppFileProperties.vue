<script setup lang="ts">
interface IPropType {
    name?: string
}

interface IProp {
    name?: string
    defaultValue?: string
    type?: IPropType
}

interface Props {
    properties?: IProp[]
    label: string
}

const props = withDefaults(defineProps<Props>(), {
    properties: () => [],
    label: 'prop',
})

function getTypeColor(type: string) {
    const typeMap = {
        boolean: 'text-purple-400',
        number: 'text-green-400',
        string: 'text-blue-400',
        default: 'text-black',
    }

    return typeMap[type] !== undefined ? typeMap[type] : typeMap['default']
}
</script>

<template>
    <div v-for="prop in properties" :key="prop.name" class="grid grid-cols-4 gap-[20px]">
        <div class="flex items-center">
            <span class="mr-2 inline-block rounded-lg bg-gray-200 px-2 py-1 text-center text-xs font-medium uppercase">
                {{ label }}
            </span>
            <span class="font-semibold">{{ prop.name }}</span>
        </div>
        <span v-if="prop?.type?.name" class="font-medium" :class="[getTypeColor(prop.type.name)]">{{
            prop.type.name
        }}</span>
        <span>{{ prop?.defaultValue }}</span>
    </div>
</template>
