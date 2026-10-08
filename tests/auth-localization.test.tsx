import type { SupabaseClient } from '@supabase/supabase-js';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AuthScreen, FirstProfileScreen, MfaChallengeScreen, PasswordRecoveryScreen } from '@/components/account/auth-screen';
import { AccountSettings } from '@/components/account/account-settings';
import { AccountShell } from '@/components/account/account-shell';
import type { useAccount } from '@/components/account/account-provider';
import { useLearningStore } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';
import type { InterfaceLocale } from '@/lib/locale';

const mocked = vi.hoisted(() => ({ account:null as ReturnType<typeof useAccount>|null, client:null as SupabaseClient|null }));
vi.mock('@/components/account/account-provider', () => ({ useAccount:() => mocked.account }));
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient:() => mocked.client }));
vi.mock('qrcode', () => ({ toDataURL:vi.fn().mockResolvedValue('data:image/png;base64,phone-qr') }));
vi.mock('next/navigation', () => ({ usePathname:() => '/settings' }));
vi.mock('next/dynamic', () => ({ default:() => () => null }));
vi.mock('@/components/layout/header', () => ({ Header:() => null }));
vi.mock('@/components/layout/sidebar', () => ({ Sidebar:() => null }));
vi.mock('@/components/providers/activity-tracker', () => ({ ActivityTracker:() => null }));
vi.mock('@/components/courses/course-boundary', () => ({ CourseBoundary:() => null }));

const initialStore = useLearningStore.getState();
const locales:InterfaceLocale[] = ['ru','en','tg','uk'];
const labels = {
  ru:{challenge:'Подтвердите вход', code:'Код authenticator', verify:'Подтвердить', challengeError:'Не удалось подтвердить код. Возьмите новый код из приложения.', password:'Новый пароль', repeat:'Повторите пароль', savePassword:'Сохранить пароль', mismatch:'Пароли не совпадают.', recoveryError:'Не удалось сменить пароль. Повторите запрос восстановления.', profile:'Личный профиль', name:'Ваше имя', saveName:'Сохранить имя', profileError:'Не удалось сохранить профиль. Попробуйте ещё раз.', profileSaved:'Профиль сохранён.', security:'Защита аккаунта', sync:'Синхронизировать', enroll:'Подключить authenticator · QR', enable:'Подключить защиту', appCode:'Код из приложения', enrollAlt:'QR для приложения authenticator', phoneAlt:'QR: открыть вход на телефоне', quota:'Лимит отправки писем временно исчерпан. Попробуйте позже.', restoring:'Восстанавливаем ваш вход', retry:'Повторить', expired:'Сессия истекла. Войдите ещё раз.', firstName:'Как вас называть?', start:'Начать обучение'},
  en:{challenge:'Verify your sign-in', code:'Authenticator code', verify:'Verify', challengeError:'Could not verify the code. Get a new code from the app.', password:'New password', repeat:'Repeat password', savePassword:'Save password', mismatch:'Passwords do not match.', recoveryError:'Could not change the password. Request password recovery again.', profile:'Personal profile', name:'Your name', saveName:'Save name', profileError:'Could not save your profile. Please try again.', profileSaved:'Profile saved.', security:'Account security', sync:'Sync now', enroll:'Connect authenticator · QR', enable:'Enable protection', appCode:'Code from the app', enrollAlt:'QR for the authenticator app', phoneAlt:'QR: open sign-in on your phone', quota:'The email sending limit is temporarily reached. Try again later.', restoring:'Restoring your sign-in', retry:'Retry', expired:'Your session has expired. Sign in again.', firstName:'What should we call you?', start:'Start learning'},
  tg:{challenge:'Воридшавиро тасдиқ кунед', code:'Коди authenticator', verify:'Тасдиқ кардан', challengeError:'Код тасдиқ нашуд. Аз барнома коди нав гиред.', password:'Рамзи нав', repeat:'Рамзро такрор кунед', savePassword:'Нигоҳ доштани рамз', mismatch:'Рамзҳо мувофиқ нестанд.', recoveryError:'Рамз иваз нашуд. Барқароркуниро бори дигар дархост кунед.', profile:'Профили шахсӣ', name:'Номи шумо', saveName:'Нигоҳ доштани ном', profileError:'Профил нигоҳ дошта нашуд. Бори дигар кӯшиш кунед.', profileSaved:'Профил нигоҳ дошта шуд.', security:'Ҳифзи аккаунт', sync:'Ҳамоҳанг кардан', enroll:'Пайваст кардани authenticator · QR', enable:'Фаъол кардани ҳифз', appCode:'Код аз барнома', enrollAlt:'QR барои барномаи authenticator', phoneAlt:'QR: кушодани воридшавӣ дар телефон', quota:'Маҳдудияти фиристодани номаҳо муваққатан расид. Дертар кӯшиш кунед.', restoring:'Воридшавии шумо барқарор мешавад', retry:'Такрор кардан', expired:'Сессия ба охир расид. Бори дигар ворид шавед.', firstName:'Шуморо чӣ ном гӯем?', start:'Оғози омӯзиш'},
  uk:{challenge:'Підтвердьте вхід', code:'Код authenticator', verify:'Підтвердити', challengeError:'Не вдалося підтвердити код. Візьміть новий код із застосунку.', password:'Новий пароль', repeat:'Повторіть пароль', savePassword:'Зберегти пароль', mismatch:'Паролі не збігаються.', recoveryError:'Не вдалося змінити пароль. Повторіть запит відновлення.', profile:'Особистий профіль', name:'Ваше ім’я', saveName:'Зберегти ім’я', profileError:'Не вдалося зберегти профіль. Спробуйте ще раз.', profileSaved:'Профіль збережено.', security:'Захист акаунта', sync:'Синхронізувати', enroll:'Підключити authenticator · QR', enable:'Підключити захист', appCode:'Код із застосунку', enrollAlt:'QR для застосунку authenticator', phoneAlt:'QR: відкрити вхід на телефоні', quota:'Ліміт надсилання листів тимчасово вичерпано. Спробуйте пізніше.', restoring:'Відновлюємо ваш вхід', retry:'Повторити', expired:'Сесія завершилася. Увійдіть ще раз.', firstName:'Як до вас звертатися?', start:'Почати навчання'},
};

