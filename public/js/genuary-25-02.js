"use strict";(self.webpackChunkdataviz=self.webpackChunkdataviz||[]).push([[915],{9367:(t,a,e)=>{var i=e(4345),n=e(7569);const s=1080;class r{constructor(t){this.cards=[],this.animationId=null,this.chart=t,this.animate=this.animate.bind(this)}addCard(t,a,e){const i={x:t,y:a,vector:{x:5,y:10},image:e,isAnimating:!0};this.cards.push(i),this.animationId||(this.animationId=requestAnimationFrame(this.animate))}animate(){this.chart.context.fillStyle="#213",this.chart.context.fillRect(0,0,s,800),this.cards=this.cards.filter((t=>t.isAnimating)),this.cards.forEach((t=>{t.x+=t.vector.x,t.y+=t.vector.y,t.vector.y+=.1,t.y>614&&(t.y=614,Math.abs(t.vector.y)>.1?t.vector.y*=-.4:t.isAnimating=!1),this.chart.context.drawImage(t.image,t.x,t.y)})),this.cards.some((t=>t.isAnimating))?this.animationId=requestAnimationFrame(this.animate):this.animationId=null}}function c(t){t.context.fillStyle="#213",t.context.fillRect(0,0,s,800),t.svg.selectAll("*").remove()}n.when(n.ready).then((function(){const t=new i.t1({element:"day2viz",margin:20,width:s,height:800,nav:!1,renderer:"canvas"}).scratchpad(c),a=new r(t),e=new Image;e.src="/images/Balatro-red_deck.png";const n=t.svg.append("text").text("Click and Drag me around the screen").attr("x",180).attr("y",135).attr("fill","white").attr("font-family","m6x11").attr("font-size","60px");let o=0;const h=setInterval((()=>{n.text("Click and Drag me around the screen".slice(0,o)),o=(o+1)%36}),100);t.svg.append("image").attr("href","/images/Balatro-red_deck.png").attr("x",20).attr("y",20).call(i.d3.drag().on("start",(function(){clearInterval(h),n.remove()})).on("drag",(function(t){const n=t.x-69,s=t.y-93;i.d3.select(this).attr("x",n).attr("y",s),a.addCard(n,s,e)})))}))}},t=>{t(t.s=9367)}]);