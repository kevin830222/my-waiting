'use strict';

/*====================================
=            bower & sass            =
====================================*/

var gulp = require('gulp');
var bower = require('gulp-bower');
var sass = require('gulp-sass');

gulp.task('bower', function() {
	return bower('./public/lib/');
});

gulp.task('sass', function() {
	return gulp.src('./app/sass/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', function() {
	gulp.watch('./app/sass/**/*.scss', ['sass']);
});



/*==========================================
=            Move Static Files            =
==========================================*/

var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var file_static_css = [
	'./app/css/component.css',
	'./app/css/style.css',
];

var file_static_js = [
	'./app/js/main.js'
];

gulp.task('move', function() {
	for (var i in file_static_css) {
		gulp.src(file_static_css[i])
			.pipe(cssmin())
			.pipe(rename({ suffix: '.min' }))
			.pipe(gulp.dest('./public/css'));
	}
	for (var i in file_static_js) {
		gulp.src(file_static_js[i])
			.pipe(uglify())
			.pipe(rename({ suffix: '.min' }))
			.pipe(gulp.dest('./public/js'));
	}
});

gulp.task('move:watch', function() {
	for (var i in file_static_css) {
		gulp.watch(file_static_css[i], ['move']);
	}
	for (var i in file_static_js) {
		gulp.watch(file_static_js[i], ['move']);
	}
});

gulp.task('watch', ['sass', 'sass:watch', 'move', 'move:watch']);
gulp.task('default', ['bower', 'sass', 'move']);
