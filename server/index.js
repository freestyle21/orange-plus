/*
 * Nsky Bus
 *
 * @date 2015/02/29
 * @author qubaoming@gmail.com
*/

'use strict';

const path    = require('path')
const koa     = require('koa')
const router  = require('koa-router')
const render  = require('koa-views')
const serve   = require('koa-static')

const app = koa()

const routesInstance = require('./routes/index')

// serve files from ./client
app.use(serve(path.join(__dirname, '../client/')))
   .use(render(path.join(__dirname, "./"), {
        map: {
           html: 'ejs'
        }
   }))
   .use(router(app))

routesInstance(app)

module.exports = app
