import{c as p,U as qe,r as W,D as Me,V as ae,p as K,W as B,w as k,o as pe,m as D,g as O,X as G,q as X,Y as re,l as ee,a as Le,Z as Ae,h as A,$ as Ve,a0 as ze,a1 as Be,G as De,d as xe,_ as be,z as M,A as Y,L as Ne,J as se,K as ue,O as je,P as z,M as ye,F as Se,N as Fe,f as Oe}from"./index-BsdEXZvk.js";import{v as Re,a as Qe}from"./vm-CQ25IqoV.js";import{c as Ie,s as Ue,u as Ke,d as Ge,g as Xe,Q as Ye}from"./use-timeout-fU_7xrdL.js";const Je={dark:{type:Boolean,default:null}};function Ze(e,t){return p(()=>e.dark===null?t.dark.isActive:e.dark)}function J(){if(window.getSelection!==void 0){const e=window.getSelection();e.empty!==void 0?e.empty():e.removeAllRanges!==void 0&&(e.removeAllRanges(),qe.is.mobile!==!0&&e.addRange(document.createRange()))}else document.selection!==void 0&&document.selection.empty()}const et={target:{type:[Boolean,String,Element],default:!0},noParentEvent:Boolean};function tt({showing:e,avoidEmit:t,configureAnchorEl:l}){const{props:n,proxy:o,emit:s}=O(),i=W(null);let a=null;function u(r){return i.value===null?!1:r===void 0||r.touches===void 0||r.touches.length<=1}const c={};l===void 0&&(Object.assign(c,{hide(r){o.hide(r)},toggle(r){o.toggle(r),r.qAnchorHandled=!0},toggleKey(r){Me(r,13)===!0&&c.toggle(r)},contextClick(r){o.hide(r),ae(r),K(()=>{o.show(r),r.qAnchorHandled=!0})},prevent:ae,mobileTouch(r){if(c.mobileCleanup(r),u(r)!==!0)return;o.hide(r),i.value.classList.add("non-selectable");const f=r.target;B(c,"anchor",[[f,"touchmove","mobileCleanup","passive"],[f,"touchend","mobileCleanup","passive"],[f,"touchcancel","mobileCleanup","passive"],[i.value,"contextmenu","prevent","notPassive"]]),a=setTimeout(()=>{a=null,o.show(r),r.qAnchorHandled=!0},300)},mobileCleanup(r){i.value.classList.remove("non-selectable"),a!==null&&(clearTimeout(a),a=null),e.value===!0&&r!==void 0&&J()}}),l=function(r=n.contextMenu){if(n.noParentEvent===!0||i.value===null)return;let f;r===!0?o.$q.platform.is.mobile===!0?f=[[i.value,"touchstart","mobileTouch","passive"]]:f=[[i.value,"mousedown","hide","passive"],[i.value,"contextmenu","contextClick","notPassive"]]:f=[[i.value,"click","toggle","passive"],[i.value,"keyup","toggleKey","passive"]],B(c,"anchor",f)});function d(){G(c,"anchor")}function x(r){for(i.value=r;i.value.classList.contains("q-anchor--skip");)i.value=i.value.parentNode;l()}function y(){if(n.target===!1||n.target===""||o.$el.parentNode===null)i.value=null;else if(n.target===!0)x(o.$el.parentNode);else{let r=n.target;if(typeof n.target=="string")try{r=document.querySelector(n.target)}catch{r=void 0}r!=null?(i.value=r.$el||r,l()):(i.value=null,console.error(`Anchor: target "${n.target}" not found`))}}return k(()=>n.contextMenu,r=>{i.value!==null&&(d(),l(r))}),k(()=>n.target,()=>{i.value!==null&&d(),y()}),k(()=>n.noParentEvent,r=>{i.value!==null&&(r===!0?d():l())}),pe(()=>{y(),t!==!0&&n.modelValue===!0&&i.value===null&&s("update:modelValue",!1)}),D(()=>{a!==null&&clearTimeout(a),d()}),{anchorEl:i,canShow:u,anchorEvents:c}}function nt(e,t){const l=W(null);let n;function o(a,u){const c=`${u!==void 0?"add":"remove"}EventListener`,d=u!==void 0?u:n;a!==window&&a[c]("scroll",d,X.passive),window[c]("scroll",d,X.passive),n=u}function s(){l.value!==null&&(o(l.value),l.value=null)}const i=k(()=>e.noParentEvent,()=>{l.value!==null&&(s(),t())});return D(i),{localScrollTarget:l,unconfigureScrollTarget:s,changeScrollEvent:o}}const lt={modelValue:{type:Boolean,default:null},"onUpdate:modelValue":[Function,Array]},ot=["beforeShow","show","beforeHide","hide"];function it({showing:e,canShow:t,hideOnRouteChange:l,handleShow:n,handleHide:o,processOnMount:s}){const i=O(),{props:a,emit:u,proxy:c}=i;let d;function x(m){e.value===!0?f(m):y(m)}function y(m){if(a.disable===!0||m!==void 0&&m.qAnchorHandled===!0||t!==void 0&&t(m)!==!0)return;const v=a["onUpdate:modelValue"]!==void 0;v===!0&&(u("update:modelValue",!0),d=m,K(()=>{d===m&&(d=void 0)})),(a.modelValue===null||v===!1)&&r(m)}function r(m){e.value!==!0&&(e.value=!0,u("beforeShow",m),n!==void 0?n(m):u("show",m))}function f(m){if(a.disable===!0)return;const v=a["onUpdate:modelValue"]!==void 0;v===!0&&(u("update:modelValue",!1),d=m,K(()=>{d===m&&(d=void 0)})),(a.modelValue===null||v===!1)&&S(m)}function S(m){e.value!==!1&&(e.value=!1,u("beforeHide",m),o!==void 0?o(m):u("hide",m))}function T(m){a.disable===!0&&m===!0?a["onUpdate:modelValue"]!==void 0&&u("update:modelValue",!1):m===!0!==e.value&&(m===!0?r:S)(d)}k(()=>a.modelValue,T),l!==void 0&&Re(i)===!0&&k(()=>c.$route.fullPath,()=>{l.value===!0&&e.value===!0&&f()}),s===!0&&pe(()=>{T(a.modelValue)});const E={show:y,hide:f,toggle:x};return Object.assign(c,E),E}let V=[],N=[];function we(e){N=N.filter(t=>t!==e)}function at(e){we(e),N.push(e)}function ce(e){we(e),N.length===0&&V.length!==0&&(V[V.length-1](),V=[])}let rt=1,st=document.body;function ut(e,t){const l=document.createElement("div");if(l.id=`q-portal--${t}--${rt++}`,re.globalNodes!==void 0){const n=re.globalNodes.class;n!==void 0&&(l.className=n)}return st.appendChild(l),l}function ct(e){e.remove()}const L=[],dt=ee({name:"QPortal",setup(e,{slots:t}){return()=>t.default()}});function ft(e,t,l,n){const o=W(!1),s=W(!1);let i=null;const a={};function u(d){if(d===!0){ce(a),s.value=!0;return}s.value=!1,o.value===!1&&(i===null&&(i=ut(!1,n)),o.value=!0,L.push(e.proxy),at(a))}function c(d){if(s.value=!1,d!==!0)return;ce(a),o.value=!1;const x=L.indexOf(e.proxy);x!==-1&&L.splice(x,1),i!==null&&(ct(i),i=null)}return Le(()=>{c(!0)}),e.proxy.__qPortal=!0,Ae(e.proxy,"contentEl",()=>t.value),{showPortal:u,hidePortal:c,portalIsActive:o,portalIsAccessible:s,renderPortal:()=>o.value===!0?[A(Ve,{to:i},A(dt,l))]:void 0}}const Q={transitionShow:{type:String,default:"fade"},transitionHide:{type:String,default:"fade"},transitionDuration:{type:[String,Number],default:300}};function mt(e,t=()=>{},l=()=>{}){return{transitionProps:p(()=>{const n=`q-transition--${e.transitionShow||t()}`,o=`q-transition--${e.transitionHide||l()}`;return{appear:!0,enterFromClass:`${n}-enter-from`,enterActiveClass:`${n}-enter-active`,enterToClass:`${n}-enter-to`,leaveFromClass:`${o}-leave-from`,leaveActiveClass:`${o}-leave-active`,leaveToClass:`${o}-leave-to`}}),transitionStyle:p(()=>`--q-transition-duration: ${e.transitionDuration}ms`)}}const{notPassiveCapture:j}=X,$=[];function F(e){const t=e.target;if(t===void 0||t.nodeType===8||t.classList.contains("no-pointer-events")===!0)return;let l=L.length-1;for(;l>=0;){const n=L[l].$;if(n.type.name==="QTooltip"){l--;continue}if(n.type.name!=="QDialog")break;if(n.props.seamless!==!0)return;l--}for(let n=$.length-1;n>=0;n--){const o=$[n];if((o.anchorEl.value===null||o.anchorEl.value.contains(t)===!1)&&(t===document.body||o.innerRef.value!==null&&o.innerRef.value.contains(t)===!1))e.qClickOutside=!0,o.onClickOutside(e);else return}}function ht(e){$.push(e),$.length===1&&(document.addEventListener("mousedown",F,j),document.addEventListener("touchstart",F,j))}function de(e){const t=$.findIndex(l=>l===e);t!==-1&&($.splice(t,1),$.length===0&&(document.removeEventListener("mousedown",F,j),document.removeEventListener("touchstart",F,j)))}let fe,me;function he(e){const t=e.split(" ");return t.length!==2?!1:["top","center","bottom"].includes(t[0])!==!0?(console.error("Anchor/Self position must start with one of top/center/bottom"),!1):["left","middle","right","start","end"].includes(t[1])!==!0?(console.error("Anchor/Self position must end with one of left/middle/right/start/end"),!1):!0}function vt(e){return e?!(e.length!==2||typeof e[0]!="number"||typeof e[1]!="number"):!0}const Z={"start#ltr":"left","start#rtl":"right","end#ltr":"right","end#rtl":"left"};["left","middle","right"].forEach(e=>{Z[`${e}#ltr`]=e,Z[`${e}#rtl`]=e});function ve(e,t){const l=e.split(" ");return{vertical:l[0],horizontal:Z[`${l[1]}#${t===!0?"rtl":"ltr"}`]}}function gt(e,t){let{top:l,left:n,right:o,bottom:s,width:i,height:a}=e.getBoundingClientRect();return t!==void 0&&(l-=t[1],n-=t[0],s+=t[1],o+=t[0],i+=t[0],a+=t[1]),{top:l,bottom:s,height:a,left:n,right:o,width:i,middle:n+(o-n)/2,center:l+(s-l)/2}}function pt(e,t,l){let{top:n,left:o}=e.getBoundingClientRect();return n+=t.top,o+=t.left,l!==void 0&&(n+=l[1],o+=l[0]),{top:n,bottom:n+1,height:1,left:o,right:o+1,width:1,middle:o,center:n}}function xt(e,t){return{top:0,center:t/2,bottom:t,left:0,middle:e/2,right:e}}function ge(e,t,l,n){return{top:e[l.vertical]-t[n.vertical],left:e[l.horizontal]-t[n.horizontal]}}function _e(e,t=0){if(e.targetEl===null||e.anchorEl===null||t>5)return;if(e.targetEl.offsetHeight===0||e.targetEl.offsetWidth===0){setTimeout(()=>{_e(e,t+1)},10);return}const{targetEl:l,offset:n,anchorEl:o,anchorOrigin:s,selfOrigin:i,absoluteOffset:a,fit:u,cover:c,maxHeight:d,maxWidth:x}=e;if(ze.is.ios===!0&&window.visualViewport!==void 0){const P=document.body.style,{offsetLeft:b,offsetTop:w}=window.visualViewport;b!==fe&&(P.setProperty("--q-pe-left",b+"px"),fe=b),w!==me&&(P.setProperty("--q-pe-top",w+"px"),me=w)}const{scrollLeft:y,scrollTop:r}=l,f=a===void 0?gt(o,c===!0?[0,0]:n):pt(o,a,n);Object.assign(l.style,{top:0,left:0,minWidth:null,minHeight:null,maxWidth:x||"100vw",maxHeight:d||"100vh",visibility:"visible"});const{offsetWidth:S,offsetHeight:T}=l,{elWidth:E,elHeight:m}=u===!0||c===!0?{elWidth:Math.max(f.width,S),elHeight:c===!0?Math.max(f.height,T):T}:{elWidth:S,elHeight:T};let v={maxWidth:x,maxHeight:d};(u===!0||c===!0)&&(v.minWidth=f.width+"px",c===!0&&(v.minHeight=f.height+"px")),Object.assign(l.style,v);const C=xt(E,m);let h=ge(f,C,s,i);if(a===void 0||n===void 0)I(h,f,C,s,i);else{const{top:P,left:b}=h;I(h,f,C,s,i);let w=!1;if(h.top!==P){w=!0;const _=2*n[1];f.center=f.top-=_,f.bottom-=_+2}if(h.left!==b){w=!0;const _=2*n[0];f.middle=f.left-=_,f.right-=_+2}w===!0&&(h=ge(f,C,s,i),I(h,f,C,s,i))}v={top:h.top+"px",left:h.left+"px"},h.maxHeight!==void 0&&(v.maxHeight=h.maxHeight+"px",f.height>h.maxHeight&&(v.minHeight=v.maxHeight)),h.maxWidth!==void 0&&(v.maxWidth=h.maxWidth+"px",f.width>h.maxWidth&&(v.minWidth=v.maxWidth)),Object.assign(l.style,v),l.scrollTop!==r&&(l.scrollTop=r),l.scrollLeft!==y&&(l.scrollLeft=y)}function I(e,t,l,n,o){const s=l.bottom,i=l.right,a=Ie(),u=window.innerHeight-a,c=document.body.clientWidth;if(e.top<0||e.top+s>u)if(o.vertical==="center")e.top=t[n.vertical]>u/2?Math.max(0,u-s):0,e.maxHeight=Math.min(s,u);else if(t[n.vertical]>u/2){const d=Math.min(u,n.vertical==="center"?t.center:n.vertical===o.vertical?t.bottom:t.top);e.maxHeight=Math.min(s,d),e.top=Math.max(0,d-s)}else e.top=Math.max(0,n.vertical==="center"?t.center:n.vertical===o.vertical?t.top:t.bottom),e.maxHeight=Math.min(s,u-e.top);if(e.left<0||e.left+i>c)if(e.maxWidth=Math.min(i,c),o.horizontal==="middle")e.left=t[n.horizontal]>c/2?Math.max(0,c-i):0;else if(t[n.horizontal]>c/2){const d=Math.min(c,n.horizontal==="middle"?t.middle:n.horizontal===o.horizontal?t.right:t.left);e.maxWidth=Math.min(i,d),e.left=Math.max(0,d-e.maxWidth)}else e.left=Math.max(0,n.horizontal==="middle"?t.middle:n.horizontal===o.horizontal?t.left:t.right),e.maxWidth=Math.min(i,c-e.left)}const bt=ee({name:"QTooltip",inheritAttrs:!1,props:{...et,...lt,...Q,maxHeight:{type:String,default:null},maxWidth:{type:String,default:null},transitionShow:{...Q.transitionShow,default:"jump-down"},transitionHide:{...Q.transitionHide,default:"jump-up"},anchor:{type:String,default:"bottom middle",validator:he},self:{type:String,default:"top middle",validator:he},offset:{type:Array,default:()=>[14,14],validator:vt},scrollTarget:Ue,delay:{type:Number,default:0},hideDelay:{type:Number,default:0},persistent:Boolean},emits:[...ot],setup(e,{slots:t,emit:l,attrs:n}){let o,s;const i=O(),{proxy:{$q:a}}=i,u=W(null),c=W(!1),d=p(()=>ve(e.anchor,a.lang.rtl)),x=p(()=>ve(e.self,a.lang.rtl)),y=p(()=>e.persistent!==!0),{registerTick:r,removeTick:f}=Ke(),{registerTimeout:S}=Ge(),{transitionProps:T,transitionStyle:E}=mt(e),{localScrollTarget:m,changeScrollEvent:v,unconfigureScrollTarget:C}=nt(e,oe),{anchorEl:h,canShow:P,anchorEvents:b}=tt({showing:c,configureAnchorEl:Ee}),{show:w,hide:_}=it({showing:c,canShow:P,handleShow:ke,handleHide:Ce,hideOnRouteChange:y,processOnMount:!0});Object.assign(b,{delayShow:He,delayHide:$e});const{showPortal:te,hidePortal:ne,renderPortal:Te}=ft(i,u,We,"tooltip");if(a.platform.is.mobile===!0){const g={anchorEl:h,innerRef:u,onClickOutside(H){return _(H),H.target.classList.contains("q-dialog__backdrop")&&De(H),!0}},R=p(()=>e.modelValue===null&&e.persistent!==!0&&c.value===!0);k(R,H=>{(H===!0?ht:de)(g)}),D(()=>{de(g)})}function ke(g){te(),r(()=>{s=new MutationObserver(()=>q()),s.observe(u.value,{attributes:!1,childList:!0,characterData:!0,subtree:!0}),q(),oe()}),o===void 0&&(o=k(()=>a.screen.width+"|"+a.screen.height+"|"+e.self+"|"+e.anchor+"|"+a.lang.rtl,q)),S(()=>{te(!0),l("show",g)},e.transitionDuration)}function Ce(g){f(),ne(),le(),S(()=>{ne(!0),l("hide",g)},e.transitionDuration)}function le(){s!==void 0&&(s.disconnect(),s=void 0),o!==void 0&&(o(),o=void 0),C(),G(b,"tooltipTemp")}function q(){_e({targetEl:u.value,offset:e.offset,anchorEl:h.value,anchorOrigin:d.value,selfOrigin:x.value,maxHeight:e.maxHeight,maxWidth:e.maxWidth})}function He(g){if(a.platform.is.mobile===!0){J(),document.body.classList.add("non-selectable");const R=h.value,H=["touchmove","touchcancel","touchend","click"].map(ie=>[R,ie,"delayHide","passiveCapture"]);B(b,"tooltipTemp",H)}S(()=>{w(g)},e.delay)}function $e(g){a.platform.is.mobile===!0&&(G(b,"tooltipTemp"),J(),setTimeout(()=>{document.body.classList.remove("non-selectable")},10)),S(()=>{_(g)},e.hideDelay)}function Ee(){if(e.noParentEvent===!0||h.value===null)return;const g=a.platform.is.mobile===!0?[[h.value,"touchstart","delayShow","passive"]]:[[h.value,"mouseenter","delayShow","passive"],[h.value,"mouseleave","delayHide","passive"]];B(b,"anchor",g)}function oe(){if(h.value!==null||e.scrollTarget!==void 0){m.value=Xe(h.value,e.scrollTarget);const g=e.noParentEvent===!0?q:_;v(m.value,g)}}function Pe(){return c.value===!0?A("div",{...n,ref:u,class:["q-tooltip q-tooltip--style q-position-engine no-pointer-events",n.class],style:[n.style,E.value],role:"tooltip"},Qe(t.default)):null}function We(){return A(Be,T.value,Pe)}return D(le),Object.assign(i.proxy,{updatePosition:q}),Te}}),yt=xe({__name:"SocialLinks",props:{links:{}},setup(e,{expose:t}){t();const o={props:e,onClick:s=>{window.open(s,"_blank")}};return Object.defineProperty(o,"__isScriptSetup",{enumerable:!1,value:!0}),o}});function St(e,t,l,n,o,s){return M(!0),Y(Se,null,Ne(n.props.links,(i,a)=>(M(),se(Ye,{key:a,class:"q-mr-sm",size:"lg",color:"dark","text-color":"white",icon:i.icon,onClick:u=>n.onClick(i.link)},{default:ue(()=>[i.title?(M(),se(bt,{key:0,anchor:"top middle",self:"bottom middle",class:"bg-purple text-caption"},{default:ue(()=>[je(z(i.title),1)]),_:2},1024)):ye("",!0)]),_:2},1032,["icon","onClick"]))),128)}const Wt=be(yt,[["render",St],["__scopeId","data-v-0693e33d"],["__file","SocialLinks.vue"]]),wt={true:"inset",item:"item-inset","item-thumbnail":"item-thumbnail-inset"},U={xs:2,sm:4,md:8,lg:16,xl:24},_t=ee({name:"QSeparator",props:{...Je,spaced:[Boolean,String],inset:[Boolean,String],vertical:Boolean,color:String,size:String},setup(e){const t=O(),l=Ze(e,t.proxy.$q),n=p(()=>e.vertical===!0?"vertical":"horizontal"),o=p(()=>` q-separator--${n.value}`),s=p(()=>e.inset!==!1?`${o.value}-${wt[e.inset]}`:""),i=p(()=>`q-separator${o.value}${s.value}`+(e.color!==void 0?` bg-${e.color}`:"")+(l.value===!0?" q-separator--dark":"")),a=p(()=>{const u={};if(e.size!==void 0&&(u[e.vertical===!0?"width":"height"]=e.size),e.spaced!==!1){const c=e.spaced===!0?`${U.md}px`:e.spaced in U?`${U[e.spaced]}px`:e.spaced,d=e.vertical===!0?["Left","Right"]:["Top","Bottom"];u[`margin${d[0]}`]=u[`margin${d[1]}`]=c}return u});return()=>A("hr",{class:i.value,style:a.value,"aria-orientation":n.value})}}),Tt=xe({__name:"SectionDetails",props:{titleFirstPart:{},titleSecondPart:{default:""},description:{default:""}},setup(e,{expose:t}){t();const l={};return Object.defineProperty(l,"__isScriptSetup",{enumerable:!1,value:!0}),l}}),kt={class:"text-h3 text-dark text-bold text-uppercase"},Ct={key:0,class:"text-body1 text-primary text-justify"};function Ht(e,t,l,n,o,s){return M(),Y(Se,null,[Fe("div",kt,z(l.titleFirstPart)+" "+z(l.titleSecondPart),1),Oe(_t,{class:"q-mt-xs q-mb-sm",size:"2px",color:"accent",width:"60"}),l.description?(M(),Y("p",Ct,z(l.description),1)):ye("",!0)],64)}const qt=be(Tt,[["render",Ht],["__file","SectionDetails.vue"]]);export{Wt as S,Ze as a,qt as b,Je as u};
