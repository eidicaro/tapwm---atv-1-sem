# Redesign — Dicionário Tech

Implementado no projeto Expo existente, na branch `redesign/dicionario-tech`, em 21/10/2026. Preview local: http://localhost:4173. As alterações estão no diretório de trabalho, sem commit, push ou deploy de produção.

## O que foi preservado

- Expo SDK 54, React 19, React Native Web e Expo Router.
- Coleções Firestore `termos` e `sugestoes`, Firebase Authentication e revisão no painel administrativo.
- Schema de sugestões: `termo`, `descricao`, `status: 'pendente'`, `data`.
- Leitura em português por `expo-speech` e síntese de voz do navegador.
- Temas e chave de preferência `dicionario-theme`.
- Rotas `/`, `/sugestao`, `/admin` e `/login`; a antiga `/modal` leva ao catálogo.
- Acesso administrativo por três cliques na marca, além da URL `/admin`.
- Comando de build `expo export -p web` e saída estática `dist`.

Nenhuma dependência foi adicionada. Configuração Firebase, variáveis de ambiente, regras do banco e configuração externa da Vercel não foram alteradas.

## Mudanças

A interface segue a referência em tipografia, hierarquia, cores, navegação, cartões e formulário. O destaque da hero apresenta um conceito real do banco, substituindo a decoração 3D por uma entrada útil para o conteúdo. A pesquisa recebeu destaque e o catálogo passou a integrar a página inicial.

Uma única carga de termos é compartilhada entre autocomplete, catálogo e páginas individuais. A busca ignora caixa e acentos, pesquisa nomes e descrições e prioriza nomes exatos, prefixos e ocorrências no nome antes das descrições. Resumos contextualizam a ocorrência encontrada. Não há chamadas ao Firestore por tecla digitada.

O autocomplete inclui combobox/listbox, destaque de texto, setas, Enter, Escape, fechamento ao clicar fora, limpeza e busca global com Ctrl+K/Cmd+K. Telas inativas mantidas pelo Expo deixam de renderizar sua navegação, evitando diálogos e atalhos duplicados.

O catálogo oferece A–Z completo, filtro Todos, ordenação A–Z/Z–A e carregamento progressivo. O filtro tem rolagem horizontal própria no celular. Os cartões oferecem áudio e acesso à definição completa, sem cortar a explicação da página individual.

Os links individuais usam `/termo?id=ID_DO_FIRESTORE`. Essa rota estática permite compartilhar e atualizar a página sem consultar o banco durante o build ou depender de geração de rotas dinâmicas na Vercel. Explicações adicionais, exemplos e relações só aparecem quando existem nos campos opcionais `explicacao`, `exemplos` e `relacionados`. O conteúdo de demonstração da referência não foi inserido no banco.

O formulário valida os campos, conta caracteres, mantém o texto em caso de erro, bloqueia cliques concorrentes e só confirma sucesso após a operação persistida. Repetições de uma tentativa incerta reutilizam o mesmo ID e data durante a sessão do formulário. O painel continua revisando a mesma coleção. Alterações administrativas atualizam também o catálogo compartilhado.

O áudio tem controle central para interromper a reprodução anterior, ignorar callbacks antigos, parar na troca de rota e apresentar falhas ou indisponibilidade. Um timeout cobre navegadores que não iniciam a síntese. Temas têm persistência opcional, foco visível, contraste revisado e redução de movimento.

## Arquivos alterados ou adicionados

| Grupo | Arquivos |
| --- | --- |
| Rotas | `app/(tabs)/index.tsx`, `app/_layout.tsx`, `app/header.tsx`, `app/modal.tsx`, `app/sugestao.tsx`, `app/termo.tsx` |
| Telas web e nativas | `src/components/Experience.web.tsx`, `src/components/Experience.tsx`, `src/components/SiteHeader.web.tsx`, `src/components/SiteHeader.tsx` |
| Componentes e estilos | `src/components/WebUI.tsx`, `src/components/experience.css`, `src/components/TermGrid.tsx`, `src/components/AdminDashboard.tsx` |
| Estado e integrações | `src/context/DictionaryContext.tsx`, `src/context/AudioContext.tsx`, `src/context/ThemeContext.tsx`, `src/hooks/useSuggestion.ts` |
| Regras | `src/lib/dictionary.ts`, `src/lib/suggestion.ts` |
| Verificação e preview | `scripts/preview.cjs`, `scripts/verify-browser.cjs`, `tests/dictionary.test.cjs`, `tests/suggestion.test.cjs`, `package.json`, `.gitignore` |
| Documentação | `REDESIGN.md`, `design-qa.md` |

