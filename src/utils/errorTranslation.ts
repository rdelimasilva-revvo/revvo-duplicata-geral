const supabaseErrorMap: Record<string, { title: string; message: string; suggestion: string }> = {
  'Invalid login credentials': {
    title: 'Credenciais inválidas',
    message: 'E-mail ou senha incorretos.',
    suggestion: 'Verifique suas credenciais e tente novamente.',
  },
  'Email not confirmed': {
    title: 'E-mail não confirmado',
    message: 'Seu e-mail ainda não foi verificado.',
    suggestion: 'Verifique sua caixa de entrada e clique no link de confirmação.',
  },
  'User already registered': {
    title: 'Usuário já cadastrado',
    message: 'Já existe uma conta com este e-mail.',
    suggestion: 'Tente fazer login ou use outro e-mail.',
  },
  'Password should be at least 6 characters': {
    title: 'Senha muito curta',
    message: 'A senha deve ter pelo menos 6 caracteres.',
    suggestion: 'Escolha uma senha mais longa e segura.',
  },
  'No user data returned': {
    title: 'Erro de autenticação',
    message: 'Não foi possível recuperar os dados do usuário.',
    suggestion: 'Tente novamente em alguns instantes.',
  },
  'An error occurred': {
    title: 'Erro inesperado',
    message: 'Ocorreu um erro ao processar sua solicitação.',
    suggestion: 'Tente novamente. Se o problema persistir, contate o suporte.',
  },
  'Failed to fetch': {
    title: 'Erro de conexão',
    message: 'Não foi possível conectar ao servidor.',
    suggestion: 'Verifique sua conexão com a internet e tente novamente.',
  },
  'JWT expired': {
    title: 'Sessão expirada',
    message: 'Sua sessão expirou por inatividade.',
    suggestion: 'Faça login novamente para continuar.',
  },
  'rate limit': {
    title: 'Muitas tentativas',
    message: 'Você fez muitas tentativas em pouco tempo.',
    suggestion: 'Aguarde alguns minutos antes de tentar novamente.',
  },
};

const postgresCodeMap: Record<string, string> = {
  '23505': 'Registro duplicado: já existe um registro com estes dados.',
  '23502': 'Campos obrigatórios não foram preenchidos.',
  '23503': 'Referência inválida: o registro relacionado não existe.',
  '22P02': 'Formato inválido: verifique se os campos estão preenchidos corretamente.',
  '42501': 'Você não tem permissão para realizar esta ação.',
  'PGRST116': 'Nenhum registro encontrado com os critérios informados.',
  'PGRST301': 'Erro de conexão com o banco de dados.',
};

export function translateSupabaseError(error: string | { message?: string; code?: string }): string {
  if (typeof error === 'string') {
    for (const [key, value] of Object.entries(supabaseErrorMap)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return value.message;
      }
    }
    return error;
  }

  if (error.code && postgresCodeMap[error.code]) {
    return postgresCodeMap[error.code];
  }

  if (error.message) {
    return translateSupabaseError(error.message);
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export function getErrorDetails(error: string | { message?: string; code?: string }) {
  const message = typeof error === 'string' ? error : error.message || '';

  for (const [key, value] of Object.entries(supabaseErrorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return {
    title: 'Erro',
    message: translateSupabaseError(error),
    suggestion: 'Se o problema persistir, contate o suporte.',
  };
}
