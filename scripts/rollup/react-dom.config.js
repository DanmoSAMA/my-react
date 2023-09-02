import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from './utils';
// 在输出产物中生成package.json
import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';

// 从package.json读出包名
const { name, module } = getPackageJSON('react-dom');
// 包的路径
const pkgPath = resolvePkgPath(name);
// 产物路径
const pkgDistPath = resolvePkgPath(name, true);

export default [
	// react
	{
		input: `${pkgPath}/${module}`,
		output: [
			{
				file: `${pkgDistPath}/index.js`,
				name: 'index.js',
				format: 'umd' // 兼容cjs和esm
			},
			// 兼容react 18
			{
				file: `${pkgDistPath}/client.js`,
				name: 'client.js',
				format: 'umd'
			}
		],
		plugins: [
			...getBaseRollupPlugins(),
			alias({
				entries: {
					// 避免 import ... from 'hostConfig' 在打包的时候报错
					hostConfig: `${pkgPath}/src/hostConfig.ts`
				}
			}),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				// 选择package.json包含的字段
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					peerDependencies: {
						react: version
					},
					main: 'index.js'
				})
			})
		]
	}
];
