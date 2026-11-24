/**
 * 把 demo/ 下的前端资源内嵌到 Worker 源码 src/assets.ts。
 * 这样 Cloudflare 只需部署一个 Worker：访问根路径即可看到完整 Demo，
 * /api/* 仍由 Worker 提供独立 REST 接口。
 *
 * 运行：node scripts/bundle-assets.mjs
 * 源：demo/index.html, demo/css/*.css, demo/js/*.js
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const demo = path.join(root, 'demo');
const entries = [
  ['/', path.join(demo, 'index.html')],
  ['/css/tokens.css', path.join(demo, 'css', 'tokens.css')],
  ['/css/styles.css', path.join(demo, 'css', 'styles.css')],
  ...fs.readdirSync(path.join(demo, 'js'))
      .filter(f => f.endsWith('.js'))
      .sort()
      .map(f => [`/js/${f}`, path.join(demo, 'js', f)]),
];

const contentType = (url) => url === '/' || url.endsWith('.html') ? 'text/html; charset=UTF-8'
  : url.endsWith('.css') ? 'text/css; charset=UTF-8'
  : 'application/javascript; charset=UTF-8';

const lines = [
  '// 由 scripts/bundle-assets.mjs 自动生成，请勿手动编辑。',
  '// 源：demo/ —— 修改前端后重新运行：node scripts/bundle-assets.mjs',
  'export interface Asset { body: string; contentType: string }',
  'export const assets: Record<string, Asset> = {',
];
for (const [url, file] of entries) {
  const body = fs.readFileSync(file, 'utf8')
    .replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  lines.push(`  ${JSON.stringify(url)}: { contentType: ${JSON.stringify(contentType(url))}, body: \`${body}\` },`);
}
lines.push('};', '');
fs.writeFileSync(path.join(root, 'src', 'assets.ts'), lines.join('\n'));
console.log(`已打包 ${entries.length} 个资源到 src/assets.ts`);
