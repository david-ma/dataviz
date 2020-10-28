
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
        .classed("row", true)
        .each(function (d) {
            var tab = d3.select("#tabs").append("li");
            tab.append("input").attr("id", "tab-" + d.id).attrs({
                type: 'radio',
                name: 'tabs'
            });
            tab.append("label").attr("for", "tab-" + d.id).text(d.title);

            var project = d3.select(this);
            var header = project.append("div");
            var left = project.append("div").classed("col-xs-6", true);
            var right = project.append("div").classed("col-xs-6", true);

            header.append("h1")
                .append("a")
                .attr("href", d.url)
                .text(d.title);

            header.append("span").text(d.name +' - ')
                .append("a").text(d.url);

            left.append("h3").text("Here's my idea:");
            left.append("div").attr("id", "description-" + d.id);
            $("#description-" + d.id).html(md.makeHtml(d.about_project));

            left.append('h3').text('How I will use the money:');

            left.append("div").attr("id", "use-" + d.id);
            $("#use-" + d.id).html(md.makeHtml(d.use_for_money));

            left.append('h3').text('A little about me:');
            left.append("div").attr("id", "me-" + d.id);
            $("#me-" + d.id).html(md.makeHtml(d.about_me));

            right.append("textarea")
                .classed("comments", true)
                .attrs({
                    id: `comments-${d.id}`
                });

            console.log(d);
        })
});