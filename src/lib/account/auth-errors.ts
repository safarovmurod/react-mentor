/** Return actionable text from known provider codes; never expose raw API errors. */
export function authErrorMessage(error: unknown, mode: 'login' | 'signup' | 'reset') {
  const details = error && typeof error === 'object' ? error as { code?: unknown; status?: unknown } : {};
  const messages: Record<string, string> = {
    email_not_confirmed: 'Подтвердите email по ссылке в письме, затем войдите.',
    invalid_credentials: 'Не удалось войти. Проверьте email и пароль.',
    signup_disabled: 'Регистрация сейчас закрыта. Попробуйте позже или войдите в существующий аккаунт.',
    weak_password: 'Пароль слишком простой. Используйте минимум 8 символов, буквы и цифры.',
    email_address_invalid: 'Проверьте адрес email: он не принят почтовым сервисом.',
    over_email_send_rate_limit: 'Лимит отправки писем временно исчерпан. Попробуйте позже.',
    over_request_rate_limit: 'Слишком много попыток. Подождите и попробуйте снова.',
  };
  if (typeof details.code === 'string' && Object.hasOwn(messages, details.code)) return messages[details.code];
  if (details.status === 429) return messages.over_request_rate_limit;
  return mode === 'login' ? 'Не удалось войти. Проверьте email, пароль и подтверждение адреса.' : 'Не удалось отправить запрос. Проверьте данные и повторите позже.';
}
