/**
 * Comportamento da home (portado de output/landing-motion): conversas do
 * celular, capítulos da rotina, palavras que acendem, fios das integrações,
 * menu, seta de rolagem e a janela dos planos. Tudo preso ao bloco `root`;
 * a função devolve a limpeza (listeners, observers e conversas em curso).
 */

type Step = { who: "me" | "mila"; html: string };
type Chapter = { title: string; body: string; tag: "both" | "pro"; chat: Step[] };

// Copy escrita aqui, nunca vinda de usuário: pode ir para innerHTML.
const PHOTO = "/products/argola-frontal-cravejada.png";
const READ =
  '<svg viewBox="0 0 18 12" aria-hidden="true"><path d="M1 6.5l3.2 3.2L10 3M7 6.8l3.2 3.2L16 3.5" fill="none" stroke="#53BDEB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const T = {
  text: (who: "me" | "mila", html: string, time: string) =>
    `<div class="msg ${who}">${html}<span class="t">${time}${who === "me" ? READ : ""}</span></div>`,
  photo: (html: string, time: string) =>
    `<div class="msg me photo"><img src="${PHOTO}" alt="" width="440" height="232"><p>${html}</p><span class="t">${time}${READ}</span></div>`,
  doc: (name: string, meta: string, html: string, time: string) =>
    `<div class="msg me"><div class="doc"><i>PDF</i><span><b>${name}</b><small>${meta}</small></span></div>${html}<span class="t">${time}${READ}</span></div>`,
};
// Resposta de preço como o WhatsApp mostra: texto, negrito e quebras. Números pela
// conta do Eve (agent/lib/margem_venda.ts): R$ 22 + R$ 6,50 de embalagem, markup 3x,
// taxa de 5% -> R$ 90,00, margem R$ 57,00 = 63%.
const PRECO =
  "Calculado! O preço sugerido ficou em <b>R$&nbsp;90,00</b>.<br><br>Custo com embalagem: R$&nbsp;28,50<br>Markup 3x e taxa da maquininha de 5%<br>Margem de contribuição estimada: <b>R$&nbsp;57,00</b> (63%), sem tributos nem custos fixos.<br><br>";
// Versão curta para o hero, onde a foto precisa caber na tela com a resposta.
const PRECO_CURTO =
  "Calculado! O preço sugerido ficou em <b>R$&nbsp;90,00</b>, com margem de contribuição estimada de 63%, sem tributos nem custos fixos.<br><br>";

const HERO: Step[] = [
  { who: "me", html: T.photo("mila, chegou essa argola. Custo R$&nbsp;22,00, markup 3x. Me passa um preço pra vender?", "10:12") },
  { who: "mila", html: T.text("mila", `${PRECO_CURTO}Usei o seu markup de 3x, com a taxa e a embalagem salvas no seu perfil. Quer que eu cadastre 1 unidade no estoque?`, "10:12") },
  { who: "me", html: T.text("me", "Pode cadastrar 1 unidade no estoque", "10:13") },
  { who: "mila", html: T.text("mila", "Pronto. Cadastrei a argola com 1 unidade e deixei a descrição técnica salva no catálogo. Onde você quer salvar agora?<br><br>• Nuvemshop<br>• Google Planilhas<br>• Notion<br>• Planilha para importar na Phibo", "10:13") },
  { who: "me", html: T.text("me", "Salva no Notion, por favor!", "10:14") },
  { who: "mila", html: T.text("mila", "Pronto. Salvei no seu Notion: foto, custo de R$&nbsp;22,00, preço sugerido de R$&nbsp;90,00 e margem de 63%. Estoque com 1 unidade.", "10:14") },
];

