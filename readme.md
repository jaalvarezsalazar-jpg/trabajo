Instrucciones rápidas para desplegar en Netlify y comprobar huella de carbono

- Despliegue en Netlify:
	1. Subir este repositorio a Git (GitHub/GitLab/Bitbucket).
	2. En Netlify, crear un nuevo sitio desde el repositorio.
	3. Como "Publish directory" usar: `trabajoo` (o dejar que Netlify lea `netlify.toml`).
	4. Desplegar; Netlify publicará los archivos estáticos.

- Verificación rápida de huella de carbono (tras desplegar):
	1. Instalar Node (si no está instalado).
	2. Abrir una terminal y ejecutar:

```
cd trabajoo
npm run carbon -- https://your-site.netlify.app
```

	3. El script `scripts/check_carbon.js` consultará la API de WebsiteCarbon y mostrará un resumen.

- Vista local rápida:
	- `cd trabajoo && npm run serve` abrirá el sitio en `http://localhost:8000`.

Si quieres, puedo conectar y configurar un deploy automático o añadir una comprobación automática tras cada deploy.