function changeLanguage(language:InterfaceLocale) {
  act(() => useLearningStore.getState().setPreferences({language}));
  expect(useLearningStore.getState().contentLanguage).toBe('tg');
}
function backend() {
  const listFactors = vi.fn().mockResolvedValue({data:{totp:[],all:[]},error:null});
  const verify = vi.fn().mockResolvedValue({error:null});
  const updateUser = vi.fn().mockResolvedValue({error:null});
  const signup = vi.fn().mockResolvedValue({data:{session:null},error:null});
  const enroll = vi.fn().mockResolvedValue({data:{id:'factor-new',totp:{qr_code:'<svg/>',secret:'enrollment-only-secret'}},error:null});
  const unenroll = vi.fn().mockResolvedValue({error:null});
  mocked.client = {auth:{mfa:{listFactors,challengeAndVerify:verify,enroll,unenroll},updateUser,signUp:signup}} as unknown as SupabaseClient;
  return {listFactors,verify,updateUser,signup,enroll,unenroll};
}
beforeEach(() => {
  localStorage.clear();
  useLearningStore.setState({...initialStore,language:'ru',contentLanguage:'tg'});
  useAppStore.setState({tutorDrawerOpen:false});
  mocked.account = {configured:true,loading:false,user:{id:'account-a',email:'a@example.com',user_metadata:{full_name:'Мансур'},app_metadata:{},aud:'authenticated',created_at:'2026-01-01T00:00:00Z'},profile:{displayName:'Мансур',avatarPath:null,avatarUrl:null},guest:false,restoreFailed:false,error:'',needsMfa:false,syncStatus:'synced',recovery:false,reload:vi.fn().mockResolvedValue(undefined),saveProfile:vi.fn().mockResolvedValue(undefined),signOut:vi.fn().mockResolvedValue(undefined),continueAsGuest:vi.fn(),syncNow:vi.fn().mockResolvedValue(undefined)};
  backend();
});
afterEach(() => {
  cleanup();
  useLearningStore.setState(initialStore);
  localStorage.clear();
  mocked.account=null;mocked.client=null;
  vi.clearAllMocks();
});

