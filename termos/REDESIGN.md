# Redesign — Dicionário Tech

Implementação de 22/10/2026 na branch `redesign/dicionario-moderno`, sobre a aplicação existente. Nenhum commit, push ou deploy foi realizado.

A etapa de login e painel administrativo está documentada em [ADMIN-REDESIGN.md](ADMIN-REDESIGN.md), com os arquivos, fluxos, testes e instruções de preview. A revisão visual correspondente está em [admin-design-qa.md](admin-design-qa.md).

## Análise do repositório

| Área | Implementação preservada |
| --- | --- |
| Stack | Expo SDK 54, React 19, React Native 0.81, React Native Web, TypeScript e Expo Router. Estilos web em `src/components/experience.css`; componentes nativos separados pelo resolvedor `.web.tsx`. |
| Rotas | `/` (catálogo e pesquisa), `/termo?id=ID`, `/sugestao`, `/login`, `/admin`. A antiga `/modal` redireciona para o catálogo. As rotas auxiliares legadas continuam exportadas. |
| Dados | `DictionaryProvider` lê a coleção Firestore `termos`, valida os documentos e compartilha uma única carga entre telas. Nenhuma definição de demonstração foi adicionada. |
| Pesquisa | Ranking local por nome exato, prefixo, trecho do nome e descrição; normalização de caixa/acentos; sem chamada ao banco por tecla. |
| Áudio | Síntese de voz do navegador na web e `expo-speech` no nativo. Início no clique, seleção pt-BR quando disponível, cancelamento exclusivo, proteção contra callbacks antigos e mensagens de falha. |
| Sugestões | `useSuggestion` e `createSuggestionSender` gravam em `sugestoes`, com `termo`, `descricao`, `status: pendente` e `data`. Sucesso somente após `setDoc`; tentativas concorrentes compartilham a operação. Revisão no painel administrativo existente. |
| Temas | `ThemeProvider`, cores semânticas e preferência persistida em `dicionario-theme`, com funcionamento mesmo quando o armazenamento não está disponível. |
| Build | `npm run build` executa `expo export -p web`, com 12 rotas estáticas em `dist`. Não há `vercel.json` no repositório; as configurações do painel da Vercel não foram acessadas. |

## Melhorias desta etapa

- Hero com a mensagem original, pesquisa dominante, chips navegáveis e ilustração própria inspirada na imagem anexada. O conceito real em destaque permanece acessível pelo link abaixo da arte.
- Manrope variável hospedada no próprio projeto, com licença OFL incluída. Hierarquia, peso de títulos, links e botões ajustados de forma consistente.
- Cabeçalho permanece visível durante a exploração. O catálogo recebe compensação para que a navegação fixa não cubra o título.
- Catálogo com quatro colunas em desktop, três em larguras intermediárias, duas em telas médias e uma em celulares menores. Cartões compactos, resumos legíveis, áudio e link para a leitura completa.
- A–Z em faixa de rolagem, com controles anterior/próximo, limites desabilitados e suporte a gesto e teclado. Todos, ordenação A–Z/Z–A e carregamento progressivo mantidos.
- Busca global mais compacta, próxima à referência. Setas/Enter/Escape, destaque, limpeza, clique externo e Ctrl+K/Cmd+K preservados. Fechar o diálogo devolve o foco ao botão de pesquisa.
- Ícones web renderizados em elementos inline com a fonte oficial Ionicons, corrigindo HTML inválido e um erro de hidratação ao abrir diretamente o formulário.
- Página de termo e formulário seguem os mesmos tokens, tipografia e superfícies. Exemplos e relacionados aparecem somente se cadastrados. O rodapé acompanha o fim da página, inclusive em conteúdos curtos.
- Transições de 180–260 ms, entrada de tela, feedback de áudio e redução de movimento mantidos. Alvos móveis, nomes acessíveis e foco visível revisados.

Não foram adicionadas dependências npm nem alterados Firebase, autenticação, regras, variáveis de ambiente ou configuração de deploy. A ordenação por recência do mock não foi incluída porque os dados não oferecem datas confiáveis para esse critério.

## Arquivos desta etapa

