import { createApp } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
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
