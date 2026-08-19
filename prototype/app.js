const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const originalSrc = 'assets/sala-fixture.svg';
const conceptSrc = 'assets/sala-transformada-fixture.svg';
const transcriptFixture = 'Quero uma sala mais aconchegante, mantendo o sofá, por até R$ 8 mil e com entrega em 15 dias.';
let mode = 'text';
let recorder;
let mediaStream;
let quotes = [];
let quoteExpiry;
let selectedImageSrc = originalSrc;
let generatedCompositeSrc;
let compositeJobId = 0;
const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageBytes = 12 * 1024 * 1024;

const catalog = [
  { sku: 'RUG-NAT-220', name: 'Tapete trama natural', supplier: 'Casa Norte', category: 'tapete', price: 1890, stock: 4, days: 7 },
  { sku: 'LMP-VER-041', name: 'Luminária arco verde', supplier: 'Lume Oficina', category: 'iluminação', price: 2240, stock: 2, days: 10 },
  { sku: 'MES-FRE-108', name: 'Mesa lateral freijó', supplier: 'Casa Norte', category: 'mesa lateral', price: 1490, stock: 6, days: 6 }
];

function id(prefix) {
  const value = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${value.toUpperCase()}`;
}
function show(node, visible = true) { node.hidden = !visible; }
function go(node) { show(node); node.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

async function buildLocalComposite(source) {
  const image = new Image();
  image.src = source;
  await image.decode();
  const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas indisponível neste navegador.');
  const width = canvas.width;
  const height = canvas.height;

  context.filter = 'saturate(.94) sepia(.05) brightness(1.03)';
  context.drawImage(image, 0, 0, width, height);
  context.filter = 'none';
  context.fillStyle = 'rgba(221,165,105,.07)';
  context.fillRect(0, 0, width, height);
  context.save();
  context.shadowColor = 'rgba(43,49,44,.24)';
  context.shadowBlur = width * .014;

  context.globalAlpha = .68;
  context.fillStyle = '#c6b68f';
  context.beginPath();
  context.ellipse(width * .50, height * .82, width * .24, height * .072, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = 'rgba(91,69,51,.26)';
  context.lineWidth = Math.max(1, width * .0025);
  for (let offset = -.18; offset <= .18; offset += .045) {
    context.beginPath();
    context.moveTo(width * (.50 + offset), height * .76);
    context.lineTo(width * (.50 + offset), height * .88);
    context.stroke();
  }

  context.globalAlpha = .86;
  context.fillStyle = '#795a43';
  context.beginPath();
  context.ellipse(width * .55, height * .76, width * .12, height * .036, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#4f382a';
  context.lineWidth = width * .009;
  context.beginPath();
  context.moveTo(width * .47, height * .78);
  context.lineTo(width * .45, height * .88);
  context.moveTo(width * .63, height * .78);
  context.lineTo(width * .65, height * .88);
  context.stroke();

  context.strokeStyle = '#355d48';
  context.lineWidth = width * .014;
  context.beginPath();
  context.moveTo(width * .82, height * .42);
  context.lineTo(width * .82, height * .82);
  context.stroke();
  context.fillStyle = '#46644e';
  context.beginPath();
  context.moveTo(width * .76, height * .43);
  context.lineTo(width * .88, height * .43);
  context.lineTo(width * .86, height * .29);
  context.lineTo(width * .78, height * .29);
  context.closePath();
  context.fill();
  context.beginPath();
  context.ellipse(width * .82, height * .83, width * .07, height * .035, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  const blob = await new Promise((resolve, reject) => canvas.toBlob(
    value => value ? resolve(value) : reject(new Error('Não foi possível montar a imagem.')),
    'image/jpeg',
    .9
  ));
  return URL.createObjectURL(blob);
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function setMode(next) {
  mode = next;
  $('#textTab').setAttribute('aria-selected', next === 'text');
  $('#audioTab').setAttribute('aria-selected', next === 'audio');
  show($('#textPanel'), next === 'text');
  show($('#audioPanel'), next === 'audio');
}
$('#textTab').addEventListener('click', () => setMode('text'));
$('#audioTab').addEventListener('click', () => setMode('audio'));

$('#photoButton').addEventListener('click', () => $('#photoInput').click());
$('#photoInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!supportedImageTypes.has(file.type)) {
    event.target.value = '';
    return fail('Use uma imagem JPEG, PNG ou WebP.');
  }
  if (file.size > maxImageBytes) {
    event.target.value = '';
    return fail('A imagem precisa ter no máximo 12 MB.');
  }

  const jobId = ++compositeJobId;
  if (selectedImageSrc.startsWith('blob:')) URL.revokeObjectURL(selectedImageSrc);
  if (generatedCompositeSrc) URL.revokeObjectURL(generatedCompositeSrc);
  selectedImageSrc = URL.createObjectURL(file);
  generatedCompositeSrc = undefined;
  $('#roomImage').src = selectedImageSrc;
  $('#roomImage').alt = 'Foto escolhida pelo usuário para a demonstração';
  $('#photoCaption').textContent = 'imagem enviada · ambiente original';
  $('#photoButton').textContent = 'Processando imagem…';
  $('#startButton').disabled = true;
  try {
    const compositeUrl = await buildLocalComposite(selectedImageSrc);
    if (jobId !== compositeJobId) {
      URL.revokeObjectURL(compositeUrl);
      return;
    }
    generatedCompositeSrc = compositeUrl;
    $('#photoButton').textContent = 'Trocar imagem';
  } catch {
    if (jobId !== compositeJobId) return;
    $('#photoButton').textContent = 'Tentar outra imagem';
    fail('Não conseguimos processar esta imagem. Use JPEG, PNG ou WebP.');
  } finally {
    if (jobId === compositeJobId) $('#startButton').disabled = false;
  }
});

$('#recordButton').addEventListener('click', async () => {
  if (recorder?.state === 'recording') {
    recorder.stop();
    return;
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(mediaStream);
    recorder.addEventListener('stop', () => {
      mediaStream.getTracks().forEach(track => track.stop());
      $('#recordButton').classList.remove('recording');
      $('#recordLabel').textContent = 'Gravar novamente';
      $('#transcript').value = transcriptFixture;
      $('#audioNote').textContent = 'Transcrição fixture pronta para correção. Na integração, este campo recebe gpt-transcribe.';
    });
    recorder.start();
    $('#recordButton').classList.add('recording');
    $('#recordLabel').textContent = 'Parar gravação';
    $('#audioNote').textContent = 'Gravando… toque novamente para concluir.';
  } catch {
    $('#audioNote').textContent = 'Microfone indisponível. Escreva ou edite a transcrição para continuar.';
    $('#transcript').focus();
  }
});

$('#intentForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = mode === 'audio' ? $('#transcript').value.trim() : $('#intent').value.trim();
  const budget = Number($('#budget').value);
  if (!text) return fail('Descreva a intenção por texto ou áudio antes de continuar.');
  if (budget < 1000) return fail('Informe um orçamento de pelo menos R$ 1.000 para esta demo.');
  $('#intentGoal').textContent = text;
  $('#intentConfirm').dataset.budget = budget;
  go($('#intentConfirm'));
});

$('#editIntentButton').addEventListener('click', () => go($('#capture')));
$('#confirmIntentButton').addEventListener('click', runFlow);

async function runFlow() {
  show($('#intentConfirm'), false);
  show($('#concept'), false);
  show($('#proposal'), false);
  show($('#approvalBar'), false);
  show($('#errorPanel'), false);
  show($('#progress'));
  go($('#progress'));
  await progress('03', 'Buscando produtos', 'Consultando dois fornecedores simulados via MCP', 650);
  createQuotes();
  await progress('03', 'Recebendo cotações', 'Normalizando preço, estoque, prazo e validade', 650);
  await progress('04', 'Criando ambiente', 'Aplicando referências dos SKUs cotados à foto', 850);
  renderConcept();
  show($('#progress'), false);
  go($('#concept'));
  show($('#approvalBar'));
}

async function progress(number, title, detail, wait) {
  $('#progressNumber').textContent = number;
  $('#progressTitle').textContent = title;
  $('#progressDetail').textContent = detail;
  await delay(wait);
}

function createQuotes() {
  const now = new Date();
  quoteExpiry = new Date(now.getTime() + 15 * 60 * 1000);
  quotes = catalog.map(item => ({ ...item, quoteId: id('QT'), quotedAt: now, validUntil: quoteExpiry }));
}

function renderConcept() {
  const total = quotes.reduce((sum, quote) => sum + quote.price, 0);
  const maxDays = Math.max(...quotes.map(quote => quote.days));
  const hasLocalComposite = Boolean(generatedCompositeSrc);
  $('#conceptImage').src = generatedCompositeSrc || conceptSrc;
  $('#conceptImage').alt = hasLocalComposite
    ? 'Montagem local sobre a foto enviada, com tapete, luminária e mesa lateral'
    : 'Sala transformada fixture com tapete natural, luminária verde e mesa lateral';
  $('#conceptSource').textContent = hasLocalComposite ? 'composição local · sem API' : 'GPT Image replay fixture';
  $('#conceptLabel').textContent = hasLocalComposite ? 'montagem sobre sua imagem' : 'criação visual fixture';
  $('#quoteRound').textContent = `rodada ${quotes[0].quoteId.slice(3)} · ${quotes[0].quotedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · fornecedores simulados`;
  $('#offerList').innerHTML = quotes.map((quote, index) => `
    <li class="offer" id="offer-${index}">
      <span class="offer-index">${index + 1}</span>
      <div><h3>${quote.name}</h3><p>${quote.supplier} · FORNECEDOR SIMULADO</p><small>${quote.sku} · ${quote.quoteId} · estoque ${quote.stock}</small></div>
      <div class="offer-price"><strong>${money.format(quote.price)}</strong><span>${quote.days} dias</span></div>
    </li>`).join('');
  $('#approvalTotal').textContent = money.format(total);
  $('#approvalMeta').textContent = `até ${maxDays} dias · válida 15 min`;
  $('#approveButton').disabled = false;
}

$$('.hotspot').forEach(button => button.addEventListener('click', () => {
  $$('.hotspot').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  $(`#offer-${button.dataset.offer}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
}));

