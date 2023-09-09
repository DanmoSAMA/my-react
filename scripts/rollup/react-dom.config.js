import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from './utils';
// 在输出产物中生成package.json
import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';

// 从package.json读出包名
const { name, module, peerDependencies } = getPackageJSON('react-dom');
// 包的路径
const pkgPath = resolvePkgPath(name);
// 产物路径
const pkgDistPath = resolvePkgPath(name, true);

export default [
	// react-dom
	{
		input: `${pkgPath}/${module}`,
		output: [
			{
				file: `${pkgDistPath}/index.js`,
				name: 'ReactDOM',
				format: 'umd' // 兼容cjs和esm
			},
			// 兼容react 18
			{
				file: `${pkgDistPath}/client.js`,
				name: 'client',
				format: 'umd'
			}
		],
		// Reconciler + hostConfig => ReactDOM
		// 增加数据共享层后，Reconciler与React产生关联，进一步则ReactDOM和React产生关联
		// 如果打包在一起，会产生两个数据共享层，所以打包要分开
		external: [...Object.keys(peerDependencies)],
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
	},
	// react-test-utils
	{
		input: `${pkgPath}/test-utils.ts`,
		output: [
			{
				file: `${pkgDistPath}/test-utils.js`,
				name: 'testUtils',
				format: 'umd' // 兼容cjs和esm
			}
		],
		// 外部依赖
		external: ['react-dom', 'react'],
		plugins: [...getBaseRollupPlugins()]
	}
];
