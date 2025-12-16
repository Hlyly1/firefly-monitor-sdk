import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: !isProduction,
      exports: 'auto',
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: !isProduction,
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'FireflyMonitor',
      sourcemap: !isProduction,
      globals: {
        'web-vitals': 'webVitals',
        '@firefly-monitor/core': 'FireflyMonitorCore',
        '@firefly-monitor/shared': 'FireflyMonitorShared',
      },
    },
  ],
  external: ['web-vitals', '@firefly-monitor/core', '@firefly-monitor/shared'],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
    }),
    isProduction && terser(),
  ],
};
