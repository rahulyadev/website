import{g as v,c,u as g,d as w,Q as S,e as h,f as a}from"./vm-CQ25IqoV.js";import{l as y,c as s,h as r,H as u,m as d,p as x,g as f}from"./index-BsdEXZvk.js";const p=[Element,String],T=[null,document,document.body,document.scrollingElement,document.documentElement];function q(e,o){let t=v(o);if(t===void 0){if(e==null)return window;t=e.closest(".scroll,.scroll-y,.overflow-auto")}return T.includes(t)?window:t}function C(e){return e===window?window.pageYOffset||window.scrollY||document.body.scrollTop||0:e.scrollTop}function E(e){return e===window?window.pageXOffset||window.scrollX||document.body.scrollLeft||0:e.scrollLeft}let i;function k(){if(i!==void 0)return i;const e=document.createElement("p"),o=document.createElement("div");c(e,{width:"100%",height:"200px"}),c(o,{position:"absolute",top:"0px",left:"0px",visibility:"hidden",width:"200px",height:"150px",overflow:"hidden"}),o.appendChild(e),document.body.appendChild(o);const t=e.offsetWidth;o.style.overflow="scroll";let n=e.offsetWidth;return t===n&&(n=o.clientWidth),o.remove(),i=t-n,i}const Q=y({name:"QAvatar",props:{...g,fontSize:String,color:String,textColor:String,icon:String,square:Boolean,rounded:Boolean},setup(e,{slots:o}){const t=w(e),n=s(()=>"q-avatar"+(e.color?` bg-${e.color}`:"")+(e.textColor?` text-${e.textColor} q-chip--colored`:"")+(e.square===!0?" q-avatar--square":e.rounded===!0?" rounded-borders":"")),l=s(()=>e.fontSize?{fontSize:e.fontSize}:null);return()=>{const m=e.icon!==void 0?[r(S,{name:e.icon})]:void 0;return r("div",{class:n.value,style:t.value},[r("div",{class:"q-avatar__content row flex-center overflow-hidden",style:l.value},h(o.default,m))])}}});function P(){let e;const o=f();function t(){e=void 0}return u(t),d(t),{removeTick:t,registerTick(n){e=n,x(()=>{e===n&&(a(o)===!1&&e(),e=void 0)})}}}function W(){let e=null;const o=f();function t(){e!==null&&(clearTimeout(e),e=null)}return u(t),d(t),{removeTimeout:t,registerTimeout(n,l){t(),a(o)===!1&&(e=setTimeout(()=>{e=null,n()},l))}}}export{Q,C as a,E as b,k as c,W as d,q as g,p as s,P as u};
