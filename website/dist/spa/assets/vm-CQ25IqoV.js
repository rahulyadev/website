import{a5 as z,c as v,l as B,h as u,g as _}from"./index-BsdEXZvk.js";function M(t,e){return t!==void 0&&t()||e}function H(t,e){if(t!==void 0){const r=t();if(r!=null)return r.slice()}return e}function c(t,e){return t!==void 0?e.concat(t()):e}function V(t,e){return t===void 0?e:e!==void 0?e.concat(t()):t()}function A(t,e){const r=t.style;for(const a in e)r[a]=e[a]}function G(t){if(t==null)return;if(typeof t=="string")try{return document.querySelector(t)||void 0}catch{return}const e=z(t);if(e)return e.$el||e}const j={xs:18,sm:24,md:32,lg:38,xl:46},k={size:String};function q(t,e=j){return v(()=>t.size!==void 0?{fontSize:t.size in e?`${e[t.size]}px`:t.size}:null)}const m="0 0 24 24",h=t=>t,d=t=>`ionicons ${t}`,b={"mdi-":t=>`mdi ${t}`,"icon-":h,"bt-":t=>`bt ${t}`,"eva-":t=>`eva ${t}`,"ion-md":d,"ion-ios":d,"ion-logo":d,"iconfont ":h,"ti-":t=>`themify-icon ${t}`,"bi-":t=>`bootstrap-icons ${t}`},x={o_:"-outlined",r_:"-round",s_:"-sharp"},S={sym_o_:"-outlined",sym_r_:"-rounded",sym_s_:"-sharp"},F=new RegExp("^("+Object.keys(b).join("|")+")"),I=new RegExp("^("+Object.keys(x).join("|")+")"),y=new RegExp("^("+Object.keys(S).join("|")+")"),C=/^[Mm]\s?[-+]?\.?\d/,D=/^img:/,O=/^svguse:/,Q=/^ion-/,U=/^(fa-(sharp|solid|regular|light|brands|duotone|thin)|[lf]a[srlbdk]?) /,J=B({name:"QIcon",props:{...k,tag:{type:String,default:"i"},name:String,color:String,left:Boolean,right:Boolean},setup(t,{slots:e}){const{proxy:{$q:r}}=_(),a=q(t),$=v(()=>"q-icon"+(t.left===!0?" on-left":"")+(t.right===!0?" on-right":"")+(t.color!==void 0?` text-${t.color}`:"")),s=v(()=>{let o,n=t.name;if(n==="none"||!n)return{none:!0};if(r.iconMapFn!==null){const i=r.iconMapFn(n);if(i!==void 0)if(i.icon!==void 0){if(n=i.icon,n==="none"||!n)return{none:!0}}else return{cls:i.cls,content:i.content!==void 0?i.content:" "}}if(C.test(n)===!0){const[i,f=m]=n.split("|");return{svg:!0,viewBox:f,nodes:i.split("&&").map(p=>{const[E,R,w]=p.split("@@");return u("path",{style:R,d:E,transform:w})})}}if(D.test(n)===!0)return{img:!0,src:n.substring(4)};if(O.test(n)===!0){const[i,f=m]=n.split("|");return{svguse:!0,src:i.substring(7),viewBox:f}}let l=" ";const g=n.match(F);if(g!==null)o=b[g[1]](n);else if(U.test(n)===!0)o=n;else if(Q.test(n)===!0)o=`ionicons ion-${r.platform.is.ios===!0?"ios":"md"}${n.substring(3)}`;else if(y.test(n)===!0){o="notranslate material-symbols";const i=n.match(y);i!==null&&(n=n.substring(6),o+=S[i[1]]),l=n}else{o="notranslate material-icons";const i=n.match(I);i!==null&&(n=n.substring(2),o+=x[i[1]]),l=n}return{cls:o,content:l}});return()=>{const o={class:$.value,style:a.value,"aria-hidden":"true",role:"presentation"};return s.value.none===!0?u(t.tag,o,M(e.default)):s.value.img===!0?u(t.tag,o,c(e.default,[u("img",{src:s.value.src})])):s.value.svg===!0?u(t.tag,o,c(e.default,[u("svg",{viewBox:s.value.viewBox||"0 0 24 24"},s.value.nodes)])):s.value.svguse===!0?u(t.tag,o,c(e.default,[u("svg",{viewBox:s.value.viewBox},[u("use",{"xlink:href":s.value.src})])])):(s.value.cls!==void 0&&(o.class+=" "+s.value.cls),u(t.tag,o,c(e.default,[s.value.content])))}}});function K(t){return t.appContext.config.globalProperties.$router!==void 0}function L(t){return t.isUnmounted===!0||t.isDeactivated===!0}export{J as Q,M as a,H as b,A as c,q as d,V as e,L as f,G as g,c as h,j as i,k as u,K as v};