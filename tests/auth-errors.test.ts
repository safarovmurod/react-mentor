import { expect, it } from 'vitest';
import { authErrorMessage } from '@/lib/account/auth-errors';

it('explains email confirmation, disabled registration and temporary email limits', () => {
  expect(authErrorMessage({ code: 'email_not_confirmed' }, 'login')).toContain('Подтвердите email');
  expect(authErrorMessage({ code: 'signup_disabled' }, 'signup')).toContain('Регистрация сейчас закрыта');
  expect(authErrorMessage({ code: 'over_email_send_rate_limit', status: 429 }, 'signup')).toContain('Лимит отправки писем');
  expect(authErrorMessage({ status: 429 }, 'reset')).toContain('Слишком много попыток');
});
it('does not show raw provider payloads or expose whether an account exists', () => {
  const error = { code: 'unknown', message: 'token=secret email=user@example.com' };
  expect(authErrorMessage(error, 'signup')).not.toMatch(/secret|user@example.com/);
  expect(authErrorMessage(null, 'login')).toContain('Не удалось войти');
  expect(authErrorMessage({ code: 'user_already_exists' }, 'signup')).toBe(authErrorMessage(error, 'signup'));
  expect(authErrorMessage({ code: 'constructor' }, 'signup')).toBe(authErrorMessage(error, 'signup'));
});
