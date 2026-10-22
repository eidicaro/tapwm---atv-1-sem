# Revisão visual e funcional — Dicionário Tech

Data: 22/10/2026. Branch: `redesign/dicionario-moderno`.

Complemento desta revisão: [admin-design-qa.md](admin-design-qa.md) cobre o login e as quatro áreas administrativas, com resultado final aprovado e testes isolados das escritas em produção.

## Achados e correções

- **[P1, corrigido] HTML inválido na abertura direta do formulário.** O componente web de ícones do React Native emitia `div` dentro de parágrafos. A exportação estática sofria erro de hidratação React #418 ao abrir `/sugestao` diretamente. `WebUI.Icon` agora renderiza os glifos da biblioteca Ionicons em `span`, com a fonte oficial hospedada localmente. Evidência posterior: cenário de abertura direta incluído no script, 51 verificações de navegador aprovadas e nenhum erro JavaScript.
- **[P2, corrigido] Arte ultrapassava a área de rolagem em notebook.** A primeira composição expandia a imagem até 135% da coluna. A largura foi limitada a 120%, com tamanho principal menor. Foram medidas tanto a largura do documento quanto a área real `.tech-page` em 1024, 768, 390 e 320 px; todas passaram.
- **[P2, corrigido] Catálogo perdia a navegação ao rolar.** A referência mantém a barra superior durante a exploração. O cabeçalho passou a ser sticky dentro da área de rolagem, com compensação de 88 px nos destinos. A captura final do catálogo mostra a navegação e o teste confirma que o cabeçalho permanece visível.
- **[P2, corrigido] Tipografia de links e botões inconsistente.** Estilos herdados do React Native Web e um reset `font: inherit` anulavam parte dos pesos. A família foi explicitada nos links e o reset passou a preservar os pesos dos componentes. Os estilos computados confirmam Manrope nos títulos, descrições e links dos cartões.
- **[P2, corrigido] Perda de contexto ao fechar a busca global.** O foco agora retorna ao botão de pesquisa. Os controles alfabéticos permanecem montados nos limites, com estado desabilitado, evitando desaparecer após o clique.

Não restam achados P0/P1/P2 nesta revisão. Como refinamento **P3**, a ilustração gerada tem bordas mais brilhantes que a referência; sua opacidade foi reduzida e a arte permanece decorativa, sem competir com a busca.

## Referência e evidências

- Referência aberta: `C:/Users/Icaro/Downloads/Colagem do Dicionário Tech Moderno.png`, 1536 × 1024.
- Implementação: export estático de produção servido em http://localhost:4173.
- Comparação anterior: `.artifacts/design-comparison-before.png`.
- Comparação final, referência e implementação no mesmo arquivo: `.artifacts/design-comparison.png`.
- Comparação ampliada de tipografia, pesquisa e cartões: `.artifacts/design-details.png`.
- Capturas desktop: `home-dark-desktop.png`, `home-light-desktop.png`, `search-dark-desktop.png`, `global-search-dark-desktop.png`, `catalog-light-desktop.png`, `term-dark-desktop.png`, `suggestion-dark-desktop.png`, `suggestion-light-desktop.png` e `suggestion-edit-dark-desktop.png` em `.artifacts/`.
- Capturas responsivas: `home-light-1024.png`, `home-light-768.png`, `home-light-390.png`, `home-light-320.png`, `term-light-mobile.png` e `suggestion-light-mobile.png`.

As capturas desktop têm viewport de 1440 × 1100 CSS px, densidade 1. As capturas responsivas têm altura 900 e larguras 1024/768/390/320. O teste de rolagem usa altura 650 e larguras 1440/390/320.

A fonte é uma colagem com cinco telas e sem metadados de viewport. Os painéis da referência foram recortados separadamente e comparados aos estados correspondentes da aplicação, normalizados por largura. Isso compara composição e linguagem visual, sem afirmar equivalência pixel a pixel entre viewports desconhecidos. Os detalhes e capturas em tamanho integral também foram abertos para revisar texto, foco, ícones e responsividade.

O navegador interativo da ferramenta não estava disponível. A renderização, captura e verificação ocorreram pelo harness Chrome headless já existente no repositório; os PNGs produzidos foram abertos e inspecionados. Não se tratou build ou resposta HTTP como prova visual.

