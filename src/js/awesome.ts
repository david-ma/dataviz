
const md = new showdown.Converter({ openLinksInNewWindow: true });
const socket = io("/dataviz");

/**
 * Todo:
 * sort by votes
 * hide/show project when tab is selected?
 * filter by categories
 * add better categories
 * photos?
 * security???
 */

let initialData = {};
socket.on("allData", (packet) => {
    initialData = packet;
    console.log("Receiving initial Data!", initialData);
    window.setTimeout(() => {
        Object.keys(initialData).forEach( (key) => {
            var type = key.split("-")[0];
            if( type == 'category') {
                $(`#${key}`).prop('checked', initialData[key]);
            } else {
                $(`#${key}`).val(initialData[key]);
            }
            if(type == "signatures") countVotes(key);
        })
    }, 100)
});

socket.on("overwriteText", (packet) => {
    const element = $(`#${packet.name}`);
    const type = packet.name.split("-")[0];

    if( type == 'category') {
        element.prop('checked', packet.data);
    } else {
        const properties = {
            "selectionStart": element.prop("selectionStart"),
            "selectionEnd" : element.prop("selectionEnd")
        }
        element.val(packet.data);
        if(properties.selectionStart) element.prop(properties);
    }
    if(type == "signatures") countVotes(packet.name);
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

                right.append("h3").text("Applicable Categories:");
                const categories = {
                    "Social Justice": "Description goes here",
                    "Art": "Some sorta art piece??",
                    "Healthcare": "Has a healthcare aspect to it",
                    "Big Impact": "Our $1000 will make a real to the cause / it wouldn't happen without our help",
                    "Viable": "Sounds like these peeps will get the job done"
                }
                right.append("ul").attrs({
                    class: "categoryList row"
                }).selectAll("li").data(Object.keys(categories))
                    .enter()
                    .append("li")
                    .attr("id", category => `categoryLi-${d.id}-${cssSelectorSafe(category)}`)
                    .each(category => {
                        const li = d3.select(`#categoryLi-${d.id}-${cssSelectorSafe(category)}`);
                        const elementId = `category-${d.id}-${cssSelectorSafe(category)}`

                        li.append("input").attrs({
                            id: elementId,
                            type: "checkbox"
                        })
                        .on("input", function(){
                            const value = $(`#${elementId}`).is(':checked');
                            socket.emit("overwriteText", {
                                name: elementId,
                                data: value
                            });
                        });
                        li.append("label").text(category).attrs({
                            for: elementId
                        });
                        li.append("p")
                        .classed("categoryDesription", true)
                        .text(categories[category]);
                    });

                right.append("h3").text("Follow up items:");
                right.append("textarea")
                .classed("debrief", true)
                .attrs({
                    id: `debrief-${d.id}`,
                    name: `debrief-${d.id}`,
                    placeholder: `What other things could be done for this project, besides money? What advice can we give them?`
                }).on("keyup", function(d){
                    var text = $(this).val();
                    socket.emit("overwriteText", {
                        name: `debrief-${d.id}`,
                        data: text
                    });
                }).text(() => {
                    var data = initialData[`debrief-${d.id}`]
                    if (data) {
                        return initialData[`debrief-${d.id}`];
                    } else {
                        return "";
                    }
                });

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

function cssSelectorSafe(string) {
    return string.toLowerCase().replace(/[ .!$#{}'"`\/\\\[\]]/, "-");
}