## Validação executada

- `npx.cmd tsc --noEmit`: passou.
- `npm.cmd run lint`: passou sem avisos do projeto.
- `npm.cmd test`: 13 testes passaram.
- `npm.cmd run build`: passou; 12 rotas estáticas exportadas.
- `node scripts/verify-browser.cjs`: 39 verificações passaram no Chrome headless, sem erros JavaScript registrados.
- `git diff --check`: passou.

A navegação foi exercitada com os 57 termos reais do Firestore. Foram verificados resultados, ranking, destaque, estados vazios, teclado, fechamento externo, atalho na página inicial e na página do termo, filtros, URL direta com refresh, pré-preenchimento de melhoria, erros do formulário, contador e persistência de tema.

As capturas cobrem desktop 1440×1100, larguras 1024/768/390/320 e altura 900 nas verificações responsivas. Não houve overflow horizontal da página. Foram verificados nomes acessíveis, foco dos campos inválidos, preferência de movimento reduzido e contraste de textos principais nos dois temas. Isso é uma revisão dos componentes implementados, não uma certificação completa WCAG.

Sucesso, falha e repetição do envio foram testados com um adaptador de persistência simulado. Nenhuma sugestão de teste foi gravada em produção. Os estados e callbacks do áudio foram exercitados pela integração real `expo-speech`, substituindo apenas a síntese de voz do navegador por um simulador. A qualidade audível depende das vozes instaladas e precisa de conferência manual. Android/iOS não foram executados em emulador; seus componentes passaram pelo TypeScript.

Capturas, comparação e resultados completos estão em `.artifacts/`, ignorado pelo Git. Veja também `design-qa.md`.

## Como abrir localmente

No diretório `termos`:

```powershell
npm.cmd run build
npm.cmd run preview
```

Abra http://localhost:4173. Para desenvolvimento com recarga, use `npm.cmd run web`. Os testes sem dependências adicionais usam suporte nativo a TypeScript do Node; execute com Node 22.18+ (verificado com Node 25.3).

Para repetir a verificação visual, deixe o preview ativo e rode `node scripts/verify-browser.cjs`. O script usa Chrome headless no Windows; `CHROME_PATH` permite indicar outro caminho do executável.

## Como validar no Preview da Vercel

1. Revise e faça commit das alterações na branch `redesign/dicionario-tech`.
2. Envie essa branch ao repositório conectado à Vercel, mantendo a branch de produção atual. Se a integração Git estiver habilitada para previews, ela gera um Preview Deployment para a branch/PR.
3. Preserve as configurações atuais do projeto. A aplicação está em `termos`, o build é `npm run build` e a saída é `dist`. Não foi encontrado `vercel.json` no repositório; as opções do painel da Vercel não puderam ser inspecionadas por esta sessão.
4. Na URL de preview, teste uma pesquisa como `api`, depois setas/Enter e Ctrl+K/Cmd+K. Confira A–Z, Todos, ordenação e os dois temas em desktop e celular.
5. Abra um termo, copie sua URL, atualize a página e teste os controles de áudio com as vozes reais do dispositivo.
6. Confira o formulário vazio, contador e pré-preenchimento de melhoria. Para validar uma gravação real, envie uma contribuição legítima e confirme sua chegada como pendente no painel. A confirmação só deve aparecer após sucesso do banco. Em preview que usa o mesmo Firebase de produção, o envio vai para a coleção existente.
7. Só promova a versão a produção após a revisão do preview. Nenhum deploy foi realizado nesta implementação.