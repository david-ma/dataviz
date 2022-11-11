import { Chart, _ } from 'chart'

console.log('This message is coming from atlassian.ts')


// Arrow characters to use: ▼ ▶ •

const backendData = [
  {
    id: "1",
    name: "Office Map"
  },
  {
    id: "2",
    name: "New Employee Onboarding",
    children: [
      {
        id: "8",
        name: "Onboarding Materials"
      },
      {
        id: "9",
        name: "Training"
      }
    ]
  },
  {
    id: "3",
    name: "Office Events",
    children: [
      {
        id: "6",
        name: "2018",
        children: [
          {
            id: "10",
            name: "Summer Picnic"
          },
          {
            id: "11",
            name: "Valentine's Day Party"
          },
          {
            id: "12",
            name: "New Year's Party"
          }
        ]
      },
      {
        id: "7",
        name: "2017",
        children: [
          {
            id: "13",
            name: "Company Anniversary Celebration"
          }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Public Holidays"
  },
  {
    id: "5",
    name: "Vacations and Sick Leaves"
  }
];

function fetchData() {
  return new Promise(resolve => {
    setTimeout(resolve, 100, backendData);
  });
}



function drawNode(list_element, node) {
  if (node.children) {
    list_element.classed("hasChildren", true)

    list_element.append('a')
    .text(node.name)
    .attr("href", "#")
    .on("click", d => {
        console.log('clicked')
        if(list_element.classed("collapsed")) {
          list_element.classed("collapsed", false)
        } else {
          list_element.classed("collapsed", true)
        }
      }
    )
    

    const next_level_list = list_element.append('ul')
    node.children.forEach(child => {
      drawNode(next_level_list.append('li'), child)
    })

  } else {
    list_element.text(node.name);
  }
}


fetchData().then((d:any) => {
  const list = d3.select("#list")

  d.forEach(function(node) {
    const li = list.append('li')
    drawNode( li , node )
  })

})








