/* ===========================================================
   MATRIZ DE CADASTRO - KA-MÃO
   Guarda os clientes no localStorage do navegador/Acode.
   Cada cliente pode gerar um arquivo HTML pronto para colar
   no GitHub Pages (link de acompanhamento do pedido).
=========================================================== */

const STORAGE_KEY = "kamao_clientes";
const PIX_STORAGE_KEY = "kamao_pix_chave";

let clientes = carregarClientes();
let imagensAtuais = [];       // caminhos "galeria/nome.jpg" do cliente em edição
let editandoId = null;        // guarda o ID original quando estamos editando

// ---------- Elementos ----------
const form = document.getElementById("form-cliente");
const tituloForm = document.getElementById("titulo-form");
const inputId = document.getElementById("c-id");
const inputNome = document.getElementById("c-nome");
const inputContato = document.getElementById("c-contato");
const inputEndereco = document.getElementById("c-endereco");
const inputServico = document.getElementById("c-servico");
const selectGaleria = document.getElementById("c-galeria-select");
const btnAddImagem = document.getElementById("btn-add-imagem");
const previewImagens = document.getElementById("imagens-preview");
const inputValor = document.getElementById("c-valor");
const selectCondicoes = document.getElementById("c-condicoes");
const parcelasContainer = document.getElementById("parcelas-container");
const btnAddParcela = document.getElementById("btn-add-parcela");
const btnNovo = document.getElementById("btn-novo");
const listaClientesEl = document.getElementById("lista-clientes");
const saidaWrap = document.getElementById("saida-wrap");
const saidaHtml = document.getElementById("saida-html");
const nomeArquivoSaida = document.getElementById("nome-arquivo-saida");
const linkPronto = document.getElementById("link-pronto");
const btnCopiar = document.getElementById("btn-copiar");
const toast = document.getElementById("toast");
const inputPix = document.getElementById("c-pix");
const btnSalvarPix = document.getElementById("btn-salvar-pix");

// ---------- Utilidades ----------
function carregarClientes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function salvarClientes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

