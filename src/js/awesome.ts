
const md = new showdown.Converter({ openLinksInNewWindow: true });

d3.csv("/melbourne_export_october.csv", function (d, i, columns) {
    if (d.hidden_at == "") {
        console.log(d);
        return d;
    } else {
        return null;
    }
}).then(function (d) {
    console.log(d);
    d3.select("#AwesomeStuff")
        .selectAll("div")
        .data(d)
        .enter()
        .append("div")
        .classed("project", true)
        .attr("id", (d) => "project-" + d.id)
        .each(function (d) {
            var tab = d3.select("#tabs").append("li");
            tab.append("input").attr("id", "tab-" + d.id).attrs({
                type: 'radio',
                name: 'tabs'
            });
            tab.append("label").attr("for", "tab-" + d.id).text(d.title);
            // <input type="radio" id="male" name="gender" value="male">
            // <label for="male">Male</label><br>

            var box = d3.select(this);
            box.append("h1")
                .append("a")
                .attr("href", d.url)
                .text(d.title);
            box.append("p").text(d.url);

            box.append("h2").text(d.name);

            box.append("h3").text("Here's my idea:");
            box.append("div").attr("id", "description-" + d.id);
            $("#description-" + d.id).html(md.makeHtml(d.about_project));

            box.append('h3').text('How I will use the money:');

            box.append("div").attr("id", "use-" + d.id);
            $("#use-" + d.id).html(md.makeHtml(d.use_for_money));

            box.append('h3').text('A little about me:');
            box.append("div").attr("id", "me-" + d.id);
            $("#me-" + d.id).html(md.makeHtml(d.about_me));


            console.log(d);
        })
});