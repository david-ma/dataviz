import { Thalia } from '../../../server/thalia'





let config: Thalia.WebsiteConfig = {
  services: {
    hello: function (res, req, db) {
      res.end('Hello world!')
    }
  },
}



export { config }



