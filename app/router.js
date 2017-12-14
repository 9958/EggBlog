'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const isAdmin = app.middlewares.checkAdmin()
  router.get('/', controller.home.index);
  router.get(/^\/p\/(\d+)$/, controller.home.index);
  router.get('/archives', controller.home.archives);
  router.get('/post/:id', controller.home.post);
  router.get('/tag/:tag', controller.home.tag);
  router.get('/page/:slug', controller.home.page);
  router.get('/search', controller.home.archives);

  //===============admin======================
  router.get('/admin/login', controller.admin.login);
	router.post('/admin/login', controller.admin.doLogin);
	router.get('/admin/logout', isAdmin, controller.admin.logout);
  router.get('/admin', isAdmin, controller.admin.index);
  router.get('/admin/post/write', isAdmin, controller.admin.postWrite);
  router.post('/admin/post/writeSave', isAdmin, controller.admin.postWriteSave);
  router.get('/admin/post', isAdmin, controller.admin.postIndex);
  router.get('/admin/post/edit/:id', isAdmin, controller.admin.postEdit);
  router.post('/admin/post/edit/:id', isAdmin, controller.admin.postEditSave);
  router.get('/admin/post/delete/:id', isAdmin, controller.admin.postDelete);

  router.get('/admin/page', isAdmin, controller.admin.pageIndex);
  router.get('/admin/page/edit/:id', isAdmin, controller.admin.pageEdit);
  router.post('/admin/page/edit/:id', isAdmin, controller.admin.pageEditSave);
  router.get('/admin/page/write', isAdmin, controller.admin.pageWrite);
  router.post('/admin/page/writeSave', isAdmin, controller.admin.pageWriteSave);
  router.get('/admin/page/delete/:id', isAdmin, controller.admin.pageDelete);

  app.get('/admin/tags', isAdmin, controller.admin.tag);
  app.post('/admin/tag_save', isAdmin, controller.admin.tagSave);
  app.post('/admin/tag_query', isAdmin, controller.admin.tagQuery);
};
