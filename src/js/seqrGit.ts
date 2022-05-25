var allIssues = {}

Promise.all([
  d3.tsv('/seqr/gitReport.txt', function (d: d3.DSVRowString<string>) {
    console.log(d)
    return d
  }),
  d3.json('/seqr/100issues.json'),
  d3.json('/seqr/200issues.json'),
  d3.json('/seqr/300issues.json'),
]).then(([newMcriIssues, github100, github200, github300]: [any, any, any, any]) => {
  github100.map((issue) => {
    allIssues[issue.number] = issue
  })
  github200.map((issue) => {
    allIssues[issue.number] = issue
  })
  github300.map((issue) => {
    allIssues[issue.number] = issue
  })

  var filteredIssues = newMcriIssues.filter((d) => {
    var issue = d.issue.slice(1);
    return allIssues[issue].body !== null && allIssues[issue].title !== 'Dev'
  })

  // d3.select('#gitIssueTable').selectAll("tr").data(newMcriIssues)
  d3.select('#gitIssueTable').selectAll("tr").data(filteredIssues)
    .enter()
    .append('tr')
    .html(function (d: any) {
      const issue = d.issue.slice(1);
      return `<td><a href="https://github.com/broadinstitute/seqr/pull/${issue}">${d.issue}</a></td>
      <td>${d.date}</td>
      <td>${allIssues[issue].title}</td>
      <td>${allIssues[issue].body}</td>`
    });
  
})
