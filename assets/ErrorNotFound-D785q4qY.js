import{c as i,l as A,h as r,r as z,m as U,a1 as X,C as J,g as Y,G as f,D as N,V as Z,a2 as p,q as ee,d as te,_ as ne,z as ae,A as le,N as $,f as ue}from"./index-BnXm-7U-.js";import{i as M,u as ie,d as re,Q as O,h as oe}from"./vm-Bl0JMM3e.js";import{R as se}from"./Ripple-VjN0Wpe1.js";import{b as ce,a as de}from"./use-router-link-DV1AGj2_.js";const ve={size:{type:[String,Number],default:"1em"},color:String};function fe(e){return{cSize:i(()=>e.size in M?`${M[e.size]}px`:e.size),classes:i(()=>"q-spinner"+(e.color?` text-${e.color}`:""))}}const be=A({name:"QSpinner",props:{...ve,thickness:{type:Number,default:5}},setup(e){const{cSize:u,classes:o}=fe(e);return()=>r("svg",{class:o.value+" q-spinner-mat",width:u.value,height:u.value,viewBox:"25 25 50 50"},[r("circle",{class:"path",cx:"50",cy:"50",r:"20",fill:"none",stroke:"currentColor","stroke-width":e.thickness,"stroke-miterlimit":"10"})])}}),K={left:"start",center:"center",right:"end",between:"between",around:"around",evenly:"evenly",stretch:"stretch"},ge=Object.keys(K),me={align:{type:String,validator:e=>ge.includes(e)}};function he(e){return i(()=>{const u=e.align===void 0?e.vertical===!0?"stretch":"left":e.align;return`${e.vertical===!0?"items":"justify"}-${K[u]}`})}const j={none:0,xs:4,sm:8,md:16,lg:24,xl:32},ye={xs:8,sm:10,md:14,lg:20,xl:24},ke=["button","submit","reset"],xe=/[^\s]\/[^\s]/,qe=["flat","outline","push","unelevated"];function _e(e,u){return e.flat===!0?"flat":e.outline===!0?"outline":e.push===!0?"push":e.unelevated===!0?"unelevated":u}const Ee={...ie,...ce,type:{type:String,default:"button"},label:[Number,String],icon:String,iconRight:String,...qe.reduce((e,u)=>(e[u]=Boolean)&&e,{}),square:Boolean,rounded:Boolean,glossy:Boolean,size:String,fab:Boolean,fabMini:Boolean,padding:String,color:String,textColor:String,noCaps:Boolean,noWrap:Boolean,dense:Boolean,tabindex:[Number,String],ripple:{type:[Boolean,Object],default:!0},align:{...me.align,default:"center"},stack:Boolean,stretch:Boolean,loading:{type:Boolean,default:null},disable:Boolean},Se={...Ee,round:Boolean};function Be(e){const u=re(e,ye),o=he(e),{hasRouterLink:h,hasLink:y,linkTag:k,linkAttrs:w,navigateOnClick:C}=de({fallbackTag:"button"}),T=i(()=>{const a=e.fab===!1&&e.fabMini===!1?u.value:{};return e.padding!==void 0?Object.assign({},a,{padding:e.padding.split(/\s+/).map(v=>v in j?j[v]+"px":v).join(" "),minWidth:"0",minHeight:"0"}):a}),P=i(()=>e.rounded===!0||e.fab===!0||e.fabMini===!0),x=i(()=>e.disable!==!0&&e.loading!==!0),S=i(()=>x.value===!0?e.tabindex||0:-1),n=i(()=>_e(e,"standard")),B=i(()=>{const a={tabindex:S.value};return y.value===!0?Object.assign(a,w.value):ke.includes(e.type)===!0&&(a.type=e.type),k.value==="a"?(e.disable===!0?a["aria-disabled"]="true":a.href===void 0&&(a.role="button"),h.value!==!0&&xe.test(e.type)===!0&&(a.type=e.type)):e.disable===!0&&(a.disabled="",a["aria-disabled"]="true"),e.loading===!0&&e.percentage!==void 0&&Object.assign(a,{role:"progressbar","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":e.percentage}),a}),d=i(()=>{let a;e.color!==void 0?e.flat===!0||e.outline===!0?a=`text-${e.textColor||e.color}`:a=`bg-${e.color} text-${e.textColor||"white"}`:e.textColor&&(a=`text-${e.textColor}`);const v=e.round===!0?"round":`rectangle${P.value===!0?" q-btn--rounded":e.square===!0?" q-btn--square":""}`;return`q-btn--${n.value} q-btn--${v}`+(a!==void 0?" "+a:"")+(x.value===!0?" q-btn--actionable q-focusable q-hoverable":e.disable===!0?" disabled":"")+(e.fab===!0?" q-btn--fab":e.fabMini===!0?" q-btn--fab-mini":"")+(e.noCaps===!0?" q-btn--no-uppercase":"")+(e.dense===!0?" q-btn--dense":"")+(e.stretch===!0?" no-border-radius self-stretch":"")+(e.glossy===!0?" glossy":"")+(e.square?" q-btn--square":"")}),q=i(()=>o.value+(e.stack===!0?" column":" row")+(e.noWrap===!0?" no-wrap text-no-wrap":"")+(e.loading===!0?" q-btn__content--hidden":""));return{classes:d,style:T,innerClasses:q,attributes:B,hasLink:y,linkTag:k,navigateOnClick:C,isActionable:x}}const{passiveCapture:s}=ee;let b=null,g=null,m=null;const Le=A({name:"QBtn",props:{...Se,percentage:Number,darkPercentage:Boolean,onTouchstart:[Function,Array]},emits:["click","keydown","mousedown","keyup"],setup(e,{slots:u,emit:o}){const{proxy:h}=Y(),{classes:y,style:k,innerClasses:w,attributes:C,hasLink:T,linkTag:P,navigateOnClick:x,isActionable:S}=Be(e),n=z(null),B=z(null);let d=null,q,a=null;const v=i(()=>e.label!==void 0&&e.label!==null&&e.label!==""),Q=i(()=>e.disable===!0||e.ripple===!1?!1:{keyCodes:T.value===!0?[13,32]:[13],...e.ripple===!0?{}:e.ripple}),D=i(()=>({center:e.round})),F=i(()=>{const t=Math.max(0,Math.min(100,e.percentage));return t>0?{transition:"transform 0.6s",transform:`translateX(${t-100}%)`}:{}}),V=i(()=>{if(e.loading===!0)return{onMousedown:E,onTouchstart:E,onClick:E,onKeydown:E,onKeyup:E};if(S.value===!0){const t={onClick:R,onKeydown:W,onMousedown:H};if(h.$q.platform.has.touch===!0){const l=e.onTouchstart!==void 0?"":"Passive";t[`onTouchstart${l}`]=G}return t}return{onClick:f}}),I=i(()=>({ref:n,class:"q-btn q-btn-item non-selectable no-outline "+y.value,style:k.value,...C.value,...V.value}));function R(t){if(n.value!==null){if(t!==void 0){if(t.defaultPrevented===!0)return;const l=document.activeElement;if(e.type==="submit"&&l!==document.body&&n.value.contains(l)===!1&&l.contains(n.value)===!1){n.value.focus();const L=()=>{document.removeEventListener("keydown",f,!0),document.removeEventListener("keyup",L,s),n.value!==null&&n.value.removeEventListener("blur",L,s)};document.addEventListener("keydown",f,!0),document.addEventListener("keyup",L,s),n.value.addEventListener("blur",L,s)}}x(t)}}function W(t){n.value!==null&&(o("keydown",t),N(t,[13,32])===!0&&g!==n.value&&(g!==null&&_(),t.defaultPrevented!==!0&&(n.value.focus(),g=n.value,n.value.classList.add("q-btn--active"),document.addEventListener("keyup",c,!0),n.value.addEventListener("blur",c,s)),f(t)))}function G(t){n.value!==null&&(o("touchstart",t),t.defaultPrevented!==!0&&(b!==n.value&&(b!==null&&_(),b=n.value,d=t.target,d.addEventListener("touchcancel",c,s),d.addEventListener("touchend",c,s)),q=!0,a!==null&&clearTimeout(a),a=setTimeout(()=>{a=null,q=!1},200)))}function H(t){n.value!==null&&(t.qSkipRipple=q===!0,o("mousedown",t),t.defaultPrevented!==!0&&m!==n.value&&(m!==null&&_(),m=n.value,n.value.classList.add("q-btn--active"),document.addEventListener("mouseup",c,s)))}function c(t){if(n.value!==null&&!(t!==void 0&&t.type==="blur"&&document.activeElement===n.value)){if(t!==void 0&&t.type==="keyup"){if(g===n.value&&N(t,[13,32])===!0){const l=new MouseEvent("click",t);l.qKeyEvent=!0,t.defaultPrevented===!0&&Z(l),t.cancelBubble===!0&&p(l),n.value.dispatchEvent(l),f(t),t.qKeyEvent=!0}o("keyup",t)}_()}}function _(t){const l=B.value;t!==!0&&(b===n.value||m===n.value)&&l!==null&&l!==document.activeElement&&(l.setAttribute("tabindex",-1),l.focus()),b===n.value&&(d!==null&&(d.removeEventListener("touchcancel",c,s),d.removeEventListener("touchend",c,s)),b=d=null),m===n.value&&(document.removeEventListener("mouseup",c,s),m=null),g===n.value&&(document.removeEventListener("keyup",c,!0),n.value!==null&&n.value.removeEventListener("blur",c,s),g=null),n.value!==null&&n.value.classList.remove("q-btn--active")}function E(t){f(t),t.qSkipRipple=!0}return U(()=>{_(!0)}),Object.assign(h,{click:t=>{S.value===!0&&R(t)}}),()=>{let t=[];e.icon!==void 0&&t.push(r(O,{name:e.icon,left:e.stack!==!0&&v.value===!0,role:"img","aria-hidden":"true"})),v.value===!0&&t.push(r("span",{class:"block"},[e.label])),t=oe(u.default,t),e.iconRight!==void 0&&e.round===!1&&t.push(r(O,{name:e.iconRight,right:e.stack!==!0&&v.value===!0,role:"img","aria-hidden":"true"}));const l=[r("span",{class:"q-focus-helper",ref:B})];return e.loading===!0&&e.percentage!==void 0&&l.push(r("span",{class:"q-btn__progress absolute-full overflow-hidden"+(e.darkPercentage===!0?" q-btn__progress--dark":"")},[r("span",{class:"q-btn__progress-indicator fit block",style:F.value})])),l.push(r("span",{class:"q-btn__content text-center col items-center q-anchor--skip "+w.value},t)),e.loading!==null&&l.push(r(X,{name:"q-transition--fade"},()=>e.loading===!0?[r("span",{key:"loading",class:"absolute-full flex flex-center"},u.loading!==void 0?u.loading():[r(be)])]:null)),J(r(P.value,I.value,l),[[se,Q.value,void 0,D.value]])}}}),we=te({name:"ErrorNotFound",__name:"ErrorNotFound",setup(e,{expose:u}){u();const o={};return Object.defineProperty(o,"__isScriptSetup",{enumerable:!1,value:!0}),o}}),Ce={class:"fullscreen bg-blue text-white text-center q-pa-md flex flex-center"},Te=$("div",{style:{"font-size":"30vh"}}," 404 ",-1),Pe=$("div",{class:"text-h2",style:{opacity:".4"}}," Oops. Nothing here... ",-1);function $e(e,u,o,h,y,k){return ae(),le("div",Ce,[$("div",null,[Te,Pe,ue(Le,{class:"q-mt-xl",color:"white","text-color":"blue",unelevated:"",to:"/",label:"Go Home","no-caps":""})])])}const Oe=ne(we,[["render",$e],["__file","ErrorNotFound.vue"]]);export{Oe as default};