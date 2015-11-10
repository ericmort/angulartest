
var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var connect = require('gulp-connect');
var watch = require('gulp-watch');
var sass = require('gulp-sass');

// Delete the public directory
gulp.task('clean', function() {
 return gulp.src('public')
 .pipe(clean());
});

//Concat and copy all local JavaScript to the public dir
gulp.task('js', function(){
	gulp.src(['app/modules/**/*.js'])
		.pipe(concat('app.js'))
		.pipe(gulp.dest('public/scripts'));
});

//Concat and copy all other JavaScript to the public dir
gulp.task('js-vendor', function(){
	gulp.src([
            'bower_components/appstax/appstax.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-aria/angular-aria.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-material/angular-material.js',
            //'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/gdsmith-jquery-easing/jquery.easing.1.3.min.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',  
            'bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.js',
            'bower_components/angular-loading-bar/build/loading-bar.js',
            'bower_components/bootstrap/dist/js/bootstrap.js'
            /*
            'bower_components/angular-animate/angular-animate.min.js',
            'bower_components/angular-deckgrid/angular-deckgrid.js',
      			'bower_components/ng-flow/dist/ng-flow-standalone.min.js',
            'bower_components/ladda/js/spin.js',
            'bower_components/ladda/js/ladda.js',
            'bower_components/angular-ladda/dist/angular-ladda.min.js',
            'bower_components/spin.js/spin.js',
            'bower_components/angular-spinner/angular-spinner.js',
            'bower_components/gdsmith-jquery-easing/jquery.easing.1.3.min.js'*/
      ])
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('public/scripts'));
});

gulp.task('html', function(){
	gulp.src([
            'app/index.html', 
            'app/modules/main/main.html',
            'app/modules/main/groups.html',
            'app/lightbox.html'
      ],{base: './app'})
		.pipe(gulp.dest('public'));
});

gulp.task('css', function(){
	gulp.src([
          'app/styles/animate.css', 
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/ladda/dist/ladda-themeless.min.css', 
          'bower_components/angular-loading-bar/src/loading-bar.css', 
          'bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.css'
    ])
    .pipe(concat('vendor.css'))
		.pipe(gulp.dest('public/styles'));
});

//Compile and copy Sass files
gulp.task('sass', function() {
	gulp.src('app/styles/**/*.scss')
		.pipe(sass())
    .pipe(concat('app.css'))
		.pipe(gulp.dest('public/styles'));
});

//Copy all images
gulp.task('img', function(){
	gulp.src(['app/images/**/*'])
		.pipe(gulp.dest('public/images'));
});

gulp.task('assets', function(){
	gulp.src('app/bower_components/bootstrap/dist/fonts/**/*', {base: './app/bower_components'})
		.pipe(gulp.dest('public/styles'));
});

gulp.task('fonts', function(){
    gulp.src('app/fonts/*')
        .pipe(gulp.dest('public/fonts'));
});

//Starts the web server and watch for changes
gulp.task('server', function() {
  connect.server({
  	port:9000,
  	
  	livereload: true,
  	root: ['public']
  });
});

//Watch relevant files and rerun tasks accordingly
gulp.task('watch', function() {
    gulp.watch('app/modules/**/*.js', ['js']);
    gulp.watch('app/styles/**/*.scss', ['sass']);
    gulp.watch('app/styles/**/*.css', ['css']);
    gulp.watch('app/**/*.html', ['html']);
});

gulp.task('livereload', function() {
  gulp.src(['public/styles/*.css', 'public/scripts/*.js', 'public/modules/**/*.html'])
    .pipe(watch())
    .pipe(connect.reload());
});


// Default Task
gulp.task('default', ['js', 'js-vendor', 'html',  'sass', 'css', 'img', 'assets', 'fonts']);

gulp.task('serve', ['default','server', 'livereload', 'watch']);
