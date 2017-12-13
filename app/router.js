'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get(/^\/p\/(\d+)$/, controller.home.index);
  router.get('/archives', controller.home.archives);
  router.get('/post/:id', controller.home.post);
  router.get('/tag/:tag', controller.home.tag);
  router.get('/page/:slug', controller.home.page);
  router.get('/search', controller.home.archives);

  //===============admin======================
  router.get('/admin', controller.admin.index);
  router.get('/admin/post/write', controller.admin.postWrite);
  router.post('/admin/post/writeSave', controller.admin.postWriteSave);
  router.get('/admin/post', controller.admin.postIndex);
  router.get('/admin/post/edit/:id', controller.admin.postEdit);
  router.post('/admin/post/edit/:id', controller.admin.postEditSave);
  router.get('/admin/post/delete/:id', controller.admin.postDelete);

  router.get('/admin/page', controller.admin.pageIndex);
  router.get('/admin/page/edit/:id', controller.admin.pageEdit);
  router.post('/admin/page/edit/:id', controller.admin.pageEditSave);
  router.get('/admin/page/write', controller.admin.pageWrite);
  router.post('/admin/page/writeSave', controller.admin.pageWriteSave);
  router.get('/admin/page/delete/:id', controller.admin.pageDelete);

  app.get('/admin/tags', controller.admin.tag);
  app.post('/admin/tag_save', controller.admin.tagSave);
  app.post('/admin/tag_query', controller.admin.tagQuery);
};
