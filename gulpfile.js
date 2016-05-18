'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const HandlebarsLayouts = require('handlebars-layouts');

Handlebars.registerHelper(HandlebarsLayouts(Handlebars));
Handlebars.registerHelper('rivetData', function(obj) {
	if (obj.data.root.rivetData)
		return JSON.stringify(obj.data.root.rivetData);
	else
		return '{}';
});

const config = {
    contentRoot:  './template',
    buildRoot:    './build',
    templateRoot: './template'
}

const plugins = {
    'metalsmith-matters':     {
        'delims':  ['```json', '```'],
        'options': {
            'lang': 'json'
        }
    },
    'metalsmith-collections': {
        'blog': {
            'sortBy':  'date',
            'reverse': true
        }
    },
    'metalsmith-pagination':  {
        'collections.blog': {
            'layout':    'blog.html',
            'first':     'blog/index.html',
            'path':      'blog/:num/index.html',
            'perPage':   6,
            'noPageOne': true
        }
    },
    'metalsmith-markdown':    {},
    'metalsmith-layouts':     {
        'engine':    'handlebars',
        'directory': config.templateRoot,
        'partials':  config.templateRoot + '/partial'
    }
};

gulp.task('metalsmith', function (callback) {
    let ms = new Metalsmith(process.cwd());

    ms.source(config.contentRoot);
    ms.destination(config.buildRoot);
    ms.metadata({});

    ms.frontmatter(false);

    Object.keys(plugins).forEach(function (key) {
        let plugin = require(key);
        let options = plugins[key];

        if (options._metalsmith_if !== undefined) {
            let condition = false;
            if (options._metalsmith_if === "production") {
                condition = argv.production;
            } else if (options._metalsmith_if === "build") {
                condition = argv.build;
            }

            if (condition) {
                options._metalsmith_if = undefined;
                delete options._metalsmith_if;
                ms.use(plugin(options));
            }
        } else {
            ms.use(plugin(options));
        }
    });

    ms.build(function (err) {
        if (err) {
            console.log(err);
            callback(err);
        }
        callback();
    });
});

gulp.task('watch', [], function () {
    watch([
        config.contentRoot + '/**/*',
        config.templateRoot + '/**/*'
    ], function () {
        gulp.start(['metalsmith']);
    });
});

gulp.task('default', ['metalsmith']);