const CHAPTERS: Chapter[] = [
  { title: "Chegou mercadoria.", body: "Mande a nota de compra em XML ou PDF. A mila lê os itens e os custos. No Pro, ela cadastra as peças no Jueri, na Olist ou na Nuvemshop, prontas para precificar.", tag: "both",
    chat: [
      { who: "me", html: T.doc("nota_compra.pdf", "PDF · 2 páginas", "Chegou a reposição", "08:40") },
      { who: "mila", html: T.text("mila", "Li a nota e separei as peças com os custos de compra. Onde você quer cadastrar?<br><br>• Nuvemshop<br>• Olist<br>• Jueri", "08:41") },
      { who: "me", html: T.text("me", "No Jueri", "08:42") },
      { who: "mila", html: T.text("mila", "Pronto. Cadastrei as peças no seu Jueri com o custo de cada uma. Quer que eu calcule o preço de venda?", "08:42") },
    ] },
  { title: "Antes de definir o preço.", body: "A conta sai com os seus custos, a sua taxa e a sua embalagem. E, se quiser, com o radar de preços do Google Shopping ao lado.", tag: "both",
    chat: [
      { who: "me", html: T.text("me", "Quanto cobro nessa argola? Custo R$ 22", "10:12") },
      { who: "mila", html: T.text("mila", `${PRECO}Quer que eu veja os preços parecidos no Google Shopping?`, "10:12") },
    ] },
  { title: "Tem peça nova para vender.", body: "A descrição técnica sai pronta para a loja virtual. No Pro, com a ferramenta conectada e autorizada, ela cadastra a peça no Jueri, na Olist ou na Nuvemshop quando você pede.", tag: "both",
    chat: [
      { who: "me", html: T.photo("Descreve essa pra loja virtual", "09:02") },
      { who: "mila", html: T.text("mila", "<b>Argola frontal cravejada</b><br>Banho de ouro, zircônias na frente, fecho click. Quer que eu cadastre na Nuvemshop?", "09:03") },
    ] },
  { title: "Fornecedores à mão.", body: "Um caderno de fornecedores que você consulta no próprio WhatsApp, com cópia no seu Google Planilhas ou no seu Notion. No Pro, ela avisa antes de vencer a carência, para você repor sem ter que bater o pedido mínimo de novo.", tag: "both",
    chat: [
      { who: "me", html: T.text("me", "Qual era o fornecedor das argolas cravejadas?", "14:20") },
      { who: "mila", html: T.text("mila", "Está no seu caderno de fornecedores, com contato e prazo de reposição. Quer que eu mande o contato aqui?", "14:20") },
    ] },
  { title: "Conteúdo para o Instagram.", body: "Legenda com gancho e hashtags para cada peça. No Pro, carrosséis, roteiros de Reels e o planejamento da semana. Quem revisa e publica é você.", tag: "both",
    chat: [
      { who: "me", html: T.text("me", "Faz uma legenda pra essa argola", "16:05") },
      { who: "mila", html: T.text("mila", "Brilho que vai do café ao jantar ✦<br>Argola frontal cravejada, banho de ouro.<br><br>#semijoias #argola #joiasfemininas", "16:05") },
    ] },
  { title: "Estoque e vendas.", body: "Com a ferramenta conectada e autorizada: estoque e preços na Nuvemshop, na Olist ou no Jueri, os pedidos da Nuvemshop, e o balanço mensal de compras com a projeção de faturamento no WhatsApp.", tag: "pro",
    chat: [
      { who: "me", html: T.text("me", "Ainda tenho a argola cravejada no estoque?", "18:30") },
      { who: "mila", html: T.text("mila", "Conferi na sua Nuvemshop agora: tem estoque e o preço publicado é R$ 90,00. Quer que eu ajuste?", "18:30") },
    ] },
];

const EM = new Set(["taxa", "maquininha,", "embalagem", "markup.", "guarda", "ajusta"]);
const LABELS: Record<string, string> = { memoria: "Ela lembra por você", integracoes: "Integrações", planos: "Planos", duvidas: "Dúvidas", final: "Começar" };
const NAV_SPACE = 88;

