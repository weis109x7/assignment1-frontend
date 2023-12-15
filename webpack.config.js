import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    entry: "./app/Main.js",
    output: {
        publicPath: "/",
        path: resolve(__dirname, "app"),
        filename: "bundled.js",
    },
    mode: "development",
    devtool: "source-map",
    devServer: {
        port: 3000,
        static: {
            directory: join(__dirname, "app"),
        },
        hot: true,
        liveReload: false,
        historyApiFallback: { index: "index.html" },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-react", ["@babel/preset-env", { targets: { node: "12" } }]],
                    },
                },
            },
        ],
    },
};
