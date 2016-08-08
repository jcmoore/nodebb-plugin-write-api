'use strict';
/* globals module, require */

var posts = require.main.require('./src/posts'),
	SocketPosts = require.main.require('./src/socket.io/posts'),
	apiMiddleware = require('./middleware'),
	errorHandler = require('../../lib/errorHandler'),
	utils = require('./utils');

function MockSocket (uid) {
	this.uid = uid; // https://github.com/NodeBB/NodeBB/blob/61404be94b1ad0487256065a4030c1a9df8b54cd/src/socket.io/posts/favourites.js#L103-L150
}

MockSocket.prototype.emit = function () {};


module.exports = function(middleware) {
	var app = require('express').Router();

	app.route('/:pid')
		.put(apiMiddleware.requireUser, function(req, res) {
			if (!utils.checkRequired(['content'], req, res)) {
				return false;
			}

			var payload = {
				uid: req.user.uid,
				pid: req.params.pid,
				content: req.body.content,
				options: {}
			};

			if (req.body.handle) { payload.handle = req.body.handle; }
			if (req.body.title) { payload.title = req.body.title; }
			if (req.body.topic_thumb) { payload.options.topic_thumb = req.body.topic_thumb; }
			if (req.body.tags) { payload.options.tags = req.body.tags; }

			posts.edit(payload, function(err) {
				errorHandler.handle(err, res);
			})
		})
		.delete(apiMiddleware.requireUser, function(req, res) {
			posts.delete(req.params.pid, req.user.uid, function(err) {
				errorHandler.handle(err, res);
			});
		});

	app.route('/:pid/upvote')
		.post(apiMiddleware.requireUser, function(req, res) {
			var pid = req.params.pid;
			Posts.getPostField(pid, 'tid', function (err, tid) {
				if (err) errorHandler.handle(err, res);
				else SocketPosts.upvote(new MockSocket(req.user.uid), {
					pid: pid,
					room_id: "topic_" + tid, // https://github.com/NodeBB/NodeBB/blob/61404be94b1ad0487256065a4030c1a9df8b54cd/public/src/client/topic.js#L48
				}, function (fail) {
					errorHandler.handle(fail, res);
				});
			});
		});

	app.route('/:pid/downvote')
		.post(apiMiddleware.requireUser, function(req, res) {
			var pid = req.params.pid;
			Posts.getPostField(pid, 'tid', function (err, tid) {
				if (err) errorHandler.handle(err, res);
				else SocketPosts.downvote(new MockSocket(req.user.uid), {
					pid: pid,
					room_id: "topic_" + tid, // https://github.com/NodeBB/NodeBB/blob/61404be94b1ad0487256065a4030c1a9df8b54cd/public/src/client/topic.js#L48
				}, function (fail) {
					errorHandler.handle(fail, res);
				});
			});
		});

	app.route('/:pid/unvote')
		.post(apiMiddleware.requireUser, function(req, res) {
			var pid = req.params.pid;
			Posts.getPostField(pid, 'tid', function (err, tid) {
				if (err) errorHandler.handle(err, res);
				else SocketPosts.unvote(new MockSocket(req.user.uid), {
					pid: pid,
					room_id: "topic_" + tid, // https://github.com/NodeBB/NodeBB/blob/61404be94b1ad0487256065a4030c1a9df8b54cd/public/src/client/topic.js#L48
				}, function (fail) {
					errorHandler.handle(fail, res);
				});
			});
		});

	return app;
};
