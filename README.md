# ARRANCHA+

Sistema de arranchamento, conferência de efetivo e emissão de vales do 7º RC Mec.

## Atualização completa

Esta versão reúne em um único envio:

- nova abertura, tela de login e identidade visual;
- acesso por função: Militar, Furriel e Administrador;
- cadastro de novos acessos somente pelo Administrador;
- Militar limitado ao próprio arranchamento e à própria senha;
- Furriel limitado à sua subunidade e aos relatórios correspondentes;
- gravação individual por militar e data, evitando que acessos simultâneos sobrescrevam a lista inteira;
- atualização dos dados ao entrar, voltar para a aba, tocar em **Atualizar dados** e após cada gravação;
- PDF gerado somente depois de buscar a versão mais recente do servidor;
- fechamento do vale diário pelo Administrador;
- regras de prazo validadas no servidor, no horário de Brasília;
- PWA com o novo logo no iPhone e no Android.

## Publicação

1. Extraia este ZIP.
2. No GitHub, abra a branch que alimenta o site publicado.
3. Use **Add file > Upload files**.
4. Envie de uma vez todos os arquivos e pastas extraídos.
5. Confirme o commit e aguarde o novo deployment da Vercel.

Não apague nem recrie o Firebase. A versão preserva os usuários e registros que já estão no banco `arranchamais1` e migra os lançamentos antigos para a estrutura individual automaticamente.

## Desenvolvimento local

```bash
npm install
npm run lint
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

## Observação de segurança

Usuários e senhas reais não são incluídos neste repositório. Eles permanecem no Firebase. Para uma expansão além do uso interno do quartel, recomenda-se uma etapa adicional de autenticação com Firebase Authentication e regras restritivas do banco.
