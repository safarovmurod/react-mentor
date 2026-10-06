'use client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, NotebookPen } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { PageHeading } from '@/components/learning/page-heading';
import { courseName } from '@/content/courses/catalog';
export default function NotesPage() {
 const course=useLearningStore(state=>state.selectedCourse);
 return <NotesWorkspace key={course}/>;
}
function NotesWorkspace() {
 const state=useLearningStore();const course=state.selectedCourse;const notes=course==='react'?state.notes:state.courses[course]?.notes || [];const saveNote=(note:typeof state.notes[number])=>course==='react'?state.saveNote(note):state.saveCourseNote(course,note);const deleteNote=(id:string)=>course==='react'?state.deleteNote(id):state.deleteCourseNote(course,id);const copy=COPY[state.language];const [editing,setEditing]=useState<string|null>(null);const [title,setTitle]=useState('');const [content,setContent]=useState('');const [deleted,setDeleted]=useState<(typeof state.notes)[number]|null>(null);
 function startEdit(note?:typeof state.notes[number]) {setEditing(note?.id||crypto.randomUUID());setTitle(note?.title||'');setContent(note?.content||'');}
 return <><PageHeading title={copy.notes} subtitle={courseName(course)}><button className="button primary" onClick={()=>startEdit()}><Plus size={18}/>{copy.newNote}</button></PageHeading>
 {editing&&<form className="panel note-form" onSubmit={event=>{event.preventDefault();if(!title.trim()||!content.trim())return;saveNote({id:editing,title:title.trim(),content:content.trim()});setEditing(null);}}><label>{copy.title}<input required value={title} onChange={event=>setTitle(event.target.value)}/></label><label>{copy.text}<textarea required rows={7} value={content} onChange={event=>setContent(event.target.value)}/></label><div className="button-row"><button className="button primary" type="submit">{copy.save}</button><button className="button subtle" type="button" onClick={()=>setEditing(null)}>{copy.cancel}</button></div></form>}
 {deleted&&<div className="notice" role="status">{state.language==='ru'?'Заметка удалена.':'Note deleted.'}<button className="text-button" onClick={()=>{saveNote(deleted);setDeleted(null);}}>{state.language==='ru'?'Отменить':'Undo'}</button></div>}
 <div className="notes-grid">{notes.map(note=><article className="panel" key={note.id}><div className="section-heading"><h2>{note.title}</h2><div className="button-row"><button className="icon-button" aria-label={copy.edit} onClick={()=>startEdit(note)}><Pencil size={17}/></button><button className="icon-button" aria-label={copy.delete} onClick={()=>{setDeleted(note);deleteNote(note.id);}}><Trash2 size={17}/></button></div></div><p className="preserve-lines">{note.content}</p></article>)}</div>
 {notes.length===0&&!editing&&<div className="panel empty-state"><NotebookPen size={30}/><p>{copy.newNote}</p></div>}</>;
}