it('translates a failed MFA challenge when language changes and verifies the same entered code on retry', async () => {
  const b=backend();b.listFactors.mockResolvedValue({data:{totp:[{id:'factor-1'}]},error:null});
  b.verify.mockResolvedValueOnce({error:new Error('raw backend details')});
  render(<MfaChallengeScreen/>);
  fireEvent.change(screen.getByLabelText('Код authenticator'),{target:{value:'123456'}});
  fireEvent.click(screen.getByRole('button',{name:'Подтвердить'}));
  await screen.findByRole('alert');
  for (const locale of locales) {
    changeLanguage(locale);const text=labels[locale];
    expect(screen.getByRole('heading',{name:text.challenge})).toBeVisible();
    expect(screen.getByLabelText(text.code)).toHaveValue('123456');
    expect(screen.getByRole('button',{name:text.verify})).toBeEnabled();
    expect(screen.getByRole('alert')).toHaveTextContent(text.challengeError);
  }
  fireEvent.click(screen.getByRole('button',{name:labels.uk.verify}));
  await waitFor(() => expect(mocked.account!.reload).toHaveBeenCalledOnce());
  expect(b.verify).toHaveBeenNthCalledWith(2,{factorId:'factor-1',code:'123456'});
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('translates recovery validation without losing passwords, then changes the password before signing out', async () => {
  const b=backend();render(<PasswordRecoveryScreen/>);
  fireEvent.change(screen.getByLabelText('Новый пароль'),{target:{value:'new-password-123'}});
  fireEvent.change(screen.getByLabelText('Повторите пароль'),{target:{value:'other-password'}});
  fireEvent.click(screen.getByRole('button',{name:'Сохранить пароль'}));
  expect(b.updateUser).not.toHaveBeenCalled();
  for (const locale of locales) {
    changeLanguage(locale);const text=labels[locale];
    expect(screen.getByRole('heading',{name:text.password})).toBeVisible();
    expect(screen.getByLabelText(text.password)).toHaveValue('new-password-123');
    expect(screen.getByRole('alert')).toHaveTextContent(text.mismatch);
  }
  fireEvent.change(screen.getByLabelText(labels.uk.repeat),{target:{value:'new-password-123'}});
  b.updateUser.mockResolvedValueOnce({error:new Error('provider error')});
  fireEvent.click(screen.getByRole('button',{name:labels.uk.savePassword}));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(labels.uk.recoveryError));
  expect(mocked.account!.signOut).not.toHaveBeenCalled();
  changeLanguage('en');expect(screen.getByRole('alert')).toHaveTextContent(labels.en.recoveryError);
  fireEvent.click(screen.getByRole('button',{name:labels.en.savePassword}));
  await waitFor(() => expect(mocked.account!.signOut).toHaveBeenCalledOnce());
  expect(b.updateUser).toHaveBeenLastCalledWith({password:'new-password-123'});
});

it('updates profile, device and security labels along with an existing save failure and success', async () => {
  vi.mocked(mocked.account!.saveProfile).mockRejectedValueOnce(new Error('Не удалось сохранить профиль. Попробуйте ещё раз.'));
  render(<AccountSettings/>);
  await screen.findByRole('button',{name:labels.ru.enroll});
  fireEvent.change(screen.getByLabelText(labels.ru.name),{target:{value:'Одина'}});
  fireEvent.click(screen.getByRole('button',{name:labels.ru.saveName}));
  await screen.findByRole('alert');
  for (const locale of locales) {
    changeLanguage(locale);const text=labels[locale];
    expect(screen.getByRole('heading',{name:text.profile})).toBeVisible();
    expect(screen.getByRole('heading',{name:text.security})).toBeVisible();
    expect(screen.getByLabelText(text.name)).toHaveValue('Одина');
    expect(screen.getByRole('button',{name:text.saveName})).toBeEnabled();
    expect(screen.getByRole('button',{name:text.sync})).toBeEnabled();
    expect(screen.getByAltText(text.phoneAlt)).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent(text.profileError);
  }
  fireEvent.click(screen.getByRole('button',{name:labels.uk.saveName}));
  await screen.findByText(labels.uk.profileSaved);
  for (const locale of locales) {changeLanguage(locale);expect(screen.getByText(labels[locale].profileSaved)).toBeVisible();}
  expect(mocked.account!.saveProfile).toHaveBeenNthCalledWith(2,'Одина');
});

it('keeps MFA enrollment in memory while its QR, form and cancellation labels follow the selected language', async () => {
  const b=backend();render(<AccountSettings/>);
  fireEvent.click(await screen.findByRole('button',{name:labels.ru.enroll}));
  await screen.findByAltText(labels.ru.enrollAlt);
  fireEvent.change(screen.getByLabelText(labels.ru.appCode),{target:{value:'654321'}});
  for (const locale of locales) {
    changeLanguage(locale);const text=labels[locale];
    expect(screen.getByAltText(text.enrollAlt)).toBeVisible();
    expect(screen.getByLabelText(text.appCode)).toHaveValue('654321');
    expect(screen.getByRole('button',{name:text.enable})).toBeEnabled();
  }
  expect(JSON.stringify(localStorage)).not.toContain('enrollment-only-secret');
  fireEvent.click(screen.getByRole('button',{name:'Скасувати'}));
  await waitFor(() => expect(screen.queryByAltText(labels.uk.enrollAlt)).not.toBeInTheDocument());
  expect(b.unenroll).toHaveBeenCalledWith({factorId:'factor-new'});
  expect(b.verify).not.toHaveBeenCalled();
});

it('translates an auth provider quota error after submission without exposing its raw details', async () => {
  const b=backend();b.signup.mockResolvedValue({data:{session:null},error:{code:'over_email_send_rate_limit',message:'private backend trace'}});
  mocked.account!.user=null;render(<AuthScreen/>);
  fireEvent.click(screen.getByRole('button',{name:'Создать аккаунт'}));
  fireEvent.change(screen.getByLabelText('Ваше имя'),{target:{value:'Одина'}});
  fireEvent.change(screen.getByLabelText('Email'),{target:{value:'a@example.com'}});
  fireEvent.change(screen.getByLabelText('Пароль'),{target:{value:'password-123'}});
  fireEvent.click(screen.getAllByRole('button',{name:'Создать аккаунт'})[0]);
  await screen.findByRole('alert');
  for (const locale of locales) {changeLanguage(locale);expect(screen.getByRole('alert')).toHaveTextContent(labels[locale].quota);}
  expect(document.body.textContent).not.toContain('private backend trace');
  expect(b.signup).toHaveBeenCalledOnce();
});

it('translates first-profile errors and preserves the entered name across all interface languages', async () => {
  mocked.account!.profile=null;
  vi.mocked(mocked.account!.saveProfile).mockRejectedValueOnce(new Error('Не удалось сохранить профиль. Попробуйте ещё раз.'));
  render(<FirstProfileScreen/>);
  fireEvent.change(screen.getByLabelText('Ваше имя'),{target:{value:'Одина'}});
  fireEvent.click(screen.getByRole('button',{name:'Начать обучение'}));
  await screen.findByRole('alert');
  for (const locale of locales) {
    changeLanguage(locale);const text=labels[locale];
    expect(screen.getByRole('heading',{name:text.firstName})).toBeVisible();
    expect(screen.getByLabelText(text.name)).toHaveValue('Одина');
    expect(screen.getByRole('button',{name:text.start})).toBeEnabled();
    expect(screen.getByRole('alert')).toHaveTextContent(text.profileError);
  }
});

it('translates session restoration errors and keeps retry wired to account restoration', () => {
  mocked.account!.restoreFailed=true;mocked.account!.error='Сессия истекла. Войдите ещё раз.';
  render(<AccountShell>Private content</AccountShell>);
  for (const locale of locales) {
    changeLanguage(locale);const text=labels[locale];
    expect(screen.getByRole('heading',{name:text.restoring})).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent(text.expired);
    expect(screen.getByRole('button',{name:text.retry})).toBeEnabled();
  }
  expect(screen.queryByText('Private content')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:labels.uk.retry}));
  expect(mocked.account!.reload).toHaveBeenCalledOnce();
});
