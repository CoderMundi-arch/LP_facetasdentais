# Dr. Gustavo Freitas · Odontologia Estética — LP (facetasdentais.com.br)

Recriação da landing page em HTML + CSS + JavaScript, com a mesma base técnica da LP Personal Lentes Dentais
(GSAP + ScrollTrigger + Lenis locais, fontes auto-hospedadas, conteúdo visível sem JS, `prefers-reduced-motion`).
Abra por um servidor (`npx serve` ou `python3 -m http.server`); via `file://` o navegador bloqueia as fontes.

## Estrutura
- `index.html` — página completa (11 seções)
- `assets/css/style.css` — estilos (tokens no `:root`)
- `assets/js/main.js` — interações e animações
- `assets/js/vendor/` — GSAP 3.13, ScrollTrigger e Lenis
- `assets/fonts/` — Manrope, DM Sans, Playfair Display (OFL)
- `assets/img/` — imagens otimizadas (WebP) a partir dos anexos

## Seções
Header · Hero · Faixa · Diferenciais · Dr. Gustavo Freitas · Resultados (comparador + galeria) ·
Depoimentos (vídeos) · FAQ · Localização e contato · CTA final · Footer · WhatsApp flutuante.

## Funcionalidades
- Menu com âncoras e rolagem suave; menu mobile; item da seção atual destacado.
- Todos os botões de agendamento abrem o WhatsApp (71) 98384-8071 com a mensagem do site original.
- Comparador antes/depois arrastável (mouse, toque e teclado) com 3 casos; galeria com lightbox (setas, teclado, Esc).
- Depoimentos em carrossel com setas, arrastar e barra de progresso; o vídeo só carrega ao chegar perto da tela.
- FAQ com abrir/fechar (um por vez), mapa do Google, link "Abrir no Google Maps", Instagram.
- WhatsApp flutuante após a primeira dobra.

## Pendências antes de publicar
1. **Seção "Nossa estrutura"** foi retirada por enquanto, até chegarem as fotos (Recepção, Consultório,
   Sala de espera, Ambiente, Detalhe). Ao recebê-las, a seção pode voltar entre "Dr. Gustavo" e "Resultados".
2. **Vídeos de depoimento**: hoje apontam para os arquivos do site atual
   (`facetasdentais.com.br/wp-content/uploads/2026/07/IMG_03xx.mp4`). Se o WordPress for desativado,
   baixe os 9 vídeos para `assets/video/` e troque os `data-src`.
3. `og:image`: trocar por URL absoluta após a publicação.
4. Remover a regra `.ph` do CSS quando não houver mais pendências.
