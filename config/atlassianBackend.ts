import { Thalia } from '../../../server/thalia'

const backendData = [
  {
    id: '1',
    name: 'Office Map',
  },
  {
    id: '2',
    name: 'New Employee Onboarding',
    children: [
      {
        id: '8',
        name: 'Onboarding Materials',
      },
      {
        id: '9',
        name: 'Training',
      },
    ],
  },
  {
    id: '3',
    name: 'Office Events',
    children: [
      {
        id: '6',
        name: '2018',
        children: [
          {
            id: '10',
            name: 'Summer Picnic',
          },
          {
            id: '11',
            name: "Valentine's Day Party",
          },
          {
            id: '12',
            name: "New Year's Party",
          },
        ],
      },
      {
        id: '7',
        name: '2017',
        children: [
          {
            id: '13',
            name: 'Company Anniversary Celebration',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    name: 'Public Holidays',
  },
  {
    id: '5',
    name: 'Vacations and Sick Leaves',
  },
]

let config: Thalia.WebsiteConfig = {
  services: {
    hello: function (res, req, db) {
      console.log('Hey atlassian, the time is ' + new Date().toString())

      res.end('Hello world!')
    },
    backendData: function (res, req, db) {
      res.end(JSON.stringify(backendData))
    },
  },
}

export { config }
