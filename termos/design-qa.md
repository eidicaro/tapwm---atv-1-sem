# Revisão visual e funcional — Dicionário Tech

Data: 21/10/2026. Branch: `redesign/dicionario-tech`.

## Referência e evidência

- Verdade visual: `C:/Users/Aluno/Downloads/dicionario-tech-proposta-visual.png`, composição de 1536×1024 com hero escura, autocomplete, catálogo claro, termo e sugestões.
- Implementação executada: http://localhost:4173, export estático do Expo servido por `scripts/preview.cjs`.
- Comparação no mesmo arquivo: `.artifacts/design-comparison.png`, 1668×1100, aberto e inspecionado visualmente após a última captura.
- Capturas completas desktop: `.artifacts/home-dark-desktop.png`, `home-light-desktop.png`, `search-dark-desktop.png`, `catalog-light-desktop.png`, `term-dark-desktop.png`, `suggestion-dark-desktop.png`, `suggestion-light-desktop.png`.
- Capturas responsivas: `.artifacts/home-light-1024.png`, `home-light-768.png`, `home-light-390.png`, `home-light-320.png`, `term-light-mobile.png`, `suggestion-light-mobile.png`.
- Resultados verificáveis: `.artifacts/browser-results.json`, 39 verificações aprovadas e lista vazia de erros JavaScript.

As capturas desktop são 1440×1100 pixels/CSS px, deviceScaleFactor 1. As capturas responsivas usam larguras 1024, 768, 390 e 320 CSS px, altura 900 e densidade 1. A referência é uma composição de várias telas, sem metadados de viewport; não foi tratada como uma página única nem como captura @2x.

No comparativo, o recorte da hero da referência é 834×500 e o da implementação é 1160×696, ambos mostrados em 834×500. O catálogo da referência é 834×496 e o trecho da implementação é 1160×696, normalizado para 834×500. A normalização compara proporção e linguagem visual; não representa uma medição pixel a pixel entre dispositivos iguais. As capturas completas foram abertas separadamente para revisar texto, controles e detalhes sem o efeito da redução.

## Superfícies obrigatórias

- **Fontes e tipografia:** família de sistema com Segoe UI no Windows, títulos pesados, hierarquia clara e descrições legíveis. A inspeção dos estilos computados confirmou a família em títulos, cartões e descrições. Foram corrigidos links do React Native Web que inicialmente anulavam o peso e o tamanho dos títulos dos cartões.
- **Espaçamento e layout:** hero com pesquisa dominante e destaque contextual à direita; três benefícios; catálogo de quatro colunas em desktop, três em larguras intermediárias, duas em tablet/celulares maiores e uma em telas menores. Filtros alfabéticos têm rolagem própria no celular. Cartões seguem o conteúdo resumido, com leitura completa na rota individual. Formulário passa de duas colunas a uma sem overflow.
- **Cores e tokens:** marinho, esmeralda e superfícies claras, cores semânticas de ícones e estados, campos com borda visível e foco. Textos principais medidos no navegador passaram em AA: menor contraste amostrado no claro 5,35:1 e no escuro 10,02:1. Cores de destaque dos botões usam texto escuro para manter legibilidade.
- **Imagens e ícones:** marca institucional existente preservada, ícones Ionicons da dependência já instalada. Nenhuma arte foi aproximada com SVG manual, CSS, emoji ou glifos. A decoração 3D da referência foi deliberadamente substituída por um cartão navegável com definição real, conforme a autorização do brief para adaptar a ilustração.
- **Texto e dados:** mensagem principal e identificação institucional preservadas; resultados e definições usam exclusivamente os 57 documentos reais consultados. A API aparece como `api`, conforme o cadastro. Não foram criadas as variantes API REST/Key/Gateway do mock, exemplos ou relações inexistentes. Só há ordenação alfabética porque não existem datas confiáveis para ordenar por recência.

## Histórico de correções

1. **[P1, corrigido] Busca global não focava o campo ao abrir.** O foco acontecia antes de `dialog.showModal()`. O campo agora recebe foco após a abertura. Confirmado por Ctrl+K e foco real no input nas páginas inicial e do termo.
2. **[P1, corrigido] Atalhos duplicados após navegação.** O Expo mantinha telas anteriores montadas. Apenas a página focada renderiza seu conteúdo e navegação; confirmado um único diálogo ativo ao pesquisar a partir do termo.
3. **[P2, corrigido] Ícones móveis ocultos.** Um seletor também ocultava o span interno dos ícones. A regra agora alcança somente o rótulo direto. Foram adicionados nomes acessíveis e alvos de toque; em telas pequenas a marca funciona como retorno ao início, simplificando a barra.
4. **[P2, corrigido] Cartões com títulos sem hierarquia.** A fonte dos links passa a herdar explicitamente o título; a captura final do catálogo confirma peso e tamanho consistentes.
5. **[P2, corrigido] Erros persistiam após correção do formulário.** A validação do campo é atualizada durante a edição após a primeira falha. Capturas finais não mostram erro de descrição em texto válido; contador e foco foram testados.
6. **[P2, corrigido] Nome e explicação no layout móvel podiam se juntar.** O espaçamento foi preservado quando a quebra de linha desktop é ocultada. Captura final de sugestão em 320 px confirma “de uma” com espaçamento.
7. **[P2, corrigido] Bordas discretas demais nos campos claros.** Foram aplicados tokens de borda de controle mais visíveis e foco consistente, preservando bordas suaves nos cartões de conteúdo.

Evidência posterior: capturas finais listadas acima, comparativo aberto após as correções e nova execução completa das 39 verificações. Sem P0/P1/P2 visuais pendentes identificados na comparação final.

## Verificações funcionais e limites

Autocomplete: dados reais, destaque, setas em múltiplas opções, Enter, Escape, clique externo, limpeza, estado vazio e pesquisa global. Catálogo: filtro e ordenação, nomes acessíveis e URLs reais. Termo: navegação direta e atualização da página. Sugestão: rótulos, erro/foco, preenchimento de melhoria, contador e correção dos erros. Temas: persistência, contraste dos textos amostrados e movimento reduzido. Sem erros de runtime registrados.

O áudio foi testado com um simulador da API de síntese do navegador, exercitando o caminho `expo-speech`, reprodução exclusiva, parada, callbacks antigos e falhas. Não foi aferida saída sonora. Sucesso/falha de persistência e duplicidade foram testados com adaptador simulado em testes unitários; não houve inserção de dados de teste no Firebase de produção. Não foram executados emuladores nativos nem uma auditoria completa por leitor de tela.

## Adaptações aceitas e acompanhamento

- A referência é direção visual, conforme o pedido; decoração, tipografia exata e dados exemplificativos foram adaptados à stack e ao conteúdo real.
- Cabeçalhos duplicados no mosaico de referência representam telas separadas; a implementação tem um único cabeçalho por página ativa.
- Exemplos e relações ficam ausentes quando o banco não os fornece. A página não inventa conteúdo para preencher o espaço.
- Acompanhar em dispositivos reais: vozes pt-BR, leitura com leitor de tela, Safari e conforto em zoom. Essas verificações complementam as evidências automatizadas.

## Checklist

- [x] Comparar fonte e implementação na mesma imagem.
- [x] Inspecionar também capturas completas e detalhes legíveis.
- [x] Corrigir problemas de foco, navegação, tipografia e responsividade identificados.
- [x] Recapturar a implementação depois das correções.
- [x] Validar 13 testes, TypeScript, lint e build.
- [x] Manter preview local ativo e preservar produção.

final result: passed