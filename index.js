import makeRouter from './src/router.js';


const routes = [
  {
    method: 'GET',
    path: '/courses/:id',
    constraints: { },
    handler: () => 'course!',
  },
  {
    method: 'POST',
    path: '/courses/:course_id/exercises/:id',
    constraints: { id: /\d+/, course_id: (courseId) => courseId.startsWith('js') },
    handler: () => 'exercise!',
  },
  {
    method: 'GET',
    path: '/courses/11111/exercises/2222',
    constraints: { },
    handler: () => 'exercise!',
  },
  {
    method: 'GET',
    path: '/courses/11111/exercises/:id',
    constraints: { },
    handler: () => 'exercise!',
  },    
];

  const router = makeRouter(routes);
  
//  const path = '/courses/php_trees';
  const path = '/courses/js22222/exercises/5555';
  const handler = router.serve(path);
  console.log(handler);
//  console.log(handler()); // courses!
  
  // здесь выбросится исключение
//  console.log(router.serve('/no_such_way'));

