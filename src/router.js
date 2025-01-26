class Router {
  router;
  paths
  constructor(router) {
    this.router = router;
    this.paths = []
  }
  serve(path){
    console.log("============")
    let ret = 0
    for (const  i in this.router){
      if (this.router[i]['path'] == path) {
        ret = this.router[i]['handler']
      }
    }
//    const obj = Object.fromEntries(ret);
    return Function(ret)
  }
}

function courses(){
  console.log("33332211111");
}

export default (routers) => {
  const ret = new Router(routers);
  return ret;
}