- `src/components/Experience.web.tsx`: hero e filtro alfabético com controles.
- `src/components/SiteHeader.web.tsx`: composição da pesquisa global e restauração de foco.
- `src/components/WebUI.tsx`: renderização válida dos ícones na exportação estática.
- `src/components/experience.css`: fonte, tokens, layout, cartões, navegação fixa e estados responsivos.
- `assets/images/hero-concepts.webp`: ilustração com transparência, cerca de 158 kB.
- `public/fonts/Manrope-Variable.ttf` e `Manrope-OFL.txt`: fonte local e licença.
- `public/fonts/Ionicons.ttf` e `Ionicons-LICENSE.txt`: fonte oficial de ícones já utilizada pela stack e licença.
- `scripts/preview.cjs`: tipo MIME para WebP no preview local.
- `scripts/verify-browser.cjs`: verificações adicionais de fonte, arte, ordenação, paginação, rolagem alfabética, foco e largura do conteúdo.
- `REDESIGN.md` e `design-qa.md`: análise, validação, evidências e instruções de preview.

## Recursos visuais

Referência: `C:/Users/Icaro/Downloads/Colagem do Dicionário Tech Moderno.png`. A colagem foi usada como direção visual, respeitando os dados e a arquitetura reais.

Ilustração criada com a ferramenta integrada de geração de imagens, conferida visualmente e comprimida para WebP mantendo o canal alfa. Prompt: “Transparent website hero illustration for Dicionário Tech: large tilted navy glass code tile with emerald edges and mint </>, smaller blue network, API and SQL satellite tiles; restrained editorial technology style, beveled edges and localized shadows; all objects visible, no background, UI, headings, logos or watermark.”

A marca institucional existente e os ícones Ionicons foram preservados. A fonte vem do repositório oficial `google/fonts`, diretório `ofl/manrope`, com licença anexada.

## Validação

Comandos executados e resultados detalhados estão em `design-qa.md`. As evidências renderizadas e os relatórios automatizados ficam em `.artifacts/` (ignorado pelo Git).

Resultado final: 17 testes unitários, 51 verificações de navegador e 20 verificações de rolagem aprovados. TypeScript, lint e build passaram; nenhuma exceção JavaScript foi registrada nas verificações finais.

Os testes de persistência usam um adaptador simulado. A verificação no navegador valida formulário, erros, contador e pré-preenchimento, sem enviar sugestões de teste ao banco de produção. Os callbacks de áudio são testados com a API de síntese simulada; a saída sonora real depende do dispositivo. A reprodução real já havia sido confirmada pelo usuário após corrigir o cabo de áudio.

## Abrir localmente

No diretório `termos`:

```powershell
npm run build
npm run preview
```

Abra http://localhost:4173. Para desenvolvimento com recarga: `npm run web`.

Para repetir a validação: `npm test`, `npx tsc --noEmit`, `npm run lint` e, com o preview ativo, `node scripts/verify-browser.cjs` seguido de `node scripts/verify-scroll.cjs`. Os dois scripts de navegador usam a mesma porta de depuração e devem rodar em sequência. `CHROME_PATH` permite indicar outro executável do Chrome.

## Preview na Vercel

1. Revise e faça commit das alterações na branch `redesign/dicionario-moderno`.
2. Envie essa branch ao repositório conectado à Vercel, mantendo a branch atual de produção. Com previews Git habilitados, a branch/PR recebe um Preview Deployment.
3. Preserve as configurações existentes. A aplicação está em `termos`, o comando de build é `npm run build` e a saída é `dist`.
4. No endereço de preview, teste `api`, setas/Enter/Escape, Ctrl+K, filtro A–Z, Todos, ordenação, mais termos, links diretos com atualização da página e os dois temas.
5. Confira em notebook e celular, incluindo o som real e os controles de parada/troca de termo. Confira campos inválidos, contador e link de sugestão de melhoria. Uma contribuição legítima pode validar a gravação pendente no painel; o preview pode usar o mesmo Firebase de produção.
6. Promova a produção somente após revisar o preview. Nenhum deploy foi feito nesta tarefa.
