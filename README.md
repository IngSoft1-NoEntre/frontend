# Instalación de Node.js y React con Vite

## 0. Si clonaste el repositorio y ya tenes react, vite y node.js:
Verificar la version de node.js, si es la version 22 no instalarlo nuevamente
```
node -v
nvm install 22
npm install -D vite
npm run dev
```
## 1. Instalar Node.js

Node.js incluye **npm** (Node Package Manager), necesario para instalar dependencias.

### Linux (Ubuntu/Debian)
```
sudo apt update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install 22
```
## 2. Crear un proyecto con Vite + React
```
	npm create vite@latest
```

Elegir las opciones: 

Nombre del proyecto: my-app

Framework: React

Variante: JavaScript o TypeScript

```
	cd my-app
	npm install
```
Ejecutar el servidor de desarrollo:

```
	npm run dev
```
## 3. Vitest como code runner y React Testing Library

```
	npm install -D vitest
	npm install --save-dev @testing-library/react @testing-library/dom
```
En package.json agregar:

```
{
    "scripts": {
	"test": "vitest"
	}
}
```

Correr finalmente:
```
	npm run test
```

## 4. Instalar dependencias adicionales
```
	npm install react-router-dom
```
