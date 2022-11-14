import { Thalia } from '../../../server/thalia'



let config: Thalia.WebsiteConfig = {
  services: {
    hello: function (res, req, db) {
      console.log('Hey atlassian, the time is ' + new Date().toString())

      res.end('Hello world!')
    },
  },
}

export { config }
