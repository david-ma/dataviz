"use strict";(self.webpackChunkdataviz=self.webpackChunkdataviz||[]).push([[737],{255:(e,t,a)=>{var l=a(839);a(717),console.log("Australian Income stuff");var n={Male:"#31a885",Female:"#fd9e83",Total:"#1e1e1e"},o={},i={Male:0,Female:0,Total:0};l.d3.csv("/blogposts/AusIncome.csv",(function(e){var t={percentile:parseInt(e.Percentile),sex:e.Sex,count:parseInt(e["Number of individuals "]),rawIncome:e["Ranged Taxable Income"].replace(/[$,]/g,"").match(/\d+/g).map((e=>parseInt(e))),income:0,cumulativePopulation:0};return t.income=t.rawIncome[1]?(t.rawIncome[0]+t.rawIncome[1])/2:t.rawIncome[0],t.cumulativePopulation=i[t.sex]+=t.count,o[t.percentile]?(o[t.percentile].count+=t.count,o[t.percentile].cumulativePopulation=i.Total+=t.count):(o[t.percentile]=l._.cloneDeep(t),o[t.percentile].sex="Total",o[t.percentile].cumulativePopulation=i.Total+=t.count),t})).then((e=>(e=l._.union(e,l._.flatMap(o)),new l.t({element:"income",title:"Australians in each income percentile",xLabel:"Percentile",yLabel:"Count",data:e,nav:!1}).generalisedLineChart({yField:"count",xField:"percentile",filter:"sex",rounding:1e4,types:[{label:"Male",color:"Blue"},{label:"Female",color:"Red"},{label:"Total",color:"black"}]}),e))).then((e=>(new l.t({element:"median",title:"Australian income by percentile",xLabel:"Percentile",yLabel:"Income",data:e,nav:!1}).generalisedLineChart({yField:"income",xField:"percentile",filter:"sex",rounding:1e4,yFormat:"$,"}),e))).then((e=>(new l.t({element:"cumulative",title:"Australian income by cumulative population",xLabel:"Cumulative Population",yLabel:"Income",data:e.filter((e=>"Total"!==e.sex)),nav:!1}).generalisedLineChart({yField:"income",xField:"cumulativePopulation",filter:"sex",rounding:1e4,xFormat:",",yFormat:"$,",types:[{label:"Male",color:"Blue"},{label:"Female",color:"Red"}]}),e))).then((e=>(new l.t({element:"cumulativePopulation",title:"Australian Cumulative Population by income",yLabel:"Cumulative Population",xLabel:"Income (log scale)",data:e.filter((e=>"Total"!==e.sex)),nav:!1}).generalisedLineChart({xField:"income",yField:"cumulativePopulation",filter:"sex",loggedX:!0,rounding:1e4,yFormat:",",xFormat:"$,",types:[{label:"Male",color:"Blue"},{label:"Female",color:"Red"}]}),e))).then((e=>(new l.t({element:"population",title:"Australian Population by income",yLabel:"Population",xLabel:"Income (log scale)",data:e.filter((e=>"Total"!==e.sex)),nav:!1}).generalisedLineChart({xField:"income",yField:"count",filter:"sex",rounding:1e4,loggedX:!0,yFormat:",",xFormat:"$,",types:[{label:"Male",color:"Blue"},{label:"Female",color:"Red"}]}),e))).then((e=>(new l.t({element:"percentile",title:"Australian income by percentile",xLabel:"Percentile",yLabel:"Income",data:e,nav:!1}).scratchpad((t=>{var a="income",n="percentile",o="sex",r=1e4,c=",",u="$,",p=[{label:"Male",color:"Blue"},{label:"Female",color:"Red"},{label:"Total",color:"black"}];const s=l.d3.scaleLinear().range([0,t.innerWidth]),d=l.d3.scaleLinear().range([t.innerHeight,0]),m=l.d3.line().x((function(e){return s(e[n])})).y((function(e){return d(e[a])}));s.domain(l.d3.extent(e,(e=>e[n]))),d.domain([0,Math.round(1.1*l.d3.max(e,(function(e){return e[a]}))/r)*r]),(p||[{label:"Total",color:"black"}]).forEach((e=>{var l=t.data.filter((t=>t[o]===e.label));t.plot.append("path").datum(l).attr("class","line").style("stroke",e.color).attr("d",m.x((function(t){return s(100*t.cumulativePopulation/i[e.label])}))),t.plot.append("text").datum(l.pop()).text(e.label).attr("fill",e.color).attr("x",(e=>s(e[n])+10)).attr("y",(e=>d(e[a])+5))})),t.plot.append("g").attr("class","axis").attr("transform","translate(0,"+t.innerHeight+")").call(l.d3.axisBottom(s).tickFormat(l.d3.format(c||""))),t.plot.append("g").attr("class","axis").call(l.d3.axisLeft(d).tickFormat(l.d3.format(u||"")))})),e))).then((e=>{var t={Male:0,Female:0};e.filter((e=>"Total"!==e.sex)).forEach((e=>{t[e.sex]+=e.income*e.count})),new l.t({element:"pie",title:"Income going to Men vs Women",data:e,nav:!1}).scratchpad((e=>{const a=e.innerWidth/2,o=e.innerHeight/2,i=e.plot.append("g").attr("transform",`translate(${a},${o})`),r=e.innerHeight/2.5,c=l.d3.pie().sort(null).value((function(e){return e}))(l._.flatMap(t));console.log("dataReady",c);const u=l.d3.arc().innerRadius(0*r).outerRadius(.8*r);l.d3.arc().innerRadius(.9*r).outerRadius(.9*r),i.selectAll("allSlices").data(c).enter().append("path").attr("d",u).attr("fill",(e=>n[e.index?"Female":"Male"])).attr("stroke","white").style("stroke-width","2px"),e.plot.append("text").text("Legend").attr("x",30).attr("y",30).style("font-size","24px"),e.plot.append("rect").attr("x",30).attr("y",50).attr("width",50).attr("height",50).attr("fill",n.Male),e.plot.append("text").text("Male").attr("x",90).attr("y",80).style("font-size","24px"),e.plot.append("rect").attr("x",30).attr("y",110).attr("width",50).attr("height",50).attr("fill",n.Female),e.plot.append("text").text("Female").attr("x",90).attr("y",140).style("font-size","24px")}))}))}},e=>{e(e.s=255)}]);