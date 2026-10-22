# Revisão visual e funcional — Administração

Data: 22/10/2026. Branch: `redesign/dicionario-moderno`.

## Achados e correções

- **[P2, corrigido] Título do login cortado em 320 px.** Ocultar as quebras de linha no celular juntava palavras sem espaço. Foram adicionados espaços explícitos entre os trechos. A captura final `admin-login-mobile.png` mostra o título completo, e a largura real do conteúdo passou na medição de 320 px.
- **[P2, corrigido] Navegação móvel cortava a seção ativa.** O botão selecionado podia crescer em largura depois do foco. Um efeito traz a seleção inteira para a área visível. O script verifica os limites do botão ativo em todas as mudanças de seção; `admin-section-3-390.png` mostra “Criar termo” por inteiro.
- **[P2, corrigido] Mensagens de outra seção permaneciam no formulário.** A navegação agora limpa o feedback anterior. A comparação anterior mostrava uma mensagem de rejeição na criação; a captura final de criação está limpa. A publicação ainda confirma o sucesso na lista de termos.
- **[P1, corrigido] Aprovação podia ser parcialmente concluída.** O fluxo anterior publicava antes de atualizar o status, em duas operações. O novo repositório usa uma transação com verificação do status pendente. Os testes confirmam publicação/status juntos e rejeição de uma segunda revisão do mesmo registro.
- **[P2, corrigido] Erros de edição/remoção atrás do diálogo.** O feedback de falha é mostrado dentro do modal aberto. A suíte exercita falha de edição, preservação do conteúdo e nova tentativa com sucesso.

Na comparação final não restam achados P0/P1/P2. As diferenças decorativas da referência são adaptações intencionais ao briefing: fundos contidos, sem círculos ou brilho espalhado; mesma família de ícones e fonte do site público. Não há imagens de conteúdo que precisem de geração ou substituição neste layout.

## Evidências e normalização

- Fonte aberta: `C:/Users/Icaro/Downloads/a_wide_clean_ui_ux_mockup_collage_of_an_admin_pan.png`, 1536 × 1024.
- Comparação anterior: `.artifacts/admin-design-comparison-before.png`.
- Comparação final, com referência e implementação no mesmo arquivo: `.artifacts/admin-design-comparison.png`.
- Detalhes de formulário e cartão, também em comparação conjunta: `.artifacts/admin-design-details.png`.
- Login real: `.artifacts/admin-login-light.png` e `admin-login-dark.png`, capturados na exportação estática em http://localhost:4173/login.
- Painel: `admin-overview-dark.png`, `admin-suggestions-dark.png`, `admin-create-dark.png`, `admin-terms-dark.png` e correspondentes claros em `.artifacts/`.
- Celular: `admin-section-1-390.png` até `admin-section-4-390.png`, equivalentes em 320 px e `admin-login-mobile.png`.

Desktop foi capturado em 1440 × 1000 CSS px, densidade 1. As capturas móveis têm largura de 390 ou 320 e altura 900. As verificações também cobrem 1024 e 768 px. A colagem não informa viewports ou densidade dos painéis; seus cinco recortes foram normalizados por largura/altura para comparar composição. Não foi tratada como uma única tela nem usada para alegar equivalência pixel a pixel. As capturas inteiras e os detalhes foram abertos separadamente para conferir legibilidade, ícones, estados e espaçamento.

O login real e o redirecionamento de `/admin` foram verificados na aplicação exportada. As capturas autenticadas do painel usam **os componentes reais ligados a um repositório de testes em memória**, em servidor local efêmero. Por isso seus números e registros são fixtures e diferem do mock e do Firebase. Esse harness não faz parte das rotas da aplicação, não é exportado em `dist` e não remove a proteção do admin.

O navegador interativo da ferramenta não estava disponível; as capturas renderizadas foram produzidas pelo Chrome headless e abertas para análise. Build e respostas HTTP não substituíram a revisão visual.

