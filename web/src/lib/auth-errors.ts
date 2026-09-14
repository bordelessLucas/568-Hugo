const messages: Record<string, string> = {
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Este e-mail já tem uma conta.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão. Verifique a internet e tente de novo.',
  'auth/user-disabled': 'Esta conta está desativada.',
  'permission-denied': 'O banco recusou o cadastro. Tente de novo em alguns segundos.',
}

export function toUserMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = error.code
    if (typeof code === 'string' && messages[code]) {
      return messages[code]
    }
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }
  return 'Não foi possível concluir. Tente de novo.'
}
