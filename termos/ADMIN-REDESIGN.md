# Redesign do painel administrativo — Dicionário Tech

Implementado em 22/10/2026, na branch existente `redesign/dicionario-moderno`, sobre o mesmo projeto Expo. Referência: `C:/Users/Icaro/Downloads/a_wide_clean_ui_ux_mockup_collage_of_an_admin_pan.png`.

## Resultado

O login e as quatro áreas web do painel seguem a composição da referência e o design system do site: Manrope local, esmeralda, marinho, superfícies claras/escura e ícones Ionicons oficiais.

- **Login:** apresentação institucional, benefícios, campos com rótulos, mostrar/ocultar senha, validação, carregamento, erro acessível, bloqueio de tentativas simultâneas e alternância de tema. Continua usando o `login` do `AuthContext` e Firebase Authentication.
- **Visão geral:** contagens reais de termos e sugestões pendentes; atalhos para gestão e revisão; atividade baseada nas datas cadastradas das sugestões e nas ações confirmadas durante a sessão.
- **Sugestões:** filtros de todas/pendentes/aprovadas/rejeitadas, contagens, pesquisa sem distinguir caixa e acentos, ordenação por datas quando disponíveis e por nome, atualização, estados vazios e ações de aprovação/rejeição.
- **Criar termo:** nome e descrição obrigatórios; contador; exemplos opcionais, um por linha; categoria opcional com sugestões dos valores já cadastrados. Campos opcionais vazios são omitidos em novos registros.
- **Gerenciar dicionário:** busca em nomes e descrições, A–Z completo, mais resultados, edição e confirmação de remoção. Erros de edição/remoção aparecem dentro do diálogo; o foco retorna ao controle de origem.
- **Responsividade:** lateral em desktop e navegação horizontal em tablet/celular, com a área ativa trazida para a parte visível. Formulários e listas funcionam em 320 px. Os dois temas mantêm contraste e foco visível; movimento reduzido é respeitado.

Não foram inventados eventos históricos, autores, datas ou contagens. O painel não dispõe de uma coleção de auditoria: ações de publicação/edição/remoção realizadas agora aparecem apenas na atividade desta sessão, conforme o rótulo da interface. Sugestões sem data continuam revisáveis e exibem “Data não informada”. A categoria pode ser digitada; não há uma lista fictícia de categorias pré-cadastradas.

## Integrações preservadas

- Rotas `/login` e `/admin`, autenticação e redirecionamento para login quando não há sessão.
- Coleções Firestore `termos` e `sugestoes`; mesmos status `pendente`, `aprovado` e `rejeitado`.
- Publicação de novos nomes em minúsculas, como no fluxo anterior. A edição preserva a grafia existente quando o nome não é alterado.
- Atualização do `DictionaryProvider` depois de publicar, editar, aprovar ou remover.
- Campos não editados, como `explicacao` e `relacionados`, são preservados por `updateDoc`.
- Componentes nativos mantidos como fallback. O login nativo foi movido para um componente, mantendo o conteúdo anterior; a rota passou a resolver a implementação por plataforma.

A aprovação agora lê o status e publica o termo/marca a sugestão em **uma transação**, evitando publicação parcial e uma segunda aprovação da mesma sugestão. A criação reutiliza o ID em tentativas do mesmo envio incerto. O painel só confirma sucesso após a promessa do repositório resolver; erros preservam o formulário e a operação pode ser repetida.

Nenhuma dependência npm, regra de segurança, configuração Firebase, variável de ambiente ou configuração da Vercel foi alterada. Não foram criados usuários nem gravados dados de teste na produção.

## Arquivos desta etapa

| Área | Arquivos |
| --- | --- |
| Entrada e proteção | `app/login.tsx`, `src/components/AdminDashboard.web.tsx`, `LoginScreen.web.tsx`, `LoginScreen.tsx` |
| Interface | `src/components/AdminWorkspace.web.tsx`, `LoginView.web.tsx`, `admin.css` |
| Ícones compartilhados | `src/components/WebIcon.tsx`, reexportado por `WebUI.tsx`, sem mudança visual no site público |
| Dados e operações | `src/lib/admin.ts`, `src/lib/adminRepository.ts` |
| Testes | `tests/admin.test.cjs`, `tests/fixtures/admin-harness.tsx`, `tests/helpers/browser-bundle.cjs`, `tests/helpers/react-dom-client.d.ts`, `scripts/verify-admin.cjs` |
| Documentação | `ADMIN-REDESIGN.md`, `admin-design-qa.md`, links adicionados a `REDESIGN.md` e `design-qa.md` |

## Validação

- 21 testes unitários aprovados.
- TypeScript, lint e build aprovados; 12 rotas estáticas exportadas.
- 50 verificações administrativas de navegador aprovadas, sem erros JavaScript.
- 51 verificações do site público aprovadas após a extração dos ícones compartilhados, sem regressões registradas.
- Layouts de 1440, 1024, 768, 390 e 320 px; temas claro/escuro; textos e botões amostrados com contraste AA.
- Comparações e capturas abertas e revisadas: ver `admin-design-qa.md` e `.artifacts/admin-design-comparison.png`.

**Escopo dos testes:** a rota real `/admin` foi aberta sem credenciais e confirmou o redirecionamento para `/login`. O login real foi testado em validação vazia, temas e mostrar/ocultar senha. As operações administrativas e os cenários de login com sucesso/falha foram exercitados nos componentes reais com um adaptador local em memória. O harness fica apenas em `tests`, não é uma rota da aplicação e não contorna a autenticação da produção. Nenhuma aprovação, edição, publicação ou remoção foi executada no banco de produção durante os testes. Não houve login de administrador real nesta sessão.

Para repetir, mantenha o preview em execução e rode `node scripts/verify-admin.cjs`. Esse script abre um servidor de teste efêmero na porta 4174, usa Chrome headless na porta 9232 e fecha ambos ao terminar. Resultados: `.artifacts/admin-results.json`. As credenciais do harness são fictícias e nunca são enviadas ao Firebase.

## Abrir e validar o preview

No diretório `termos`, execute `npm run build` e `npm run preview`. Abra http://localhost:4173/admin e use seu acesso habitual. Para desenvolvimento com recarga, use `npm run web`.

Para um Preview da Vercel, revise e faça commit das alterações da branch `redesign/dicionario-moderno`, envie essa branch ao repositório conectado e abra o Preview Deployment. Preserve a configuração atual: aplicação em `termos`, build `npm run build`, saída `dist`. Nenhum commit, push ou deploy foi realizado nesta tarefa.

No preview, entre com uma conta administrativa existente, confira as contagens, filtros e temas. Valide as escritas com uma contribuição legítima ou em um Firebase de desenvolvimento: um Preview pode apontar para o mesmo banco de produção. A versão atual não altera essa configuração.
