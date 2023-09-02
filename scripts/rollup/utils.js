import path from 'path';
import fs from 'fs';

// cjs() 用于将ES模块转换为CJS格式
// ts() 是处理typescript的rollup插件
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';

// 为开发环境增加__DEV__标识
import replace from '@rollup/plugin-replace';

// 包的路径
const pkgPath = path.resolve(__dirname, '../../packages');
// 产物路径
const distPath = path.resolve(__dirname, '../../dist/node_modules');

// 传入包名，得到package.json
export function getPackageJSON(pkgName) {
	// ...包路径
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, { encoding: 'utf-8' });
	return JSON.parse(str);
}

// 包的路径 / 产物路径
export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pkgPath}/${pkgName}`;
}

// 解构赋值的对象参数，意味着可以传递一个包含 typescript 属性的对象，也可以不传递任何参数
export function getBaseRollupPlugins({
	alias = { __DEV__: true },
	typescript = {}
} = {}) {
	return [replace(alias), cjs(), ts(typescript)];
}
