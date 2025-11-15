const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = (env, argv) => ({
  mode: argv.mode === "production" ? "production" : "development",
  
  // Use inline-source-map for development (required for Figma's sandbox)
  devtool: argv.mode === "production" ? false : "inline-source-map",
  
  // Two entry points: UI and plugin controller
  entry: {
    ui: "./src/app/index.tsx",
    code: "./src/plugin/controller.ts"
  },
  
  module: {
    rules: [
      // TypeScript loader
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,  // Faster builds
            compilerOptions: {
              noEmit: false
            }
          }
        },
        exclude: /node_modules/
      },
      
      // CSS loader for UI with PostCSS/Tailwind
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },  // Injects CSS into DOM
          { loader: "css-loader" },    // Interprets @import and url()
          { 
            loader: "postcss-loader",  // Processes Tailwind CSS v4
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "postcss.config.js")
              }
            }
          }
        ]
      },
      
      // URL loader for assets (images, fonts, etc.)
      {
        test: /\.(png|jpg|gif|webp|svg)$/,
        use: [{ loader: "url-loader" }]
      }
    ]
  },
  
  // Resolve extensions
  resolve: { 
    extensions: [".tsx", ".ts", ".jsx", ".js"] 
  },
  
  // Output configuration
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  
  // Disable performance warnings
  performance: {
    hints: false
  },
  
  // Plugins
  plugins: [
    // Generate ui.html from template
    new HtmlWebpackPlugin({
      template: "./src/app/index.html",
      filename: "ui.html",
      inlineSource: ".(js)$",  // Inline all JS
      chunks: ["ui"]           // Only include ui.js
    }),
    
    // Inline the JS bundle into the HTML (required for Figma)
    new HtmlWebpackInlineSourcePlugin()
  ]
});
