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
  'permission-denied': 'Sem permissão no momento. Tente de novo em alguns segundos.',
  'firestore/permission-denied': 'Sem permissão no momento. Tente de novo em alguns segundos.',
  'unavailable': 'Sem conexão com o servidor. Tente de novo.',
}

export function toUserMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = error.code
    if (typeof code === 'string') {
      if (messages[code]) return messages[code]
      const short = code.includes('/') ? code.slice(code.indexOf('/') + 1) : code
      if (messages[short]) return messages[short]
    }
  }
  if (error instanceof Error && error.message.trim() !== '') {
    const msg = error.message
    if (/permission|insufficient/i.test(msg)) {
      return 'Sem permissão no momento. Tente de novo em alguns segundos.'
    }
    if (/network|offline|Failed to get/i.test(msg)) {
      return 'Sem conexão. Verifique a internet e tente de novo.'
    }
    return msg
  }
  return 'Não foi possível concluir. Tente de novo.'
}
