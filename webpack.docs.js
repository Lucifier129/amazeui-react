import path from 'path';
import webpack from 'webpack';
import marked from 'marked';
import hl from 'highlight.js';
import HTMLWebpackPlugin from 'html-webpack-plugin';

const isProduction = true;
const codeRenderer = function(code, lang) {
  lang = lang === 'js' ? 'javascript' : lang;
  if (lang === 'html') {
    lang = 'xml';
  }

  let hlCode = lang ?
    hl.highlight(lang, code).value : hl.highlightAuto(code).value;

  return `<div class="doc-highlight"><pre>
<code class="${lang || ''}">${hlCode}</code></pre></div>`;
};

let renderer = new marked.Renderer();
renderer.code = codeRenderer;

const entry = './docs/app.js';
const devEntry = [
  'webpack/hot/dev-server',
  'webpack-hot-middleware/client?reload=true',
  entry,
];
const basePlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  }),
  new HTMLWebpackPlugin({
    title: 'Amaze UI React',
    template: 'docs/index.html',
    inject: false,
    UICDN: isProduction ? '' : '',
    assets: isProduction ? '' : '',
    stat: isProduction,
    minify: isProduction ? {
      removeComments: true,
      collapseWhitespace: true
    } : null,
  }),
];
const envPlugins = isProduction ? [
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  new webpack.BannerPlugin(`Last update: ${new Date().toString()}`),
] : [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
];

export default {
  debug: !isProduction,
  devtool: !isProduction ? '#eval' : null,

  entry: isProduction ? entry : devEntry,

  output: {
    path: path.join(__dirname, 'www'),
    filename: `app.[hash:7]${isProduction ? '.min' : ''}.js`,
    chunkFilename: '[id].chunk.js',
    publicPath: '/'
  },

  module: {
    // noParse: /babel-core/,
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'react-hot',
          'transform/cacheable?brfs',
          'babel'
        ],
      },
      {
        test: /\.less$/,
        loaders: [
          'style',
          'css?minimize',
          'autoprefixer',
          'less'
        ],
        include: [
          path.join(__dirname, 'docs')
        ]
      },
      {
        test: /\.md$/,
        loader: 'html!markdown'
      },
      {
        test: /\.jpe?g$|\.gif$|\.png|\.ico$/,
        loader: 'file?name=[path][name].[ext]&context=docs/assets'
      },
    ]
  },

  plugins: basePlugins.concat(envPlugins),

  resolve: {
    alias: {
      'react': path.join(__dirname, 'react-lite.common'),
      'react-dom': path.join(__dirname, 'react-lite.common')
    }
  },

  // watch: !isProduction,
  node: {
    fs: 'empty'
  },

  markdownLoader: {
    renderer: renderer
  }
};
