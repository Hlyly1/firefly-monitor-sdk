import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const basePlugins = [
  resolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: './dist',
    exclude: ['tests/**', 'examples/**', '**/*.test.ts', '**/*.spec.ts']
  })
];

const productionPlugins = isProduction ? [terser({
  compress: {
    drop_console: false,
    drop_debugger: true,
    pure_funcs: ['console.log']
  },
  format: {
    comments: false
  }
})] : [];

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: !isProduction,
      exports: 'auto'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: !isProduction
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'FireflyMonitor',
      sourcemap: !isProduction,
      globals: {
        'web-vitals': 'webVitals'
      }
    }
  ],
  external: ['web-vitals'],
  plugins: [...basePlugins, ...productionPlugins],
  watch: {
    include: 'src/**',
    clearScreen: true
  }
};
