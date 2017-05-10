var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    pug = require("gulp-pug");

gulp.task('sass', function () {
    return gulp.src('src/sass/**/*.sass')
        .pipe(sass())
        .pipe(autoprefixer(['last 15 version', '>1%', 'ie 8', 'ie 7'], {cascade: true}))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'src'
        },
        notify: false
    });
});
gulp.task('scripts', function () {
    var scriptES6 = gulp.src('src/js/main.ES6.js')
        .pipe(babel())
        .pipe(rename('main.js'))
        .pipe(gulp.dest('src/js'));
    return gulp.src('src/libs/bootstrap/dist/js/bootstrap.min.js')
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js'));
});

gulp.task("babel", function () {
    return gulp.src("src/js/main.ES6.js")
        .pipe(babel())
        .pipe(rename("main.js"))
        .pipe(gulp.dest("src/js"));
});

gulp.task('css-libs', ["css-nano", 'sass'], function () {
    return gulp.src('src/css/libs.css')
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('src/css'));
});

gulp.task("css-nano", ["sass"], () => {
    return gulp.src("src/css/main.css")
        .pipe(cssnano())
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest("src/css"));
});

gulp.task("pug", ()=>{
    return gulp.src("src/*.pug")
        .pipe(pug())
        .pipe(gulp.dest("src"));
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts', "pug"], function () {
    gulp.watch('src/sass/**/*.sass', ["css-nano", browserSync.reload]);
    gulp.watch('src/*.pug', ["pug", browserSync.reload]);
    gulp.watch("src/js/main.ES6.js", ["babel", browserSync.reload]);
});

gulp.task('clean', function () {
    return del.sync('dist');
});

gulp.task('img', function () {
    return gulp.src('src/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts', "pug"], function () {
    var buildCss = gulp.src([
        'src/css/main.min.css',
        'src/css/libs.min.css'
    ]).pipe(gulp.dest('dist/css'));
    var buildFonts = gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
    var buildJs = gulp.src(['src/js/main.js', 'src/js/libs.min.js'])
        .pipe(gulp.dest('dist/js'));
    var buildHtml = gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('clear', function (callback) {
    return cache.clearAll();
});

gulp.task('default', ['watch']);