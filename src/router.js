import Trie from './tree.js';

class Router {
  constructor(router) {
    const prefixTree = new Trie();
    for (let i = 0; i < router.length; i += 1) {
      const pathList = router[i].path.split('/');
      prefixTree.insert(pathList,
        router[i].handler,
        router[i].method,
        router[i].constraints);
      this.prefixTree = prefixTree;
    }
  }

  serve(request) {
    const requestPath = request.path;
    if (requestPath === '') {
      throw new Error('no such path');
    }
    const requestMethod = request.method;
    let ret = '';
    const pathSpited = requestPath.split('/');
    if (pathSpited[0] === '') {
      pathSpited.shift();
    }
    if (pathSpited[pathSpited.length - 1] === '') {
      pathSpited.pop();
    }
    const [found, params, handler] = this.prefixTree.contains(pathSpited, requestMethod);
    if (!found) {
      throw new Error('no such path');
    }
    // console.log(params);
    // console.log(handler);
    ret = {
      path: requestPath,
      handler,
      method: requestMethod,
      params,
    };
    return ret;
  }
}

export default (routers) => {
  const ret = new Router(routers);

  return ret;
};
