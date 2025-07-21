// @ts-nocheck

const sd = new showdown.Converter({
  openLinksInNewWindow: true,
})

type Issue = {
  number: number
  title: string
  body: string
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string
  state: string
}

type Commit = {
  author: string
  date: string
  description: string
  hash: string
  issue: string
}

var allIssues: {
  [key: string]: Issue
} = {}

Promise.all([
  d3.tsv('/seqr/gitReport.txt', function (d: d3.DSVRowString<string>) {
    return d
  }),
  d3.json('/seqr/100issues.json'),
  d3.json('/seqr/200issues.json'),
  d3.json('/seqr/300issues.json'),
  d3.json('/seqr/22may100issues.json'),
  d3.json('/seqr/22may200issues.json'),
  d3.json('/seqr/22may300issues.json'),
  d3.json('/seqr/22may400issues.json'),
  d3.json('/seqr/22may500issues.json'),
  d3.json('/seqr/22may600issues.json'),
]).then(
  ([
    newMcriIssues,
    github100,
    github200,
    github300,
    git100,
    git200,
    git300,
    git400,
    git500,
    git600,
  ]: [
    any,
    Issue[],
    Issue[],
    Issue[],
    Issue[],
    Issue[],
    Issue[],
    Issue[],
    Issue[],
    Issue[],
  ]) => {
    ;[
      github100,
      github200,
      github300,
      git100,
      git200,
      git300,
      git400,
      git500,
      git600,
    ].forEach((issueGroup) => {
      issueGroup.forEach((issue) => {
        allIssues[issue.number] = issue
      })
    })

    var unknownIssues = {}

    var seenIssues = {}

    var filteredIssues = newMcriIssues.filter((d) => {
      var issue = d.issue.slice(1)
      if (seenIssues[issue]) {
        return false
      }
      seenIssues[issue] = true

      if (!allIssues[issue]) {
        console.log(d)
        console.log(
          `Issue #${issue} by ${d.author} in ${d.hash} not found in allIssues`,
        )
        unknownIssues[issue] = d
        return false
      }
      return allIssues[issue].body !== null && allIssues[issue].title !== 'Dev'
    })

    // d3.select('#gitIssueTable').selectAll("tr").data(newMcriIssues)
    d3.select('#gitIssueTable')
      .selectAll('tr')
      .data(filteredIssues)
      .enter()
      .append('tr')
      .html(function (d: Commit) {
        const issue = d.issue.slice(1)
        return `<td><a href="https://github.com/broadinstitute/seqr/pull/${issue}">${d.issue}</a></td>
      <td class='date'>${d.date}</td>
      <td>${allIssues[issue].title}</td>
      <td class='body'>${allIssues[issue].body}</td>`
      })
      .select('.body')
      .html(function (d: any) {
        const issue = d.issue.slice(1)
        return sd.makeHtml(allIssues[issue].body.replaceAll('<img', '\n<img'))
      })
  },
)