## Superfícies de fidelidade

| Superfície | Revisão final |
| --- | --- |
| Fontes e tipografia | Manrope variável local, pesos até 800, títulos fortes, texto de apoio com altura confortável e links herdando a família correta. Em 390 px, a mensagem principal fica em duas linhas; em 320 px, em três, sem corte. |
| Espaçamento e layout | Hero com pesquisa ampla e arte contextual; três benefícios; grade de quatro colunas e transições para três, duas e uma. Cabeçalho fixo no catálogo, formulário em duas colunas no desktop e fluxo vertical no celular. Rodapé alinhado ao fim das páginas curtas. |
| Cores e tokens | Marinho e esmeralda no escuro, superfícies claras no tema claro, estados semânticos e bordas de controles visíveis. Contraste mínimo entre os textos amostrados: 10,03:1 no escuro e 5,35:1 no claro. |
| Imagens e ícones | Ilustração raster própria com alfa real, sem fundo opaco, comprimida para WebP de aproximadamente 158 kB. Ícones oficiais Ionicons, com renderização inline válida. Marca institucional existente mantida. |
| Conteúdo | Termos e definições reais do Firestore. A quantidade de resultados difere do mock: `api` tem um resultado cadastrado. Não foram inventados API REST, API Key, exemplos ou relacionados. Não há ordenação por recência sem datas confiáveis. |

Adaptações intencionais ao briefing: fundos mais contidos, sem a textura e os efeitos decorativos espalhados da colagem; link navegável para um conceito real abaixo da arte; abas e relações condicionadas aos campos existentes. A seção de leitura usa a definição cadastrada mesmo quando não há explicação adicional.

## Validação final

- `npm test`: **17 testes aprovados**, incluindo pesquisa, normalização, resumos, validação, persistência simulada e controle de áudio web/nativo.
- `npx tsc --noEmit`: **aprovado**.
- `npm run lint`: **aprovado**.
- `npm run build`: **aprovado**, 12 rotas estáticas exportadas.
- `node scripts/verify-browser.cjs`: **51 verificações aprovadas**, zero erros JavaScript. Relatório: `.artifacts/browser-results.json`.
- `node scripts/verify-scroll.cjs`: **20 verificações aprovadas**, zero erros de runtime. Relatório: `.artifacts/scroll-results.json`.
- `git diff --check`: **aprovado**.

O build informa apenas avisos de ferramentas/dependências sobre NO_COLOR/FORCE_COLOR e a base Browserslist antiga; não houve erro de compilação. Não foram atualizadas dependências fora do escopo do redesign.

Interações exercitadas: dados reais carregados, autocomplete e destaque, ArrowUp/Down, Enter, Escape, clique externo, limpeza, estado vazio, Ctrl+K, foco ao abrir/fechar, filtro A–Z e controles de rolagem, ordenação, mais termos, URL direta com atualização, pré-preenchimento de melhoria, validação e foco de erro do formulário, contador, alternância e persistência de tema, nomes acessíveis, movimento reduzido e ausência de overflow na área de conteúdo. A rolagem por mouse e toque, o acesso ao rodapé e a rolagem após fechar a busca foram testados nas páginas inicial e de sugestões.

Áudio: início, troca exclusiva, parada, callbacks antigos e mensagem de falha foram exercitados com a síntese do navegador simulada. Não foi aferida saída sonora nesta etapa; o usuário havia confirmado funcionamento real após corrigir o cabo. Persistência: sucesso, falha e repetição foram verificados com adaptador simulado, sem inserir sugestões de teste no Firebase de produção. Não foram executados emuladores nativos nem uma certificação integral de acessibilidade por leitor de tela.

## Checklist de entrega

- [x] Implementação no projeto existente, com integrações preservadas.
- [x] Comparação visual final e capturas responsivas abertas e revisadas.
- [x] Fluxos principais, temas, teclado, rolagem e estados de áudio verificados.
- [x] Lint, TypeScript, testes e build aprovados.
- [x] Arquivos e instruções de Preview da Vercel documentados em `REDESIGN.md`.
- [x] Preview local ativo; nenhum deploy de produção realizado.

final result: passed