const compare = $('#compareButton');
function showOriginal(active) {
  const conceptImage = $('#conceptImage');
  conceptImage.src = active ? selectedImageSrc : (generatedCompositeSrc || conceptSrc);
  conceptImage.alt = active
    ? (selectedImageSrc.startsWith('blob:') ? 'Foto original enviada pelo usuário' : 'Sala original fixture')
    : (generatedCompositeSrc ? 'Montagem local sobre a foto enviada, com tapete, luminária e mesa lateral' : 'Sala transformada fixture com tapete natural, luminária verde e mesa lateral');
  compare.textContent = active ? 'Solte para voltar à criação' : 'Segurar para ver original';
}
compare.addEventListener('pointerdown', () => showOriginal(true));
compare.addEventListener('pointerup', () => showOriginal(false));
compare.addEventListener('pointercancel', () => showOriginal(false));
compare.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') showOriginal(true); });
compare.addEventListener('keyup', () => showOriginal(false));

$('#refreshQuotesButton').addEventListener('click', () => {
  createQuotes();
  renderConcept();
  $('#quoteRound').textContent += ' · atualizada agora';
});

$('#approveButton').addEventListener('click', async () => {
  if (new Date() >= quoteExpiry) {
    $('#approveButton').disabled = true;
    return fail('As cotações expiraram. Atualize antes de aprovar.');
  }
  const total = quotes.reduce((sum, quote) => sum + quote.price, 0);
  const proposalId = id('PROP');
  const raw = `${proposalId}|${quotes.map(q => q.quoteId).join('|')}|${total}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hash = [...new Uint8Array(digest)].slice(0, 6).map(byte => byte.toString(16).padStart(2, '0')).join('');
  $('#proposalImage').src = generatedCompositeSrc || conceptSrc;
  $('#proposalImage').alt = generatedCompositeSrc ? 'Miniatura da montagem local aprovada' : 'Miniatura do conceito fixture aprovado';
  $('#proposalId').textContent = proposalId;
  $('#proposalTotal').textContent = money.format(total);
  $('#proposalValidity').textContent = quoteExpiry.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  $('#proposalHash').textContent = hash;
  show($('#approvalBar'), false);
  go($('#proposal'));
});

function fail(message) {
  $('#errorMessage').textContent = message;
  show($('#approvalBar'), false);
  go($('#errorPanel'));
}
$('#retryButton').addEventListener('click', () => { show($('#errorPanel'), false); go($('#capture')); });
$('#restartButton').addEventListener('click', () => {
  ['intentConfirm', 'progress', 'concept', 'proposal', 'errorPanel', 'approvalBar'].forEach(name => show($(`#${name}`), false));
  compositeJobId += 1;
  if (selectedImageSrc.startsWith('blob:')) URL.revokeObjectURL(selectedImageSrc);
  if (generatedCompositeSrc) URL.revokeObjectURL(generatedCompositeSrc);
  selectedImageSrc = originalSrc;
  generatedCompositeSrc = undefined;
  $('#photoInput').value = '';
  $('#startButton').disabled = false;
  $('#roomImage').src = originalSrc;
  $('#roomImage').alt = 'Sala clara com sofá, mesa, luminária e janela';
  $('#photoCaption').textContent = 'foto fixture · ambiente original';
  $('#photoButton').textContent = 'Usar câmera';
  setMode('text');
  go($('#capture'));
});

window.addEventListener('beforeunload', () => {
  compositeJobId += 1;
  if (selectedImageSrc.startsWith('blob:')) URL.revokeObjectURL(selectedImageSrc);
  if (generatedCompositeSrc) URL.revokeObjectURL(generatedCompositeSrc);
});