## Superfícies obrigatórias

| Superfície | Revisão final |
| --- | --- |
| Tipografia | Manrope local, títulos de 31 px no painel e 26 px no celular, hierarquia com pesos 750/800, corpo e descrições legíveis. Login em três linhas no desktop e quebra natural no celular. Sem truncar nomes ou explicações. |
| Espaçamento e layout | Barra lateral de 252/225 px, conteúdo central com limite de largura, métricas em três colunas e pilha móvel, revisão em cartões compactos, gestão em linhas e formulário em superfície única. A navegação móvel rola dentro da própria faixa. |
| Cores e tokens | Esmeralda e marinho, estados azul/verde/âmbar/rosa e equivalentes claros. Textos e ações amostrados passaram em AA (ao menos 4,5:1) no login claro e no painel nos dois temas. Bordas e foco visível preservados. |
| Imagens e ícones | Marca tipográfica e símbolo de código existentes; glifos oficiais Ionicons em elementos inline válidos. Sem SVG manual, arte em CSS ou ícones improvisados. Nenhum novo raster era necessário para esse layout de formulários e dados. |
| Texto e conteúdo | Mensagem institucional e rótulos coerentes com o produto. Na aplicação, contagens vêm do Firestore; datas vêm de `data` ou da ação confirmada da sessão. Não há histórico inventado, datas relativas fictícias ou catálogo fictício de categorias. |

O tema claro das áreas internas é uma extensão dos tokens existentes, pois o mock as mostra principalmente no escuro. O botão “Ver sugestões” é uma adaptação do “Ver todas”: não existe uma coleção persistente de auditoria, e a interface declara que as ações exibidas são desta sessão. Registros sem data permanecem acessíveis pela revisão.

## Validação final

- `npm test`: **21 testes aprovados**.
- `npx tsc --noEmit`: **aprovado**, incluindo os componentes nativos mantidos.
- `npm run lint`: **aprovado**, sem avisos do projeto.
- `npm run build`: **aprovado**, 12 rotas estáticas exportadas.
- `node scripts/verify-admin.cjs`: **50 verificações aprovadas**, zero erros JavaScript; `.artifacts/admin-results.json`.
- `node scripts/verify-browser.cjs`: **51 verificações do site público aprovadas**, zero erros JavaScript; `.artifacts/browser-results.json`.
- `git diff --check`: **aprovado**.

Foram testados: proteção da rota real, mostrar/ocultar senha, validação e foco do login, contagens, estados de revisão, busca sem acentos/caixa, filtro alfabético, publicação, edição com exemplos preservados, confirmação/cancelamento de remoção e restauração de foco. Também foram exercitados falha de carga e repetição, falha de revisão/publicação/edição/logout, bloqueio de cliques simultâneos, ausência de falso sucesso, nomes acessíveis, movimento reduzido e ausência de overflow nas quatro áreas em todas as larguras verificadas.

Os testes de operações administrativas, sucesso de login e falhas usam adaptadores isolados; não houve autenticação com uma conta administrativa real nem escritas no Firebase de produção. A proteção foi verificada sem credenciais na rota real. A integração de escrita com as permissões da conta real deve ser conferida no preview com uma contribuição legítima ou banco de desenvolvimento. Android/iOS não foram executados em emulador, e esta revisão não equivale a uma certificação integral por leitor de tela.

## Checklist

- [x] Layout aplicado às rotas existentes, sem projeto paralelo de entrega.
- [x] Autenticação, coleções e revisão preservadas.
- [x] Temas e responsividade revisados visualmente.
- [x] Fluxos de escrita e erro exercitados com isolamento do banco real.
- [x] Testes, TypeScript, lint e build aprovados.
- [x] Comparação final aberta; nenhum P0/P1/P2 pendente.
- [x] Preview local mantido; nenhum deploy, commit ou push realizado.

final result: passed
