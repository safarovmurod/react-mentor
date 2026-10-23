import {expect,test} from '@playwright/test';

test('TypeScript editor shows real syntax diagnostics and inserts a completion',async({page})=>{
  test.setTimeout(60000);
  const externalScripts:string[]=[];
  page.on('request',request=>{
    if(request.resourceType()==='script'&&/^https?:/.test(request.url())&&new URL(request.url()).hostname!=='127.0.0.1')externalScripts.push(request.url());
  });
  await page.goto('/practice?course=react&month=1');
  await page.getByRole('tab',{name:'Функции: тесты',exact:true}).click();
  await expect(page.locator('.monaco-editor')).toBeVisible({timeout:30000});
  const setCode=(source:string)=>page.evaluate(code=>{
    const monaco=(window as unknown as {monaco:{editor:{getModels:()=>{uri:{path:string};setValue:(value:string)=>void}[]}}}).monaco;
    monaco.editor.getModels().find(model=>model.uri.path.includes('function-delete'))!.setValue(code);
  },source);
  await setCode('const broken = ;');
  await expect.poll(()=>page.evaluate(()=>{
    const monaco=(window as unknown as {monaco:{editor:{getModelMarkers:(filter:{})=>{severity:number;startLineNumber:number}[]}}}).monaco;
    return monaco.editor.getModelMarkers({}).some(marker=>marker.severity===8&&marker.startLineNumber===1);
  }),{timeout:15000}).toBe(true);

  await setCode('const item = { id: 1, title: "Learn HTML" };\nitem.');
  await page.locator('.monaco-editor').scrollIntoViewIfNeeded();
  await page.evaluate(()=>{
    const monaco=(window as unknown as {monaco:{editor:{getEditors:()=>{setPosition:(position:{lineNumber:number;column:number})=>void;focus:()=>void;trigger:(source:string,action:string,payload:{})=>void}[]}}}).monaco;
    const editor=monaco.editor.getEditors()[0];
    editor.setPosition({lineNumber:2,column:6});editor.focus();editor.trigger('keyboard','editor.action.triggerSuggest',{});
  });
  const suggestion=page.locator('.suggest-widget .monaco-list-row').filter({hasText:/^title/});
  await expect(suggestion).toBeVisible({timeout:15000});
  await suggestion.click();
  await expect.poll(()=>page.evaluate(()=>{
    const monaco=(window as unknown as {monaco:{editor:{getModels:()=>{uri:{path:string};getValue:()=>string}[]}}}).monaco;
    return monaco.editor.getModels().find(model=>model.uri.path.includes('function-delete'))!.getValue();
  })).toContain('item.title');
  await setCode('const tasks = [{ id: 1 }, { id: 2 }];\nconst remaining = tasks.filter(entry => entry.id !== 1);\nconsole.log(remaining);');
  await expect.poll(()=>page.evaluate(()=>{
    const monaco=(window as unknown as {monaco:{editor:{getModelMarkers:(filter:{})=>{severity:number}[]}}}).monaco;
    return monaco.editor.getModelMarkers({}).filter(marker=>marker.severity===8).length;
  }),{timeout:15000}).toBe(0);
  expect(externalScripts).toEqual([]);
});
