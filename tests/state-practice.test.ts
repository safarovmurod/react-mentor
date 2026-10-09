// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';

it('preserves every original Redux/Zustand/Jotai Local and Global example from the uploaded HTML', () => {
  const html=readFileSync(path.join(process.cwd(),'public/practice-local-global.html'),'utf8');
  const match=html.match(/<script id="DATA" type="application\\/json">([\\s\\S]*?)<\\/script>/);
  expect(match).not.toBeNull();
  const data=JSON.parse(match![1]) as {
    operations:{id:string}[];
    local:Record<string,Record<string,{blocks:{path:string;code:string}[]}>>;
    global:Record<string,Record<string,{blocks:{path:string;code:string}[]}>>;
  };
  expect(data.operations).toHaveLength(10);
  for(const mode of ['local','global'] as const) {
    expect(Object.keys(data[mode]).sort()).toEqual(['jotai','redux','zustand']);
    for(const manager of ['redux','zustand','jotai']) {
      expect(Object.keys(data[mode][manager]).sort()).toEqual(data.operations.map(op=>op.id).sort());
      for(const operation of data.operations) {
        const lesson=data[mode][manager][operation.id];
        expect(lesson.blocks.length).toBeGreaterThan(0);
        expect(lesson.blocks.every(block=>block.path.length>0&&block.code.length>0)).toBe(true);
      }
    }
  }
  expect(html).toContain('id="mode-local"');
  expect(html).toContain('id="mode-global"');
  expect(html).toContain('id="practice-check"');
  expect(html).toContain('id="hint-check"');
});
