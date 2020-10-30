
const md = new showdown.Converter({ openLinksInNewWindow: true });

const socket = io("/dataviz");

let initialData = {};
socket.on("allData", (packet) => {
    initialData = packet;
    console.log("Receiving initial Data!", initialData);
    Object.keys(initialData).forEach( (key) => {
        $(`#${key}`).val(initialData[key]);
        var type = key.split("-")[0];
        if(type == "signatures") countVotes(key);
    })
});

socket.on("overwriteText", (packet) => {
    const element = $(`#${packet.name}`);
    var properties = {
        "selectionStart": element.prop("selectionStart"),
        "selectionEnd" : element.prop("selectionEnd")
    }

    $(`#${packet.name}`).val(packet.data);
    if(properties.selectionStart) $(`#${packet.name}`).prop(properties);
});


d3.csv("/melbourne_export_october.csv", function (d, i, columns) {
    if (d.hidden_at == "") {
        // console.log(d);
        return d;
    } else {
        return null;
    }
}).then(function (d) {
    // console.log(d);
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
            tab.append("label").attr("for", "tab-" + d.id).text(d.title)
            .append("span").attrs({
                id: `tabVotes-${d.id}`
            });

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

            right.append("h3").text("Awesome Trustee Comments:");
            right.append("textarea")
                .classed("comments", true)
                .attrs({
                    id: `comments-${d.id}`,
                    name: `comments-${d.id}`,
                    placeholder: `Write collaborative comments here`
                }).on("keyup", function(d){
                    var text = $(this).val();
                    socket.emit("overwriteText", {
                        name: `comments-${d.id}`,
                        data: text
                    });
                }).text(() => {
                    var data = initialData[`comments-${d.id}`]
                    if (data) {
                        return initialData[`comments-${d.id}`];
                    } else {
                        return "";
                    }
                });

                right.append("h3").text("Votes:").append("span").attrs({
                    id: `voteCounts-${d.id}`
                });
                right.append("input")
                .classed("signatures", true)
                .attrs({
                    id: `signatures-${d.id}`,
                    name: `signatures-${d.id}`,
                    placeholder: `Add comma seperated names to vote. E.g. "David Ma, Jon King, Lauren Gawne, Megan Flamer"`
                }).on("keyup", function(d){
                    var text = $(this).val();
                    socket.emit("overwriteText", {
                        name: `signatures-${d.id}`,
                        data: text
                    });
                }).text(() => {
                    var data = initialData[`signatures-${d.id}`]
                    if (data) {
                        return initialData[`signatures-${d.id}`];
                    } else {
                        return "";
                    }
                }).on("input", countVotes);

            // console.log(d);
        });
});

function countVotes(id) {
    let text = "";
    if(typeof id == "string") {
        text = $(`#${id}`).val() as string;
    } else {
        text = $(this).val() as string;
        id = d3.select(this).attr("id");
    }

    // let text = $(`#signatures-${d.id}`).val() as string;
    let votes = text ? text.split(",").length : 0;
    let ideaID = id.split('-')[1];
    d3.select(`#voteCounts-${ideaID}`).text(` (${votes})`);
    d3.select(`#tabVotes-${ideaID}`).text(` (${votes})`);
}
