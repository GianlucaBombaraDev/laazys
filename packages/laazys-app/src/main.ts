//@ts-ignore
import { createApp } from 'vue'
//@ts-ignore
import { createWebHistory, createRouter } from 'vue-router'
//@ts-ignore
import { createPinia } from 'pinia'

import './index.css'
import App from './App.vue'

const routes = [
    { path: '/', name: 'home', component: () => import('./pages/Home.vue') },
    { path: '/file/:id', name: 'file', component: () => import('./pages/File.vue') },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')
