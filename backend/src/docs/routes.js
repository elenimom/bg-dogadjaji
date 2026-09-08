import {Router,static as serveStatic} from 'express';
import swaggerUi from 'swagger-ui-dist';
import {readFileSync} from 'node:fs';
export const specification=JSON.parse(readFileSync(new URL('./openapi.json',import.meta.url),'utf8'));
export function docsRoutes(){
 const r=Router();
 r.get('/openapi.json',(_req,res)=>res.json(specification));
 r.get('/docs/init.js',(_req,res)=>res.type('application/javascript').send(`window.ui=SwaggerUIBundle({
 url:'/api/openapi.json',dom_id:'#swagger-ui',deepLinking:true,validatorUrl:null,
 withCredentials:true, persistAuthorization:false,
 requestInterceptor:function(request){
 const method=(request.method || 'GET').toUpperCase();
 if(!['GET','HEAD','OPTIONS'].includes(method)){
 request.headers=request.headers || {};
 request.headers['X-BG-Request']='1';
 }
 return request;
 }
});`));
 r.get(['/docs','/docs/'],(_req,res)=>res.type('html').send(`<!doctype html><html lang="sr-Latn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BG događaji API</title><link rel="stylesheet" href="/api/docs/assets/swagger-ui.css"></head><body><div id="swagger-ui"></div><script src="/api/docs/assets/swagger-ui-bundle.js"></script><script src="/api/docs/init.js"></script></body></html>`));
 r.use('/docs/assets',serveStatic(swaggerUi.getAbsoluteFSPath(),{index:false}));
 return r;
}
