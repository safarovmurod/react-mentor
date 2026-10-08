// Shared navigation needs metadata, not the full lesson/question library.
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,filename);
const {LEARNING_TOPICS,QUIZ_QUESTIONS}=require('../src/content/course.ts');
fs.writeFileSync(require('node:path').join(__dirname,'../src/content/learning-index.json'),JSON.stringify({topics:LEARNING_TOPICS.map(({id,month})=>({id,month})),questions:QUIZ_QUESTIONS.map(({id,month,options})=>({id,month,options:options.length?[true]:[]}))})+'\n');
