(self.webpackChunkdataviz=self.webpackChunkdataviz||[]).push([[551],{111:(t,a,s)=>{var e=s(165),r=e.select("#cards");e.csv("/cards.csv").then((function(t){const a=[];t.forEach((function(t){a.push({Type:"Prompt",Category:t.Category,Words:t.Prompt}),a.push({Type:"Category",Category:t.Category,Words:t.Category})}));const s=[];let e=[];a.forEach((function(t){e.push(t),9===e.length&&(s.push(e),e=[])})),s.forEach((function(t){r.append("div").attr("class","set").selectAll("div.card").data(t).enter().append("div").attr("class","card").html((function(t){return"Category"===t.Type?`<div class="category">${t.Category}</div>`:`\n            <div class="sideprompt">${t.Words}</div>\n            <div class="prompt">${t.Words}</div>\n          `}))}))}))}},t=>{t(t.s=111)}]);