function slugify(txt) {
  return txt
    .toString()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mostrarToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function formatarMoeda(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarDataBR(isoDate) {
  if (!isoDate) return "";
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano.slice(2)}`;
}

// ---------- Máscara de moeda (R$ 0,00) ----------
function valorParaTextoMoeda(num) {
  return "R$ " + formatarMoeda(num);
}

function textoMoedaParaValor(texto) {
  if (!texto) return 0;
  const limpo = texto.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(limpo) || 0;
}

function aplicarMascaraMoeda(inputEl) {
  inputEl.addEventListener("input", () => {
    let digitos = inputEl.value.replace(/\D/g, "");
    if (!digitos) digitos = "0";
    const numero = parseInt(digitos, 10) / 100;
    inputEl.value = valorParaTextoMoeda(numero);
  });
}

aplicarMascaraMoeda(inputValor);

// ---------- Parcelas dinâmicas ----------
function criarLinhaParcela(valor = "", data = "", status = "pago") {
  const row = document.createElement("div");
  row.className = "parcela-row";
  row.innerHTML = `
    <div class="parcela-linha-a">
      <input type="text" inputmode="decimal" placeholder="R$ 0,00" class="parcela-valor" value="${valor ? valorParaTextoMoeda(valor) : ""}">
      <button type="button" class="rm-parcela" title="Remover">✕</button>
    </div>
    <label class="mini-label">Data</label>
    <input type="date" class="parcela-data" value="${data}">
    <label class="mini-label">Status</label>
    <select class="parcela-status">
      <option value="pago" ${status === "pago" ? "selected" : ""}>Pago</option>
      <option value="aguardando" ${status === "aguardando" ? "selected" : ""}>Aguardando</option>
    </select>
  `;
  row.querySelector(".rm-parcela").addEventListener("click", () => row.remove());
  aplicarMascaraMoeda(row.querySelector(".parcela-valor"));
  parcelasContainer.appendChild(row);
}

btnAddParcela.addEventListener("click", () => criarLinhaParcela());

function lerParcelas() {
  const linhas = parcelasContainer.querySelectorAll(".parcela-row");
  const parcelas = [];
  linhas.forEach((linha) => {
    const valor = textoMoedaParaValor(linha.querySelector(".parcela-valor").value);
    const data = linha.querySelector(".parcela-data").value;
    const status = linha.querySelector(".parcela-status").value;
    if (valor) parcelas.push({ valor, data, status });
  });
  return parcelas;
}

// ---------- Galeria de imagens ----------
function popularSelectGaleria() {
  selectGaleria.innerHTML = "";
  const lista = typeof GALERIA_IMAGENS !== "undefined" ? GALERIA_IMAGENS : [];
  if (lista.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "Nenhuma imagem em galeria.js";
    selectGaleria.appendChild(opt);
    return;
  }
  lista.forEach((nome) => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    selectGaleria.appendChild(opt);
  });
}

btnAddImagem.addEventListener("click", () => {
  const nome = selectGaleria.value;
  if (!nome) return;
  const caminho = "galeria/" + nome;
  if (imagensAtuais.includes(caminho)) {
    mostrarToast("Essa imagem já foi adicionada");
    return;
  }
  imagensAtuais.push(caminho);
  renderPreviewImagens();
});

function renderPreviewImagens() {
  previewImagens.innerHTML = "";
  imagensAtuais.forEach((caminho, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "del-img";
    wrap.innerHTML = `<img src="${caminho}"><button type="button">✕</button>`;
    wrap.querySelector("button").addEventListener("click", () => {
      imagensAtuais.splice(idx, 1);
      renderPreviewImagens();
    });
    previewImagens.appendChild(wrap);
  });
}

// ---------- Chave Pix ----------
inputPix.value = localStorage.getItem(PIX_STORAGE_KEY) || "";
btnSalvarPix.addEventListener("click", () => {
  localStorage.setItem(PIX_STORAGE_KEY, inputPix.value.trim());
  mostrarToast("Chave Pix salva!");
});

// ---------- Salvar / Editar cliente ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = slugify(inputId.value);
  if (!id) {
    mostrarToast("Preencha o ID do cliente");
    return;
  }

  const cliente = {
    id,
    nome: inputNome.value.trim(),
    contato: inputContato.value.trim(),
    endereco: inputEndereco.value.trim(),
    servico: inputServico.value.trim(),
    imagens: imagensAtuais,
    valor: textoMoedaParaValor(inputValor.value),
    condicoes: selectCondicoes.value,
    parcelas: lerParcelas(),
  };

  // Se estava editando um ID diferente do novo ID digitado, remove o antigo
  if (editandoId && editandoId !== id) {
    clientes = clientes.filter((c) => c.id !== editandoId);
  }

  const indexExistente = clientes.findIndex((c) => c.id === id);
  if (indexExistente >= 0) {
    clientes[indexExistente] = cliente;
  } else {
    clientes.push(cliente);
  }

  salvarClientes();
  renderListaClientes();
  mostrarToast("Cliente salvo!");
  limparForm();
});

btnNovo.addEventListener("click", limparForm);

function limparForm() {
  form.reset();
  imagensAtuais = [];
  editandoId = null;
  renderPreviewImagens();
  parcelasContainer.innerHTML = "";
  criarLinhaParcela();
  tituloForm.textContent = "Novo Cliente";
  inputId.removeAttribute("readonly");
  saidaWrap.classList.remove("ativo");
}

function carregarClienteNoForm(cliente) {
  editandoId = cliente.id;
  inputId.value = cliente.id;
  inputNome.value = cliente.nome;
  inputContato.value = cliente.contato;
  inputEndereco.value = cliente.endereco;
  inputServico.value = cliente.servico;
  inputValor.value = valorParaTextoMoeda(cliente.valor);
  selectCondicoes.value = cliente.condicoes;

  imagensAtuais = [...(cliente.imagens || [])];
  renderPreviewImagens();

  parcelasContainer.innerHTML = "";
  if (cliente.parcelas && cliente.parcelas.length) {
    cliente.parcelas.forEach((p) => criarLinhaParcela(p.valor, p.data, p.status));
  } else {
    criarLinhaParcela();
  }

  tituloForm.textContent = "Editando: " + cliente.nome;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- Lista de clientes ----------
function renderListaClientes() {
  listaClientesEl.innerHTML = "";
  if (clientes.length === 0) {
    listaClientesEl.innerHTML = '<p class="empty-msg">Nenhum cliente cadastrado ainda.</p>';
    return;
  }

  clientes.forEach((cliente) => {
    const item = document.createElement("div");
    item.className = "cliente-item";
    item.innerHTML = `
      <div class="info">
        <strong>${cliente.nome || "(sem nome)"}</strong>
        <span>ID: ${cliente.id}</span>
      </div>
      <div class="botoes">
        <button class="btn-gerar">Gerar</button>
        <button class="btn-editar">Editar</button>
        <button class="btn-excluir">Excluir</button>
      </div>
    `;
    item.querySelector(".btn-editar").addEventListener("click", () => carregarClienteNoForm(cliente));
    item.querySelector(".btn-excluir").addEventListener("click", () => excluirCliente(cliente.id));
    item.querySelector(".btn-gerar").addEventListener("click", () => gerarPagina(cliente));
    listaClientesEl.appendChild(item);
  });
}

function excluirCliente(id) {
  if (!confirm("Excluir este cliente?")) return;
  clientes = clientes.filter((c) => c.id !== id);
  salvarClientes();
  renderListaClientes();
  mostrarToast("Cliente excluído");
}

// ---------- Geração da página do cliente ----------
function gerarPagina(cliente) {
  const html = montarHtmlCliente(cliente);
  saidaHtml.value = html;
  nomeArquivoSaida.textContent = `${cliente.id}.html`;
  linkPronto.textContent = `Depois de subir no GitHub Pages (junto com a pasta "galeria"), o link do cliente será algo como: https://SEU-USUARIO.github.io/SEU-REPOSITORIO/${cliente.id}.html`;
  saidaWrap.classList.add("ativo");
  saidaWrap.scrollIntoView({ behavior: "smooth" });
}

btnCopiar.addEventListener("click", () => {
  saidaHtml.select();
  document.execCommand("copy");
  mostrarToast("Código copiado!");
});

function montarHtmlCliente(cliente) {
  const chavePix = localStorage.getItem(PIX_STORAGE_KEY) || "";

  const badgeCondicao =
    cliente.condicoes === "Pago à vista"
      ? `<span class="badge badge-verde">PAGO À VISTA</span>`
      : `<span class="badge badge-laranja">PARCELADO</span>`;

  const imagensHtml = (cliente.imagens || [])
    .map((src) => `<img src="${src}" alt="Foto do serviço">`)
    .join("");

  let parcelasHtml = "";
  (cliente.parcelas || []).forEach((p, idx) => {
    const pago = p.status === "pago";
    parcelasHtml += `
      <div class="parcela">
        <span class="ponto ${pago ? "ponto-verde" : "ponto-amarelo"}"></span>
        <div class="parcela-texto">
          <div class="parcela-linha1">
            <span class="parcela-valor-txt">${idx + 1}ª Parcela - R$ ${formatarMoeda(p.valor)}</span>
          </div>
          <div class="parcela-data">
            <span class="${pago ? "status-pago" : "status-aguardando"}">${pago ? "● Paga" : "● Aguardando"}</span>
            &nbsp;·&nbsp;${pago ? "Pago em " + formatarDataBR(p.data) : "Vence em " + formatarDataBR(p.data)}
          </div>
        </div>
      </div>`;
  });

  const pixHtml = chavePix
    ? `
  <div class="card verde">
    <h2>Pagamento via Pix</h2>
    <p class="pix-chave" id="pixChave">${chavePix}</p>
    <button type="button" class="btn-copiar-pix" onclick="copiarPix()">Copiar chave Pix</button>
  </div>`
    : "";

  const scriptPix = chavePix
    ? `
<script>
function copiarPix(){
  var chave = document.getElementById('pixChave').textContent;
  function avisar(){ alert('Chave Pix copiada!'); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(chave).then(avisar).catch(copiarFallback);
  } else {
    copiarFallback();
  }
  function copiarFallback(){
    var ta = document.createElement('textarea');
    ta.value = chave;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    avisar();
  }
}
</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Acompanhamento de Pedido - KA-MÃO</title>
<style>
  *{box-sizing:border-box;}
  body{
    margin:0;
    background:#121212;
    color:#f2f2f2;
    font-family:-apple-system,Roboto,"Segoe UI",Arial,sans-serif;
    padding-bottom:40px;
  }
  header{
    text-align:center;
    padding:36px 20px 20px;
    border-bottom:1px solid #2a2a2a;
  }
  header h1{
    color:#ff7a29;
    font-size:2.4rem;
    letter-spacing:3px;
    margin:0 0 10px;
    font-weight:800;
  }
  header p{
    margin:0;
    font-size:1.1rem;
  }
  main{
    max-width:520px;
    margin:0 auto;
    padding:20px 16px;
  }
  .card{
    background:#1c1c1c;
    border:1px solid #2a2a2a;
    border-radius:14px;
    padding:22px;
    margin-bottom:22px;
    border-left:4px solid #ff7a29;
  }
  .card.amarelo{border-left-color:#ffc93c;}
  .card.verde{border-left-color:#2ecc71;}
  .card h2{
    font-size:0.95rem;
    letter-spacing:1px;
    text-transform:uppercase;
    color:#9a9a9a;
    margin:0 0 16px;
  }
  .card-top{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:10px;
    flex-wrap:wrap;
  }
  .servico-nome{
    font-size:1.3rem;
    font-weight:700;
    margin:0 0 6px;
  }
  .badge{
    padding:8px 14px;
    border-radius:20px;
    font-size:0.8rem;
    font-weight:700;
    white-space:nowrap;
  }
  .badge-verde{background:#123a24;color:#2ecc71;}
  .badge-laranja{background:#3a2812;color:#ff7a29;}
  .imagens{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    margin-top:14px;
  }
  .imagens img{
    width:90px;height:90px;object-fit:cover;
    border-radius:10px;border:1px solid #2a2a2a;
  }
  .info-linha{margin:6px 0;color:#d8d8d8;}
  .info-linha b{color:#f2f2f2;}
  .valor-total{
    font-size:1.05rem;
    margin-bottom:16px;
  }
  .parcela{
    display:flex;
    gap:12px;
    margin-bottom:18px;
    position:relative;
  }
  .parcela:last-child{margin-bottom:0;}
  .ponto{
    width:14px;height:14px;border-radius:50%;
    margin-top:4px;flex:0 0 auto;
  }
  .ponto-verde{background:#2ecc71;}
  .ponto-amarelo{background:#ffc93c;}
  .parcela-texto{flex:1;min-width:0;}
  .parcela-linha1{
    font-size:1.05rem;
    font-weight:600;
  }
  .parcela-valor-txt{white-space:nowrap;}
  .status-pago{color:#2ecc71;font-weight:700;}
  .status-aguardando{color:#ffc93c;font-weight:700;}
  .parcela-data{color:#9a9a9a;font-size:0.85rem;margin-top:4px;}
  .pix-chave{
    word-break:break-all;
    background:#0f0f0f;
    border:1px solid #2a2a2a;
    border-radius:8px;
    padding:12px;
    font-size:0.95rem;
    margin:0 0 14px;
  }
  .btn-copiar-pix{
    width:100%;
    border:none;
    border-radius:10px;
    padding:12px;
    background:#2ecc71;
    color:#0a2f19;
    font-weight:700;
    font-size:0.95rem;
    cursor:pointer;
  }
</style>
</head>
<body>

<header>
  <h1>KA-MÃO</h1>
  <p>Olá, <b>${cliente.nome}</b> 👋</p>
</header>

<main>

  <div class="card">
    <h2>Serviço / Produto</h2>
    <div class="card-top">
      <div>
        <p class="servico-nome">${cliente.servico}</p>
      </div>
      ${badgeCondicao}
    </div>
    ${cliente.endereco ? `<p class="info-linha"><b>Endereço:</b> ${cliente.endereco}</p>` : ""}
    ${cliente.contato ? `<p class="info-linha"><b>Contato:</b> ${cliente.contato}</p>` : ""}
    ${imagensHtml ? `<div class="imagens">${imagensHtml}</div>` : ""}
  </div>

  <div class="card amarelo">
    <h2>Pagamento</h2>
    <p class="valor-total">Valor Total: <b>R$ ${formatarMoeda(cliente.valor)}</b></p>
    ${parcelasHtml || "<p>Nenhuma parcela registrada.</p>"}
  </div>
${pixHtml}
</main>
${scriptPix}
</body>
</html>`;
}

// ---------- Inicialização ----------
popularSelectGaleria();
criarLinhaParcela();
renderListaClientes();
             
