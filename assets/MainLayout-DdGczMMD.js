import{r as x,k as ge,o as Y,l as O,m as G,n as Ae,p as Ve,h as w,g as j,q as me,i as J,t as R,u as re,c as v,w as k,v as Be,x as be,y as le,a as it,_ as se,z as D,A as ye,f as E,B as Ie,C as rt,D as st,E as ut,G as ct,H as dt,I as ft,d as pe,J as Z,K as N,L as Ee,F as He,M as vt,N as W,O as ht,P as Qe,Q as mt,R as gt,S as bt}from"./index-BnXm-7U-.js";import{h as _e,a as we,Q as X}from"./vm-Bl0JMM3e.js";import{s as yt,g as pt,a as _t,b as wt,c as ve,Q as xt,u as he,d as Re}from"./use-timeout-BLSPX_n9.js";import{R as Tt}from"./Ripple-VjN0Wpe1.js";function St(){const e=x(!ge.value);return e.value===!1&&Y(()=>{e.value=!0}),{isHydrated:e}}const Fe=typeof ResizeObserver<"u",ke=Fe===!0?{}:{style:"display:block;position:absolute;top:0;left:0;right:0;bottom:0;height:100%;width:100%;overflow:hidden;pointer-events:none;z-index:-1;",url:"about:blank"},ie=O({name:"QResizeObserver",props:{debounce:{type:[String,Number],default:100}},emits:["resize"],setup(e,{emit:r}){let a=null,t,n={width:-1,height:-1};function u(h){h===!0||e.debounce===0||e.debounce==="0"?l():a===null&&(a=setTimeout(l,e.debounce))}function l(){if(a!==null&&(clearTimeout(a),a=null),t){const{offsetWidth:h,offsetHeight:y}=t;(h!==n.width||y!==n.height)&&(n={width:h,height:y},r("resize",n))}}const{proxy:d}=j();if(d.trigger=u,Fe===!0){let h;const y=P=>{t=d.$el.parentNode,t?(h=new ResizeObserver(u),h.observe(t),l()):P!==!0&&Ve(()=>{y(!0)})};return Y(()=>{y()}),G(()=>{a!==null&&clearTimeout(a),h!==void 0&&(h.disconnect!==void 0?h.disconnect():t&&h.unobserve(t))}),Ae}else{let h=function(){a!==null&&(clearTimeout(a),a=null),C!==void 0&&(C.removeEventListener!==void 0&&C.removeEventListener("resize",u,me.passive),C=void 0)},y=function(){h(),t&&t.contentDocument&&(C=t.contentDocument.defaultView,C.addEventListener("resize",u,me.passive),l())};const{isHydrated:P}=St();let C;return Y(()=>{Ve(()=>{t=d.$el,t&&y()})}),G(h),()=>{if(P.value===!0)return w("object",{class:"q--avoid-card-border",style:ke.style,tabindex:-1,type:"text/html",data:ke.url,"aria-hidden":"true",onLoad:y})}}}}),Ct=O({name:"QFooter",props:{modelValue:{type:Boolean,default:!0},reveal:Boolean,bordered:Boolean,elevated:Boolean,heightHint:{type:[String,Number],default:50}},emits:["reveal","focusin"],setup(e,{slots:r,emit:a}){const{proxy:{$q:t}}=j(),n=J(re,R);if(n===R)return console.error("QFooter needs to be child of QLayout"),R;const u=x(parseInt(e.heightHint,10)),l=x(!0),d=x(ge.value===!0||n.isContainer.value===!0?0:window.innerHeight),h=v(()=>e.reveal===!0||n.view.value.indexOf("F")!==-1||t.platform.is.ios&&n.isContainer.value===!0),y=v(()=>n.isContainer.value===!0?n.containerHeight.value:d.value),P=v(()=>{if(e.modelValue!==!0)return 0;if(h.value===!0)return l.value===!0?u.value:0;const i=n.scroll.value.position+y.value+u.value-n.height.value;return i>0?i:0}),C=v(()=>e.modelValue!==!0||h.value===!0&&l.value!==!0),M=v(()=>e.modelValue===!0&&C.value===!0&&e.reveal===!0),_=v(()=>"q-footer q-layout__section--marginal "+(h.value===!0?"fixed":"absolute")+"-bottom"+(e.bordered===!0?" q-footer--bordered":"")+(C.value===!0?" q-footer--hidden":"")+(e.modelValue!==!0?" q-layout--prevent-focus"+(h.value!==!0?" hidden":""):"")),$=v(()=>{const i=n.rows.value.bottom,g={};return i[0]==="l"&&n.left.space===!0&&(g[t.lang.rtl===!0?"right":"left"]=`${n.left.size}px`),i[2]==="r"&&n.right.space===!0&&(g[t.lang.rtl===!0?"left":"right"]=`${n.right.size}px`),g});function q(i,g){n.update("footer",i,g)}function z(i,g){i.value!==g&&(i.value=g)}function B({height:i}){z(u,i),q("size",i)}function I(){if(e.reveal!==!0)return;const{direction:i,position:g,inflectionPoint:L}=n.scroll.value;z(l,i==="up"||g-L<100||n.height.value-y.value-g-u.value<300)}function m(i){M.value===!0&&z(l,!0),a("focusin",i)}k(()=>e.modelValue,i=>{q("space",i),z(l,!0),n.animate()}),k(P,i=>{q("offset",i)}),k(()=>e.reveal,i=>{i===!1&&z(l,e.modelValue)}),k(l,i=>{n.animate(),a("reveal",i)}),k([u,n.scroll,n.height],I),k(()=>t.screen.height,i=>{n.isContainer.value!==!0&&z(d,i)});const c={};return n.instances.footer=c,e.modelValue===!0&&q("size",u.value),q("space",e.modelValue),q("offset",P.value),G(()=>{n.instances.footer===c&&(n.instances.footer=void 0,q("size",0),q("offset",0),q("space",!1))}),()=>{const i=_e(r.default,[w(ie,{debounce:0,onResize:B})]);return e.elevated===!0&&i.push(w("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),w("footer",{class:_.value,style:$.value,onFocusin:m},i)}}}),qt=O({name:"QPage",props:{padding:Boolean,styleFn:Function},setup(e,{slots:r}){const{proxy:{$q:a}}=j(),t=J(re,R);if(t===R)return console.error("QPage needs to be a deep child of QLayout"),R;if(J(Be,R)===R)return console.error("QPage needs to be child of QPageContainer"),R;const u=v(()=>{const d=(t.header.space===!0?t.header.size:0)+(t.footer.space===!0?t.footer.size:0);if(typeof e.styleFn=="function"){const h=t.isContainer.value===!0?t.containerHeight.value:a.screen.height;return e.styleFn(d,h)}return{minHeight:t.isContainer.value===!0?t.containerHeight.value-d+"px":a.screen.height===0?d!==0?`calc(100vh - ${d}px)`:"100vh":a.screen.height-d+"px"}}),l=v(()=>`q-page${e.padding===!0?" q-layout-padding":""}`);return()=>w("main",{class:l.value,style:u.value},we(r.default))}}),Pt=O({name:"QPageContainer",setup(e,{slots:r}){const{proxy:{$q:a}}=j(),t=J(re,R);if(t===R)return console.error("QPageContainer needs to be child of QLayout"),R;be(Be,!0);const n=v(()=>{const u={};return t.header.space===!0&&(u.paddingTop=`${t.header.size}px`),t.right.space===!0&&(u[`padding${a.lang.rtl===!0?"Left":"Right"}`]=`${t.right.size}px`),t.footer.space===!0&&(u.paddingBottom=`${t.footer.size}px`),t.left.space===!0&&(u[`padding${a.lang.rtl===!0?"Right":"Left"}`]=`${t.left.size}px`),u});return()=>w("div",{class:"q-page-container",style:n.value},we(r.default))}}),{passive:ze}=me,Lt=["both","horizontal","vertical"],$t=O({name:"QScrollObserver",props:{axis:{type:String,validator:e=>Lt.includes(e),default:"vertical"},debounce:[String,Number],scrollTarget:yt},emits:["scroll"],setup(e,{emit:r}){const a={position:{top:0,left:0},direction:"down",directionChanged:!1,delta:{top:0,left:0},inflectionPoint:{top:0,left:0}};let t=null,n,u;k(()=>e.scrollTarget,()=>{h(),d()});function l(){t!==null&&t();const C=Math.max(0,_t(n)),M=wt(n),_={top:C-a.position.top,left:M-a.position.left};if(e.axis==="vertical"&&_.top===0||e.axis==="horizontal"&&_.left===0)return;const $=Math.abs(_.top)>=Math.abs(_.left)?_.top<0?"up":"down":_.left<0?"left":"right";a.position={top:C,left:M},a.directionChanged=a.direction!==$,a.delta=_,a.directionChanged===!0&&(a.direction=$,a.inflectionPoint=a.position),r("scroll",{...a})}function d(){n=pt(u,e.scrollTarget),n.addEventListener("scroll",y,ze),y(!0)}function h(){n!==void 0&&(n.removeEventListener("scroll",y,ze),n=void 0)}function y(C){if(C===!0||e.debounce===0||e.debounce==="0")l();else if(t===null){const[M,_]=e.debounce?[setTimeout(l,e.debounce),clearTimeout]:[requestAnimationFrame(l),cancelAnimationFrame];t=()=>{_(M),t=null}}}const{proxy:P}=j();return k(()=>P.$q.lang.rtl,l),Y(()=>{u=P.$el.parentNode,d()}),G(()=>{t!==null&&t(),h()}),Object.assign(P,{trigger:y,getPosition:()=>a}),Ae}}),Mt=O({name:"QLayout",props:{container:Boolean,view:{type:String,default:"hhh lpr fff",validator:e=>/^(h|l)h(h|r) lpr (f|l)f(f|r)$/.test(e.toLowerCase())},onScroll:Function,onScrollHeight:Function,onResize:Function},setup(e,{slots:r,emit:a}){const{proxy:{$q:t}}=j(),n=x(null),u=x(t.screen.height),l=x(e.container===!0?0:t.screen.width),d=x({position:0,direction:"down",inflectionPoint:0}),h=x(0),y=x(ge.value===!0?0:ve()),P=v(()=>"q-layout q-layout--"+(e.container===!0?"containerized":"standard")),C=v(()=>e.container===!1?{minHeight:t.screen.height+"px"}:null),M=v(()=>y.value!==0?{[t.lang.rtl===!0?"left":"right"]:`${y.value}px`}:null),_=v(()=>y.value!==0?{[t.lang.rtl===!0?"right":"left"]:0,[t.lang.rtl===!0?"left":"right"]:`-${y.value}px`,width:`calc(100% + ${y.value}px)`}:null);function $(c){if(e.container===!0||document.qScrollPrevented!==!0){const i={position:c.position.top,direction:c.direction,directionChanged:c.directionChanged,inflectionPoint:c.inflectionPoint.top,delta:c.delta.top};d.value=i,e.onScroll!==void 0&&a("scroll",i)}}function q(c){const{height:i,width:g}=c;let L=!1;u.value!==i&&(L=!0,u.value=i,e.onScrollHeight!==void 0&&a("scrollHeight",i),B()),l.value!==g&&(L=!0,l.value=g),L===!0&&e.onResize!==void 0&&a("resize",c)}function z({height:c}){h.value!==c&&(h.value=c,B())}function B(){if(e.container===!0){const c=u.value>h.value?ve():0;y.value!==c&&(y.value=c)}}let I=null;const m={instances:{},view:v(()=>e.view),isContainer:v(()=>e.container),rootRef:n,height:u,containerHeight:h,scrollbarWidth:y,totalWidth:v(()=>l.value+y.value),rows:v(()=>{const c=e.view.toLowerCase().split(" ");return{top:c[0].split(""),middle:c[1].split(""),bottom:c[2].split("")}}),header:le({size:0,offset:0,space:!1}),right:le({size:300,offset:0,space:!1}),footer:le({size:0,offset:0,space:!1}),left:le({size:300,offset:0,space:!1}),scroll:d,animate(){I!==null?clearTimeout(I):document.body.classList.add("q-body--layout-animate"),I=setTimeout(()=>{I=null,document.body.classList.remove("q-body--layout-animate")},155)},update(c,i,g){m[c][i]=g}};if(be(re,m),ve()>0){let c=function(){L=null,A.classList.remove("hide-scrollbar")},i=function(){if(L===null){if(A.scrollHeight>t.screen.height)return;A.classList.add("hide-scrollbar")}else clearTimeout(L);L=setTimeout(c,300)},g=function(ee){L!==null&&ee==="remove"&&(clearTimeout(L),c()),window[`${ee}EventListener`]("resize",i)},L=null;const A=document.body;k(()=>e.container!==!0?"add":"remove",g),e.container!==!0&&g("add"),it(()=>{g("remove")})}return()=>{const c=_e(r.default,[w($t,{onScroll:$}),w(ie,{onResize:q})]),i=w("div",{class:P.value,style:C.value,ref:e.container===!0?void 0:n,tabindex:-1},c);return e.container===!0?w("div",{class:"q-layout-container overflow-hidden",ref:n},[w(ie,{onResize:z}),w("div",{class:"absolute-full",style:M.value},[w("div",{class:"scroll",style:_.value},[i])])]):i}}}),Vt={__name:"ImageView",props:{src:String},setup(e,{expose:r}){r();const t={props:e};return Object.defineProperty(t,"__isScriptSetup",{enumerable:!1,value:!0}),t}},Rt={class:"row justify-center"};function kt(e,r,a,t,n,u){return D(),ye("div",Rt,[E(xt,{class:"bg-white avatar-border","font-size":"125px",icon:`img:${t.props.src}`,style:{height:"125px",width:"auto"}},null,8,["icon"])])}const zt=se(Vt,[["render",kt],["__file","ImageView.vue"]]),At=new Array(256);for(let e=0;e<256;e++)At[e]=(e+256).toString(16).substring(1);(()=>{const e=typeof crypto<"u"?crypto:typeof window<"u"?window.crypto||window.msCrypto:void 0;if(e!==void 0){if(e.randomBytes!==void 0)return e.randomBytes;if(e.getRandomValues!==void 0)return r=>{const a=new Uint8Array(r);return e.getRandomValues(a),a}}return r=>{const a=[];for(let t=r;t>0;t--)a.push(Math.floor(Math.random()*256));return a}})();let Bt=0;const It=["click","keydown"],Et={icon:String,label:[Number,String],alert:[Boolean,String],alertIcon:String,name:{type:[Number,String],default:()=>`t_${Bt++}`},noCaps:Boolean,tabindex:[String,Number],disable:Boolean,contentClass:String,ripple:{type:[Boolean,Object],default:!0}};function Ht(e,r,a,t){const n=J(Ie,R);if(n===R)return console.error("QTab/QRouteTab component needs to be child of QTabs"),R;const{proxy:u}=j(),l=x(null),d=x(null),h=x(null),y=v(()=>e.disable===!0||e.ripple===!1?!1:Object.assign({keyCodes:[13,32],early:!0},e.ripple===!0?{}:e.ripple)),P=v(()=>n.currentModel.value===e.name),C=v(()=>"q-tab relative-position self-stretch flex flex-center text-center"+(P.value===!0?" q-tab--active"+(n.tabProps.value.activeClass?" "+n.tabProps.value.activeClass:"")+(n.tabProps.value.activeColor?` text-${n.tabProps.value.activeColor}`:"")+(n.tabProps.value.activeBgColor?` bg-${n.tabProps.value.activeBgColor}`:""):" q-tab--inactive")+(e.icon&&e.label&&n.tabProps.value.inlineLabel===!1?" q-tab--full":"")+(e.noCaps===!0||n.tabProps.value.noCaps===!0?" q-tab--no-caps":"")+(e.disable===!0?" disabled":" q-focusable q-hoverable cursor-pointer")),M=v(()=>"q-tab__content self-stretch flex-center relative-position q-anchor--skip non-selectable "+(n.tabProps.value.inlineLabel===!0?"row no-wrap q-tab__content--inline":"column")+(e.contentClass!==void 0?` ${e.contentClass}`:"")),_=v(()=>e.disable===!0||n.hasFocus.value===!0||P.value===!1&&n.hasActiveTab.value===!0?-1:e.tabindex||0);function $(m,c){if(c!==!0&&l.value!==null&&l.value.focus(),e.disable!==!0){n.updateModel({name:e.name}),a("click",m);return}}function q(m){st(m,[13,32])?$(m,!0):ut(m)!==!0&&m.keyCode>=35&&m.keyCode<=40&&m.altKey!==!0&&m.metaKey!==!0&&n.onKbdNavigate(m.keyCode,u.$el)===!0&&ct(m),a("keydown",m)}function z(){const m=n.tabProps.value.narrowIndicator,c=[],i=w("div",{ref:h,class:["q-tab__indicator",n.tabProps.value.indicatorClass]});e.icon!==void 0&&c.push(w(X,{class:"q-tab__icon",name:e.icon})),e.label!==void 0&&c.push(w("div",{class:"q-tab__label"},e.label)),e.alert!==!1&&c.push(e.alertIcon!==void 0?w(X,{class:"q-tab__alert-icon",color:e.alert!==!0?e.alert:void 0,name:e.alertIcon}):w("div",{class:"q-tab__alert"+(e.alert!==!0?` text-${e.alert}`:"")})),m===!0&&c.push(i);const g=[w("div",{class:"q-focus-helper",tabindex:-1,ref:l}),w("div",{class:M.value},_e(r.default,c))];return m===!1&&g.push(i),g}const B={name:v(()=>e.name),rootRef:d,tabIndicatorRef:h,routeData:t};G(()=>{n.unregisterTab(B)}),Y(()=>{n.registerTab(B)});function I(m,c){const i={ref:d,class:C.value,tabindex:_.value,role:"tab","aria-selected":P.value===!0?"true":"false","aria-disabled":e.disable===!0?"true":void 0,onClick:$,onKeydown:q,...c};return rt(w(m,i,z()),[[Tt,y.value]])}return{renderTab:I,$tabs:n}}const Ne=O({name:"QTab",props:Et,emits:It,setup(e,{slots:r,emit:a}){const{renderTab:t}=Ht(e,r,a);return()=>t("div")}});let De=!1;{const e=document.createElement("div");e.setAttribute("dir","rtl"),Object.assign(e.style,{width:"1px",height:"1px",overflow:"auto"});const r=document.createElement("div");Object.assign(r.style,{width:"1000px",height:"1px"}),document.body.appendChild(e),e.appendChild(r),e.scrollLeft=-1e3,De=e.scrollLeft>=0,e.remove()}function Qt(e,r,a){const t=a===!0?["left","right"]:["top","bottom"];return`absolute-${r===!0?t[0]:t[1]}${e?` text-${e}`:""}`}const Ft=["left","center","right","justify"],Oe=O({name:"QTabs",props:{modelValue:[Number,String],align:{type:String,default:"center",validator:e=>Ft.includes(e)},breakpoint:{type:[String,Number],default:600},vertical:Boolean,shrink:Boolean,stretch:Boolean,activeClass:String,activeColor:String,activeBgColor:String,indicatorColor:String,leftIcon:String,rightIcon:String,outsideArrows:Boolean,mobileArrows:Boolean,switchIndicator:Boolean,narrowIndicator:Boolean,inlineLabel:Boolean,noCaps:Boolean,dense:Boolean,contentClass:String,"onUpdate:modelValue":[Function,Array]},setup(e,{slots:r,emit:a}){const{proxy:t}=j(),{$q:n}=t,{registerTick:u}=he(),{registerTick:l}=he(),{registerTick:d}=he(),{registerTimeout:h,removeTimeout:y}=Re(),{registerTimeout:P,removeTimeout:C}=Re(),M=x(null),_=x(null),$=x(e.modelValue),q=x(!1),z=x(!0),B=x(!1),I=x(!1),m=[],c=x(0),i=x(!1);let g=null,L=null,A;const ee=v(()=>({activeClass:e.activeClass,activeColor:e.activeColor,activeBgColor:e.activeBgColor,indicatorClass:Qt(e.indicatorColor,e.switchIndicator,e.vertical),narrowIndicator:e.narrowIndicator,inlineLabel:e.inlineLabel,noCaps:e.noCaps})),je=v(()=>{const o=c.value,s=$.value;for(let f=0;f<o;f++)if(m[f].name.value===s)return!0;return!1}),We=v(()=>`q-tabs__content--align-${q.value===!0?"left":I.value===!0?"justify":e.align}`),Ke=v(()=>`q-tabs row no-wrap items-center q-tabs--${q.value===!0?"":"not-"}scrollable q-tabs--${e.vertical===!0?"vertical":"horizontal"} q-tabs__arrows--${e.outsideArrows===!0?"outside":"inside"} q-tabs--mobile-with${e.mobileArrows===!0?"":"out"}-arrows`+(e.dense===!0?" q-tabs--dense":"")+(e.shrink===!0?" col-shrink":"")+(e.stretch===!0?" self-stretch":"")),Ue=v(()=>"q-tabs__content scroll--mobile row no-wrap items-center self-stretch hide-scrollbar relative-position "+We.value+(e.contentClass!==void 0?` ${e.contentClass}`:"")),te=v(()=>e.vertical===!0?{container:"height",content:"offsetHeight",scroll:"scrollHeight"}:{container:"width",content:"offsetWidth",scroll:"scrollWidth"}),ne=v(()=>e.vertical!==!0&&n.lang.rtl===!0),ue=v(()=>De===!1&&ne.value===!0);k(ne,U),k(()=>e.modelValue,o=>{ce({name:o,setCurrent:!0,skipEmit:!0})}),k(()=>e.outsideArrows,oe);function ce({name:o,setCurrent:s,skipEmit:f}){$.value!==o&&(f!==!0&&e["onUpdate:modelValue"]!==void 0&&a("update:modelValue",o),(s===!0||e["onUpdate:modelValue"]===void 0)&&(Ge($.value,o),$.value=o))}function oe(){u(()=>{xe({width:M.value.offsetWidth,height:M.value.offsetHeight})})}function xe(o){if(te.value===void 0||_.value===null)return;const s=o[te.value.container],f=Math.min(_.value[te.value.scroll],Array.prototype.reduce.call(_.value.children,(S,p)=>S+(p[te.value.content]||0),0)),T=s>0&&f>s;q.value=T,T===!0&&l(U),I.value=s<parseInt(e.breakpoint,10)}function Ge(o,s){const f=o!=null&&o!==""?m.find(S=>S.name.value===o):null,T=s!=null&&s!==""?m.find(S=>S.name.value===s):null;if(f&&T){const S=f.tabIndicatorRef.value,p=T.tabIndicatorRef.value;g!==null&&(clearTimeout(g),g=null),S.style.transition="none",S.style.transform="none",p.style.transition="none",p.style.transform="none";const b=S.getBoundingClientRect(),V=p.getBoundingClientRect();p.style.transform=e.vertical===!0?`translate3d(0,${b.top-V.top}px,0) scale3d(1,${V.height?b.height/V.height:1},1)`:`translate3d(${b.left-V.left}px,0,0) scale3d(${V.width?b.width/V.width:1},1,1)`,d(()=>{g=setTimeout(()=>{g=null,p.style.transition="transform .25s cubic-bezier(.4, 0, .2, 1)",p.style.transform="none"},70)})}T&&q.value===!0&&K(T.rootRef.value)}function K(o){const{left:s,width:f,top:T,height:S}=_.value.getBoundingClientRect(),p=o.getBoundingClientRect();let b=e.vertical===!0?p.top-T:p.left-s;if(b<0){_.value[e.vertical===!0?"scrollTop":"scrollLeft"]+=Math.floor(b),U();return}b+=e.vertical===!0?p.height-S:p.width-f,b>0&&(_.value[e.vertical===!0?"scrollTop":"scrollLeft"]+=Math.ceil(b),U())}function U(){const o=_.value;if(o===null)return;const s=o.getBoundingClientRect(),f=e.vertical===!0?o.scrollTop:Math.abs(o.scrollLeft);ne.value===!0?(z.value=Math.ceil(f+s.width)<o.scrollWidth-1,B.value=f>0):(z.value=f>0,B.value=e.vertical===!0?Math.ceil(f+s.height)<o.scrollHeight:Math.ceil(f+s.width)<o.scrollWidth)}function Te(o){L!==null&&clearInterval(L),L=setInterval(()=>{Je(o)===!0&&Q()},5)}function Se(){Te(ue.value===!0?Number.MAX_SAFE_INTEGER:0)}function Ce(){Te(ue.value===!0?0:Number.MAX_SAFE_INTEGER)}function Q(){L!==null&&(clearInterval(L),L=null)}function Xe(o,s){const f=Array.prototype.filter.call(_.value.children,V=>V===s||V.matches&&V.matches(".q-tab.q-focusable")===!0),T=f.length;if(T===0)return;if(o===36)return K(f[0]),f[0].focus(),!0;if(o===35)return K(f[T-1]),f[T-1].focus(),!0;const S=o===(e.vertical===!0?38:37),p=o===(e.vertical===!0?40:39),b=S===!0?-1:p===!0?1:void 0;if(b!==void 0){const V=ne.value===!0?-1:1,H=f.indexOf(s)+b*V;return H>=0&&H<T&&(K(f[H]),f[H].focus({preventScroll:!0})),!0}}const Ye=v(()=>ue.value===!0?{get:o=>Math.abs(o.scrollLeft),set:(o,s)=>{o.scrollLeft=-s}}:e.vertical===!0?{get:o=>o.scrollTop,set:(o,s)=>{o.scrollTop=s}}:{get:o=>o.scrollLeft,set:(o,s)=>{o.scrollLeft=s}});function Je(o){const s=_.value,{get:f,set:T}=Ye.value;let S=!1,p=f(s);const b=o<p?-1:1;return p+=b*5,p<0?(S=!0,p=0):(b===-1&&p<=o||b===1&&p>=o)&&(S=!0,p=o),T(s,p),U(),S}function qe(o,s){for(const f in o)if(o[f]!==s[f])return!1;return!0}function Ze(){let o=null,s={matchedLen:0,queryDiff:9999,hrefLen:0};const f=m.filter(b=>b.routeData!==void 0&&b.routeData.hasRouterLink.value===!0),{hash:T,query:S}=t.$route,p=Object.keys(S).length;for(const b of f){const V=b.routeData.exact.value===!0;if(b.routeData[V===!0?"linkIsExactActive":"linkIsActive"].value!==!0)continue;const{hash:H,query:de,matched:at,href:lt}=b.routeData.resolvedLink.value,fe=Object.keys(de).length;if(V===!0){if(H!==T||fe!==p||qe(S,de)===!1)continue;o=b.name.value;break}if(H!==""&&H!==T||fe!==0&&qe(de,S)===!1)continue;const F={matchedLen:at.length,queryDiff:p-fe,hrefLen:lt.length-H.length};if(F.matchedLen>s.matchedLen){o=b.name.value,s=F;continue}else if(F.matchedLen!==s.matchedLen)continue;if(F.queryDiff<s.queryDiff)o=b.name.value,s=F;else if(F.queryDiff!==s.queryDiff)continue;F.hrefLen>s.hrefLen&&(o=b.name.value,s=F)}o===null&&m.some(b=>b.routeData===void 0&&b.name.value===$.value)===!0||ce({name:o,setCurrent:!0})}function et(o){if(y(),i.value!==!0&&M.value!==null&&o.target&&typeof o.target.closest=="function"){const s=o.target.closest(".q-tab");s&&M.value.contains(s)===!0&&(i.value=!0,q.value===!0&&K(s))}}function tt(){h(()=>{i.value=!1},30)}function ae(){Le.avoidRouteWatcher===!1?P(Ze):C()}function Pe(){if(A===void 0){const o=k(()=>t.$route.fullPath,ae);A=()=>{o(),A=void 0}}}function nt(o){m.push(o),c.value++,oe(),o.routeData===void 0||t.$route===void 0?P(()=>{if(q.value===!0){const s=$.value,f=s!=null&&s!==""?m.find(T=>T.name.value===s):null;f&&K(f.rootRef.value)}}):(Pe(),o.routeData.hasRouterLink.value===!0&&ae())}function ot(o){m.splice(m.indexOf(o),1),c.value--,oe(),A!==void 0&&o.routeData!==void 0&&(m.every(s=>s.routeData===void 0)===!0&&A(),ae())}const Le={currentModel:$,tabProps:ee,hasFocus:i,hasActiveTab:je,registerTab:nt,unregisterTab:ot,verifyRouteModel:ae,updateModel:ce,onKbdNavigate:Xe,avoidRouteWatcher:!1};be(Ie,Le);function $e(){g!==null&&clearTimeout(g),Q(),A!==void 0&&A()}let Me;return G($e),dt(()=>{Me=A!==void 0,$e()}),ft(()=>{Me===!0&&Pe(),oe()}),()=>w("div",{ref:M,class:Ke.value,role:"tablist",onFocusin:et,onFocusout:tt},[w(ie,{onResize:xe}),w("div",{ref:_,class:Ue.value,onScroll:U},we(r.default)),w(X,{class:"q-tabs__arrow q-tabs__arrow--left absolute q-tab__icon"+(z.value===!0?"":" q-tabs__arrow--faded"),name:e.leftIcon||n.iconSet.tabs[e.vertical===!0?"up":"left"],onMousedownPassive:Se,onTouchstartPassive:Se,onMouseupPassive:Q,onMouseleavePassive:Q,onTouchendPassive:Q}),w(X,{class:"q-tabs__arrow q-tabs__arrow--right absolute q-tab__icon"+(B.value===!0?"":" q-tabs__arrow--faded"),name:e.rightIcon||n.iconSet.tabs[e.vertical===!0?"down":"right"],onMousedownPassive:Ce,onTouchstartPassive:Ce,onMouseupPassive:Q,onMouseleavePassive:Q,onTouchendPassive:Q})])}}),Nt=pe({__name:"TopMenu",props:{modelValue:{},subMenu:{}},emits:["update:modelValue"],setup(e,{expose:r,emit:a}){r();const t=a,n=e,u=v({get:()=>n.modelValue,set:d=>{t("update:modelValue",d)}}),l={emit:t,props:n,modelValue:u};return Object.defineProperty(l,"__isScriptSetup",{enumerable:!1,value:!0}),l}}),Dt={class:"text-caption text-grey-4 text-center"};function Ot(e,r,a,t,n,u){return a.subMenu&&a.subMenu.length>0?(D(),Z(Oe,{key:0,modelValue:t.modelValue,"onUpdate:modelValue":r[0]||(r[0]=l=>t.modelValue=l),align:"justify","active-color":"white","active-bg-color":"grey-10","inline-label":"","switch-indicator":"","no-caps":"","indicator-color":"purple-4",class:"bg-dark stick-top-menu"},{default:N(()=>[(D(!0),ye(He,null,Ee(a.subMenu,(l,d)=>(D(),Z(Ne,{key:d,ripple:!1,name:l.title,class:"q-py-sm text-caption text-grey-4"},{default:N(()=>[W("div",Dt,[E(X,{class:"q-mr-xs q-mb-xs",name:l.icon},null,8,["name"]),ht(" "+Qe(l.title),1)])]),_:2},1032,["name"]))),128))]),_:1},8,["modelValue"])):vt("",!0)}const jt=se(Nt,[["render",Ot],["__scopeId","data-v-e509849f"],["__file","TopMenu.vue"]]),Wt=pe({__name:"FooterMenu",props:{modelValue:{},menu:{}},emits:["update:modelValue"],setup(e,{expose:r,emit:a}){r();const t=a,n=e,u=v({get:()=>n.modelValue,set:d=>{t("update:modelValue",d)}}),l={emit:t,props:n,modelValue:u};return Object.defineProperty(l,"__isScriptSetup",{enumerable:!1,value:!0}),l}}),Kt={class:"text-caption text-grey-4 text-center"};function Ut(e,r,a,t,n,u){return D(),Z(Oe,{modelValue:t.modelValue,"onUpdate:modelValue":r[0]||(r[0]=l=>t.modelValue=l),align:"justify","indicator-color":"transparent","active-color":"purple-4",class:"bg-dark"},{default:N(()=>[(D(!0),ye(He,null,Ee(t.props.menu,(l,d)=>(D(),Z(Ne,{key:d,ripple:!1,name:l.title,class:"q-py-sm"},{default:N(()=>[E(X,{class:"q-mb-xs",name:l.icon},null,8,["name"]),W("div",Kt,Qe(l.title),1)]),_:2},1032,["name"]))),128))]),_:1},8,["modelValue"])}const Gt=se(Wt,[["render",Ut],["__file","FooterMenu.vue"]]),Xt=mt("base",()=>{const e=gt(),r=x([{title:"Home",icon:"fa-solid fa-home",pathName:"Home",topMenu:[],lastActive:"",lastActivePath:"Home"},{title:"Background",icon:"fa-solid fa-clock",pathName:"Background",topMenu:[{title:"Education",pathName:"Education",icon:"fa-solid fa-graduation-cap"},{title:"Experience",pathName:"Experience",icon:"fa-solid fa-briefcase"}],lastActive:"Education",lastActivePath:"Education"},{title:"Showcase",icon:"fa-solid fa-images",pathName:"Showcase",topMenu:[{title:"Skills",pathName:"Skills",icon:"fa-solid fa-tools"},{title:"Projects",pathName:"Projects",icon:"fa-solid fa-project-diagram"},{title:"Achievements",pathName:"Achievements",icon:"fa-solid fa-trophy"}],lastActive:"Skills",lastActivePath:"Skills"}]),a=x("Home"),t=x("");return k(a,n=>{const u=r.value.find(l=>l.title===n);u&&u.topMenu.length>0?(t.value=u.lastActive,e.push({name:u.lastActivePath})):(t.value="",e.push({name:u?.pathName||r.value[0].pathName}))}),k(t,n=>{const u=r.value.find(d=>d.title===a.value),l=u?.topMenu.find(d=>d.title===n);u&&(u.lastActive=n,e.push({name:l?.pathName||r.value[0].pathName}))}),{footerMenu:r,tab:a,subTab:t}}),Yt=pe({__name:"MainLayout",setup(e,{expose:r}){r();const a=Xt(),t=v(()=>a.footerMenu.find(l=>l.title===a.tab)?.topMenu||[]),n={baseStore:a,subMenu:t,ImageView:zt,TopMenu:jt,FooterMenu:Gt};return Object.defineProperty(n,"__isScriptSetup",{enumerable:!1,value:!0}),n}}),Jt={class:"row justify-center bg-dark q-py-md",style:{"border-bottom":"1px solid grey"}},Zt={class:"col-12 q-my-sm"},en=W("div",{class:"col-12 q-mt-sm"},[W("div",{class:"text-h6 text-white text-center"},"Rahul Yadav"),W("div",{class:"text-subtitle2 text-grey-4 text-center"}," Software Engineer ")],-1);function tn(e,r,a,t,n,u){const l=bt("router-view");return D(),Z(Mt,{view:"lHh Lpr lFf"},{default:N(()=>[W("div",Jt,[W("div",Zt,[E(t.ImageView,{src:"https://ryanbalieiro.github.io/vue-resume-template/images/pictures/avatar.png",alt:"Rahul Yadav",style:{"min-height":"12vh"}})]),en]),E(t.TopMenu,{subMenu:t.subMenu,modelValue:t.baseStore.subTab,"onUpdate:modelValue":r[0]||(r[0]=d=>t.baseStore.subTab=d)},null,8,["subMenu","modelValue"]),E(Ct,null,{default:N(()=>[E(t.FooterMenu,{menu:t.baseStore.footerMenu,modelValue:t.baseStore.tab,"onUpdate:modelValue":r[1]||(r[1]=d=>t.baseStore.tab=d)},null,8,["menu","modelValue"])]),_:1}),E(Pt,{style:{height:"fit-content"}},{default:N(()=>[E(qt,{class:"q-pa-lg",style:{"min-height":"10vh !important"}},{default:N(()=>[E(l)]),_:1})]),_:1})]),_:1})}const rn=se(Yt,[["render",tn],["__file","MainLayout.vue"]]);export{rn as default};
