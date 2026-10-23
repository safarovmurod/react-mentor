import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { COURSE_CATEGORIES } from '@/content/course-categories';
import { courseDisplayName } from '@/lib/catalog-copy';
import { CourseCatalog } from '@/components/courses/course-catalog';

const mocks=vi.hoisted(()=>({push:vi.fn(),chooseCourse:vi.fn(),setState:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>({push:mocks.push})}));
vi.mock('@/stores/learning-store',()=>({useLearningStore:Object.assign((select:(state:unknown)=>unknown)=>select({language:'ru',selectedCourse:'html',courseChosen:true}),{getState:()=>({chooseCourse:mocks.chooseCourse})})}));
vi.mock('@/stores/app-store',()=>({useAppStore:{setState:mocks.setState}}));

beforeEach(()=>{
  vi.clearAllMocks();
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>COURSE_CATALOG.map(course=>({id:course.id,ready:true,lessons:2,files:0}))}));
});

afterEach(()=>vi.unstubAllGlobals());

describe('general course catalog navigation',()=>{
  it('shows all categories and groups real courses without hiding tracks by default',async()=>{
    const {container}=render(<CourseCatalog/>);
    expect(container.querySelectorAll('.category-card')).toHaveLength(COURSE_CATEGORIES.length);
    expect(container.querySelector('[data-course="html"]')).toBeInTheDocument();
    expect(container.querySelector('[data-course="python"]')).toBeInTheDocument();
    expect(container.querySelector('[data-course="ux-design"]')).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Фронтенд'})).toBeVisible();
    expect(screen.getByRole('heading',{name:'Дизайн'})).toBeVisible();
    await waitFor(()=>expect(screen.queryByText('Проверяем материалы…')).not.toBeInTheDocument());
  });

  it('filters a category and opens its actual course while preserving the course selection contract',async()=>{
    const {container}=render(<CourseCatalog/>);
    fireEvent.click(screen.getByRole('button',{name:/^Дизайн/}));
    expect(container.querySelector('[data-course="html"]')).not.toBeInTheDocument();
    const designCard=container.querySelector('[data-course="ux-design"]') as HTMLElement;
    expect(designCard).toBeInTheDocument();
    fireEvent.click(within(designCard).getByRole('button',{name:'Выбрать '+courseDisplayName('ux-design','ru')}));
    expect(mocks.chooseCourse).toHaveBeenCalledWith('ux-design');
    expect(mocks.push).toHaveBeenCalledWith('/courses/ux-design/plan');
    expect(mocks.setState).toHaveBeenCalledWith({sidebarOpen:false,tutorDrawerOpen:false,tutorQuestion:null});
    await waitFor(()=>expect(screen.queryByText('Проверяем материалы…')).not.toBeInTheDocument());
  });

  it('searches across categories and resets stale specialization filters',async()=>{
    const {container}=render(<CourseCatalog/>);
    fireEvent.click(screen.getByRole('button',{name:'Базы данных'}));
    expect(container.querySelector('[data-course="sql"]')).toBeInTheDocument();
    expect(container.querySelector('[data-course="python"]')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox',{name:'Найти курс'}),{target:{value:'UX/UI'}});
    expect(container.querySelector('[data-course="ux-design"]')).toBeInTheDocument();
    expect(container.querySelector('[data-course="sql"]')).not.toBeInTheDocument();
    await waitFor(()=>expect(screen.queryByText('Проверяем материалы…')).not.toBeInTheDocument());
  });
  it('keeps navigation usable when the materials endpoint returns an invalid payload',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({error:'Unavailable'})}));
    const {container}=render(<CourseCatalog/>);
    await waitFor(()=>expect(screen.getAllByText('Статус материалов недоступен').length).toBeGreaterThan(0));
    expect(container.querySelector('[data-course="html"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/^Дизайн/}));
    expect(container.querySelector('[data-course="ux-design"]')).toBeInTheDocument();
  });

});
