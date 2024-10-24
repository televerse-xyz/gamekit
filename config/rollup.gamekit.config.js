import resolve       from '@rollup/plugin-node-resolve';
import commonjs      from '@rollup/plugin-commonjs';
import json          from '@rollup/plugin-json';
import typescript    from 'rollup-plugin-typescript2';
import path          from 'path';
import sucrase       from '@rollup/plugin-sucrase';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import babel         from '@rollup/plugin-babel';
import terser        from '@rollup/plugin-terser';

export default {
    input   : path.resolve( __dirname, '../src/index.ts' ),
    output  : [{
        file                 : path.resolve( __dirname, '../dist/gamekit.cjs' ),
        inlineDynamicImports : true,
        format               : 'cjs',
    }, {
        file                 : path.resolve( __dirname, '../dist/gamekit.mjs' ),
        inlineDynamicImports : true,
        format               : 'esm',
    }],
    plugins : [
        resolve( {
            browser        : true,
            preferBuiltins : false,
        } ),
        commonjs(),
        nodePolyfills(),
        typescript( {
            tsconfig : path.resolve( __dirname, '../tsconfig.json' ),
            check    : true,
        } ),
        json(),
        babel( {
            presets : [
                ['@babel/preset-env', {
                    targets            : '> 0.25%, not dead',
                    useBuiltIns        : "usage",
                    corejs             : "3",
                    forceAllTransforms : true,
                    modules            : false
                }]
            ],
            plugins : [
                path.resolve( __dirname, 'plugins/babel-plugin-bigint-to-number' ),
                '@babel/plugin-proposal-nullish-coalescing-operator',
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-transform-async-to-generator',
            ]
        } ),
        terser( {
            format : {
                comments : false,
            },
        } ),
        sucrase( {
            exclude    : ['node_modules/**'],
            transforms : ['typescript', 'jsx'],
        } ),
    ],
};
