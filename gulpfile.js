const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const cleanCss = require('gulp-clean-css');
const del = require('del');
const jsonEditor = require('gulp-json-editor');
const zip = require('gulp-zip');

gulp.task('clean', () => {
    return del('public');
});

gulp.task('copy', callback => {
    gulp.src(['include/**/*.*', '!include/config/**'])
        .pipe(gulp.dest('public/include'));

    gulp.src(['main/**/*', '!main/{background,content}/**/*', '!main/popup/**/*.{js,css}'])
        .pipe(gulp.dest('public/main'));

    callback();
});

gulp.task('js', callback => {
    const uglifyOptions = {
        warnings: true,
        mangle: { toplevel: true },
        output: { ascii_only: true }
    };

    gulp.src('main/content/js/**/*.js')
        .pipe(concat('content.min.js'))
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('public/main/content'));

    gulp.src('main/background/*.js')
        .pipe(concat('background.min.js'))
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('public/main/background'));

    gulp.src('main/popup/popup.js')
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('public/main/popup'));

    callback();
});

gulp.task('css', callback => {
    gulp.src('main/content/css/**/*.css')
        .pipe(concat('content.min.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('public/main/content'));

    gulp.src('main/popup/popup.css')
        .pipe(cleanCss())
        .pipe(gulp.dest('public/main/popup'));

    callback();
});

gulp.task('manifest', () => {
    return gulp.src('manifest.json')
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
        .pipe(gulp.dest('public'));
});

gulp.task('zip', () => {
    const manifest = require('./manifest.json');

    return gulp.src('public/**/*.*')
        .pipe(zip(`${manifest.name}_${manifest.version}.zip`))
        .pipe(gulp.dest('builds'));
});

gulp.task('default', gulp.series(
    'clean',
    gulp.parallel('copy', 'js', 'css', 'manifest')
));