// 默认配置
const { defaults } = require('jest-config');

module.exports = {
	...defaults,
	// process.cwd => test命令执行的根目录
	rootDir: process.cwd(),
	moduleDirectories: [
		// 对于 React ReactDOM
		'dist/node_modules',
		// 对于第三方依赖
		...defaults.moduleDirectories
	],
	testEnvironment: 'jsdom'
};