export function startLanding(root: HTMLElement): () => void {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = <E extends Element = HTMLElement>(sel: string) => root.querySelector(sel) as E;
  const $$ = <E extends Element = HTMLElement>(sel: string) => [...root.querySelectorAll(sel)] as E[];
  const cleanups: Array<() => void> = [];
  const on = <K extends keyof WindowEventMap>(target: Window | Document | Element, type: K | string, fn: (e: never) => void, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn as EventListener, opts);
    cleanups.push(() => target.removeEventListener(type, fn as EventListener, opts));
  };
  const observe = <O extends { disconnect(): void }>(o: O) => { cleanups.push(() => o.disconnect()); return o; };

  root.classList.add("js");
  // âncoras do menu rolam suave e o fundo da página acompanha o verde do topo
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  const prevBg = document.body.style.background;
  html.style.scrollBehavior = "smooth";
  document.body.style.background = "#173F3B";
  cleanups.push(() => { html.style.scrollBehavior = prevBehavior; document.body.style.background = prevBg; });

  /* ---------- chat engine ---------- */
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  function makePlayer(body: HTMLElement) {
    const state = body.closest(".screen")!.querySelector("[data-state]") as HTMLElement;
    let token = 0;
    async function play(steps: Step[], { loop = false, fast = false } = {}) {
      const my = ++token;
      body.classList.remove("fading");
      const DAY = '<p class="day">Hoje</p>';
      const toEnd = () => body.scrollTo({ top: body.scrollHeight, behavior: reduce ? "auto" : "smooth" });
      body.innerHTML = DAY; body.scrollTop = 0;
      if (reduce) { body.innerHTML = DAY + steps.map((s) => s.html).join(""); toEnd(); return; }
      do {
        for (const s of steps) {
          if (my !== token) return;
          if (s.who === "mila") {
            state.textContent = "digitando…";
            const t = document.createElement("div");
            t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>";
            body.appendChild(t);
            toEnd();
            await wait(fast ? 650 : 1150);
            if (my !== token) return;
            t.remove();
            state.textContent = "online";
          } else {
            await wait(fast ? 250 : 650);
            if (my !== token) return;
          }
          body.insertAdjacentHTML("beforeend", s.html);
          toEnd();
          // tempo de leitura: resposta longa fica um pouco mais na tela
          await wait(fast ? 300 : Math.min(2800, 1000 + (body.lastElementChild?.textContent?.length ?? 0) * 9));
        }
        if (!loop) return;
        await wait(6000);
        if (my !== token) return;
        body.classList.add("fading");
        await wait(550);
        if (my !== token) return;
        body.innerHTML = DAY; body.scrollTop = 0;
        body.classList.remove("fading");
      } while (loop);
    }
    return { play, stop: () => { token++; } };
  }

  /* ---------- hero ---------- */
  const heroPlayer = makePlayer($("#hero-chat"));
  cleanups.push(heroPlayer.stop);
  let heroRunning = false;
  let heroTimer = 0;
  observe(new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !heroRunning) { heroRunning = true; heroTimer = window.setTimeout(() => heroPlayer.play(HERO, { loop: true }), reduce ? 0 : 500); }
    else if (!e.isIntersecting && heroRunning) { heroRunning = false; clearTimeout(heroTimer); heroPlayer.stop(); }
  }, { threshold: 0.35 })).observe($(".hero .phone"));
  cleanups.push(() => clearTimeout(heroTimer));

  // entrada: arma no próximo quadro
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-in")));

  /* ---------- capítulos da rotina ---------- */
  const list = $("#chapters");
  list.innerHTML = CHAPTERS.map((c, i) => `
    <li class="chapter${i === 0 ? " is-active" : ""}" data-i="${i}">
      <div class="ch-top"><span class="ch-num lp-num">${String(i + 1).padStart(2, "0")} / 06</span>${
        c.tag === "pro" ? '<span class="pro">Só no Pro</span>' : '<span class="plans-tags" aria-label="Nos planos Essencial e Pro"><span class="pro part">Essencial</span><span class="pro">Pro</span></span>'}</div>
      <h3>${c.title}</h3>
      <p>${c.body}</p>
      <div class="ch-chat" aria-hidden="true">${c.chat.map((s) => s.html).join("")}</div>
    </li>`).join("");

  const storyPlayer = makePlayer($("#story-chat"));
  cleanups.push(storyPlayer.stop);
  const desktop = () => matchMedia("(min-width: 961px)").matches;
  let active = -1;
  let storyVisible = false;
  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    list.querySelectorAll(".chapter").forEach((el, k) => el.classList.toggle("is-active", k === i));
    if (storyVisible && desktop()) storyPlayer.play(CHAPTERS[i].chat, { fast: true });
  };
  // a conversa do capítulo só toca com a rotina na tela, e recomeça na chegada
  observe(new IntersectionObserver(([e]) => {
    const was = storyVisible;
    storyVisible = e.isIntersecting;
    if (storyVisible && !was && active >= 0 && desktop()) storyPlayer.play(CHAPTERS[active].chat, { fast: true });
    if (!storyVisible) storyPlayer.stop();
  }, { threshold: 0.15 })).observe($("#story"));
  const chapterIO = observe(new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); });
  }, { rootMargin: "-45% 0px -45% 0px" }));
  list.querySelectorAll(".chapter").forEach((el) => chapterIO.observe(el));
  setActive(0);

  /* ---------- entradas ---------- */
  const revealIO = observe(new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("seen"); revealIO.unobserve(e.target); } });
  }, { threshold: 0.15 }));
  $$(".reveal").forEach((el) => revealIO.observe(el));

  /* ---------- "Ela lembra por você": palavras que acendem com a rolagem ---------- */
  const manifest = $("#manifest");
  if (!manifest.querySelector(".w")) {
    // palavra de uma letra ("a", "e", "o") fica na linha da palavra seguinte
    const tokens = (manifest.textContent ?? "").trim().split(/\s+/).reduce<string[]>((acc, w) => {
      if (acc.length && acc[acc.length - 1].length === 1) acc[acc.length - 1] += " " + w; else acc.push(w);
      return acc;
    }, []);
    manifest.innerHTML = tokens.map((w) => {
      const parts = w.split(" ");
      const last = parts.pop() as string;
      return `<span class="w">${parts.map((x) => x + " ").join("")}${EM.has(last) ? `<span class="em">${last}</span>` : last}</span>`;
    }).join(" ");
  }
  const words = [...manifest.querySelectorAll(".w")];
  let ticking = false;
  const paint = () => {
    ticking = false;
    const r = manifest.getBoundingClientRect();
    const start = innerHeight * 0.85;
    // termina quando a seção chega ao topo da tela, onde a seta a estaciona
    const end = r.top - (manifest.closest("section") as HTMLElement).getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, (start - r.top) / Math.max(1, start - end)));
    const n = Math.round(p * words.length);
    words.forEach((w, k) => w.classList.toggle("on", k < n));
  };
  if (reduce) words.forEach((w) => w.classList.add("on"));
  else { on(window, "scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true }); paint(); }

  /* altura do rodapé: no celular, a chamada final e o rodapé ocupam exatamente uma tela */
  const foot = $("footer");
  observe(new ResizeObserver(() => root.style.setProperty("--foot", foot.offsetHeight + "px"))).observe(foot);

  /* ---------- fios das integrações ---------- */
  const graph = $("#graph");
  const wires = $<SVGSVGElement>("#wires");
  const drawWires = () => {
    if (matchMedia("(max-width: 960px)").matches) { wires.innerHTML = ""; return; }
    const g = graph.getBoundingClientRect();
    const hub = (graph.querySelector(".hub-core") as HTMLElement).getBoundingClientRect();
    const hy = hub.top + hub.height / 2 - g.top;
    let out = "";
    graph.querySelectorAll(".node").forEach((n, i) => {
      const r = n.getBoundingClientRect();
      const left = r.left + r.width / 2 < hub.left;
      const x = (left ? r.right : r.left) - g.left;
      const y = r.top + r.height / 2 - g.top;
      const ex = left ? hub.left - g.left : hub.right - g.left;
      const mx = (x + ex) / 2;
      const d = `M${x},${y} C${mx},${y} ${mx},${hy} ${ex},${hy}`;
      out += `<path d="${d}"/><path class="pulse" d="${d}" style="animation-delay:${(i * 0.55).toFixed(2)}s"/>`;
    });
    wires.innerHTML = out;
  };
  observe(new ResizeObserver(drawWires)).observe(graph);
  // pulsos param fora da tela
  observe(new IntersectionObserver(([e]) => { wires.style.display = e.isIntersecting ? "" : "none"; })).observe(graph);

  /* ---------- menu: tom sobre seções escuras + gaveta no celular ---------- */
  const nav = $("#nav");
  const darkSections = $$(".dark");
  const tone = () => {
    const y = nav.getBoundingClientRect().bottom - 20;
    const overDark = darkSections.some((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
    nav.classList.toggle("is-light", !overDark);
  };
  on(window, "scroll", tone, { passive: true }); tone();

  const toggle = nav.querySelector(".nav-toggle") as HTMLButtonElement;
  const setOpen = (open: boolean) => {
    nav.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  on(toggle, "click", () => setOpen(nav.dataset.open !== "true"));
  nav.querySelectorAll(".nav-drawer a").forEach((a) => on(a, "click", () => setOpen(false)));
  on(window, "keydown", (e: KeyboardEvent) => { if (e.key === "Escape" && nav.dataset.open === "true") { setOpen(false); toggle.focus(); } });
  on(document, "click", (e: MouseEvent) => { if (!nav.contains(e.target as Node)) setOpen(false); });
  on(window, "resize", () => { if (innerWidth > 860) setOpen(false); });

  /* ---------- seta de rolagem: próxima parada, ou volta ao topo no fim ---------- */
  const scroller = $<HTMLButtonElement>("#scroller");
  const fade = $(".scroll-fade");
  const cue = $(".hero .cue");
  const stops = () => {
    const y = scrollY;
    const found: Array<[number, string]> = [];
    // celular e tablet: quando um pedaço do bloco terminaria sob a seta, o próximo clique mostra esse pedaço do topo
    const inner = (block: Element, from: number, sel: string, label: (el: Element) => string) => {
      let cur = from;
      block.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom + y > cur + innerHeight - 76) { cur = r.top + y - NAV_SPACE - 8; found.push([cur, label(el)]); } // 76: topo da seta
      });
    };
    $$(".lp-main > section").forEach((s) => {
      if (s.id === "rotina") {
        // computador: uma parada mostra o título com o capítulo 01 (topo da seção), depois cada capítulo centralizado;
        // celular: cada capítulo sob o menu
        s.querySelectorAll(".chapter").forEach((c, i) => {
          const r = c.getBoundingClientRect();
          const label = (c.querySelector("h3")?.textContent ?? "").replace(/\.$/, "");
          // o último capítulo para cedo o bastante para a seção seguinte não aparecer
          const centred = Math.min(r.top + y + r.height / 2 - innerHeight / 2, s.getBoundingClientRect().bottom + y - innerHeight);
          if (innerWidth > 960) found.push([i === 0 ? s.getBoundingClientRect().top + y : centred, label]);
          else { found.push([r.top + y - NAV_SPACE, label]); inner(c, r.top + y - NAV_SPACE, ".ch-chat", () => label); }
        });
      } else {
        // a chamada final vai até o fim da página, com o rodapé: é a última parada
        const top = s.classList.contains("final") ? document.documentElement.scrollHeight : s.getBoundingClientRect().top + y;
        // computador: se o bloco principal (cards dos planos, nota das integrações) terminaria sob a seta, desce um pouco mais
        const key = innerWidth > 960 ? ({ planos: ".lp-plans", integracoes: ".integra-note" } as Record<string, string>)[s.id] : undefined;
        const fit = key ? (s.querySelector(key) as HTMLElement).getBoundingClientRect().bottom + y - (innerHeight - 100) : -Infinity;
        found.push([Math.max(top, fit), LABELS[s.id || s.classList[0]] ?? "Próxima parte"]);
        const parts = ({
          planos: [".lp-plan", (el: Element) => `Plano ${el.querySelector("h3")?.textContent ?? ""}`],
          integracoes: [".graph", () => "As ferramentas"],
          duvidas: [".lp-faq-list details", () => "Mais perguntas"],
        } as Record<string, [string, (el: Element) => string]>)[s.id];
        if (innerWidth <= 960 && parts) inner(s, top, parts[0], parts[1]);
        // hero empilhado (celular, tablet): o celular de demonstração fica abaixo do texto e tem parada própria
        if (s.id === "topo" && innerWidth <= 960) {
          found.push([(s.querySelector(".phone") as HTMLElement).getBoundingClientRect().top + y - NAV_SPACE - 8, "Ver a conversa"]);
        }
      }
    });
    const max = document.documentElement.scrollHeight - innerHeight;
    return found.map(([v, label]) => ({ y: Math.round(Math.min(max, Math.max(0, v))), label }))
      .sort((a, b) => a.y - b.y)
      .filter((v, i, arr) => i === 0 || v.y - arr[i - 1].y > 160); // descarta paradas quase iguais
  };
  // parada a menos de um quinto de tela já está à vista: o clique vai para a seguinte
  const nextStop = () => stops().find((v) => v.y > scrollY + innerHeight * 0.2);
  const atEnd = () => scrollY >= document.documentElement.scrollHeight - innerHeight - 8;
  const syncScroller = () => {
    const end = atEnd();
    scroller.classList.toggle("is-top", end);
    const next = nextStop();
    const label = end ? "Voltar ao topo" : next ? next.label : "Próxima parte";
    scroller.setAttribute("aria-label", end ? label : `Ir para: ${label}`);
    if (scrollY > 40) scroller.classList.remove("nudge");
    // celular, primeira tela: a seta dentro do texto faz o papel; depois a seta flutuante assume
    const firstScreen = scrollY < innerHeight * 0.35;
    const away = innerWidth <= 520 && firstScreen;
    cue.classList.toggle("is-gone", !firstScreen);
    scroller.classList.toggle("is-away", away);
    scroller.tabIndex = away ? -1 : 0;
    const r = scroller.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const overDark = $$(".dark, footer").some((s) => { const b = s.getBoundingClientRect(); return b.top <= y && b.bottom >= y; });
    scroller.classList.toggle("is-light", !overDark);
    fade.classList.toggle("is-light", !overDark);
    fade.classList.toggle("is-away", away || end);
  };
  const goNext = () => {
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    if (atEnd()) { scrollTo({ top: 0, behavior }); return; }
    const next = nextStop();
    scrollTo({ top: next ? next.y : document.documentElement.scrollHeight, behavior });
  };
  on(scroller, "click", goNext);
  on(cue, "click", goNext);

  /* ---------- planos: a lista completa abre numa janela, e os cards não mudam de tamanho ---------- */
  const planDialog = $<HTMLDialogElement>("#plan-dialog");
  $$(".feats-more").forEach((b) => on(b, "click", () => {
    const plan = b.closest(".lp-plan") as HTMLElement;
    (planDialog.querySelector("h3") as HTMLElement).textContent = `Tudo o que o ${plan.querySelector("h3")?.textContent ?? ""} inclui`;
    const full = (plan.querySelector(".feats") as HTMLElement).cloneNode(true) as HTMLElement;
    full.querySelectorAll(".more").forEach((li) => li.classList.remove("more"));
    (planDialog.querySelector(".feats") as HTMLElement).replaceWith(full);
    planDialog.showModal();
  }));
  on(planDialog, "click", (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t === planDialog || t.closest(".dialog-close")) planDialog.close();
  });

  on(window, "scroll", syncScroller, { passive: true });
  on(window, "resize", syncScroller);
  syncScroller();

  return () => cleanups.forEach((c) => c());
}
