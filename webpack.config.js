const path = require("path");
const WebpackPwaManifest = require("webpack-pwa-manifest");

module.exports = {
  entry: {
    index: "./public/assets/js/index.js",
  },
  output: {
    path: path.resolve(__dirname, "public", "dist"),
    filename: "[name].bundle.js",
  },
  plugins: [
    new WebpackPwaManifest({
      fingerprints: false,
      name: "Budget Tracker",
      short_name: "Budget Tracker",
      description: "An app to track your spending!",
      background_color: "#ffffff",
      icons: [
        {
          src: path.resolve(
            __dirname,
            "public",
            "assets",
            "images",
            "icons",
            "icon-512x512.png"
          ),
          sizes: [96, 128, 192, 256, 384, 512],
        },
      ],
    }),
  ],
};
