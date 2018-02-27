const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const cleanCss = require('gulp-clean-css');
const del = require('del');
const jsonEditor = require('gulp-json-editor');
const zip = require('gulp-zip');

gulp.task('clean', () => {
    return del('build');
});

gulp.task('copy', callback => {
    gulp.src(['src/include/**/*.*', '!src/include/config/**'])
        .pipe(gulp.dest('build/include'));

    gulp.src(['src/main/**/*', '!src/main/{background,content,inject}/**/*', '!src/main/popup/**/*.{js,css}'])
        .pipe(gulp.dest('build/main'));

    callback();
});

gulp.task('js', callback => {
    const uglifyOptions = {
        warnings: true,
        mangle: { toplevel: true },
        output: { ascii_only: true }
    };

    gulp.src('src/main/background/*.js')
        .pipe(concat('background.min.js'))
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('build/main/background'));

    gulp.src('src/main/content/js/**/*.js')
        .pipe(concat('content.min.js'))
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('build/main/content'));

    gulp.src('src/main/inject/*.js')
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('build/main/inject'));

    gulp.src('src/main/popup/popup.js')
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('build/main/popup'));

    callback();
});

gulp.task('css', callback => {
    gulp.src('src/main/content/css/**/*.css')
        .pipe(concat('content.min.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('build/main/content'));

    gulp.src('src/main/popup/popup.css')
        .pipe(cleanCss())
        .pipe(gulp.dest('build/main/popup'));

    callback();
});

gulp.task('manifest', () => {
    return gulp.src('src/manifest.json')
        .pipe(jsonEditor(json => {
            const newContentJs = json.content_scripts[0].js.filter(
                file => file.indexOf('main/content/js/') === -1
            );
            newContentJs.push('main/content/content.min.js');

            const newBackgroundJs = json.background.scripts.filter(
                file => file.indexOf('main/background/') === -1
            );
            newBackgroundJs.push('main/background/background.min.js');

            json.content_scripts[0].js = newContentJs;
            json.content_scripts[0].css = ['main/content/content.min.css'];
            json.background.scripts = newBackgroundJs;

            return json;
        }, {
            'indent_size': 1
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('zip', () => {
    const manifest = require('./build/manifest.json');

    return gulp.src('build/**/*.*')
        .pipe(zip(`${manifest.name}_${manifest.version}.zip`))
        .pipe(gulp.dest('archives'));
});

gulp.task('default', gulp.series(
    'clean',
    gulp.parallel('copy', 'js', 'css', 'manifest')
));