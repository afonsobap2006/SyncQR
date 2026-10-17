// ==========================================================================
// SyncQR - Lógica Avançada da Sala
// ==========================================================================

// Elementos Principais da Sala
const codigoSala = document.getElementById('codigoSala');
const numPessoasLigadas = document.getElementById('numPessoasLigadas');
const estadoLigacao = document.getElementById('estadoLigacao');
const btnSairSala = document.getElementById('btnSairSala');
const btnAbrirDefinicoes = document.getElementById('btnAbrirDefinicoes');

// Elementos de Leitura e Smart Actions
const tituloResultadoLeitura = document.getElementById('tituloResultadoLeitura');
const badgeTipoConteudo = document.getElementById('badgeTipoConteudo');
const blocoResultadoLink = document.getElementById('blocoResultadoLink');
const blocoResultadoWifi = document.getElementById('blocoResultadoWifi');
const blocoResultadoTexto = document.getElementById('blocoResultadoTexto');
const blocoResultadoContacto = document.getElementById('blocoResultadoContacto');
const contactoNomeValor = document.getElementById('contactoNomeValor');
const wrapContactoTel = document.getElementById('wrapContactoTel');
const contactoTelValor = document.getElementById('contactoTelValor');
const wrapContactoEmail = document.getElementById('wrapContactoEmail');
const contactoEmailValor = document.getElementById('contactoEmailValor');

function descarregarVcard(vcardRaw, nome = 'contacto') {
  try {
    const blob = new Blob([vcardRaw], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nomeFicheiro = ((nome || 'contacto').replace(/[^a-zA-Z0-9_\-]/g, '_')) + '.vcf';
    a.download = nomeFicheiro;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.error('Erro ao descarregar vCard:', e);
  }
}

const inputLinkLido = document.getElementById('inputLinkLido');
const wifiSsidValor = document.getElementById('wifiSsidValor');
const wifiSegurancaValor = document.getElementById('wifiSegurancaValor');
const wifiSenhaValor = document.getElementById('wifiSenhaValor');
const btnToggleVisivelSenhaWifi = document.getElementById('btnToggleVisivelSenhaWifi');
const textoLidoArea = document.getElementById('textoLidoArea');

const btnAcaoPrincipal = document.getElementById('btnAcaoPrincipal');
const iconeAcaoPrincipal = document.getElementById('iconeAcaoPrincipal');
const txtAcaoPrincipal = document.getElementById('txtAcaoPrincipal');
const btnAcaoSecundaria = document.getElementById('btnAcaoSecundaria');
const iconeAcaoSecundaria = document.getElementById('iconeAcaoSecundaria');
const txtAcaoSecundaria = document.getElementById('txtAcaoSecundaria');
const chkAutoAbrir = document.getElementById('chkAutoAbrir');
const chkAutoAbrirWrapper = document.getElementById('chkAutoAbrirWrapper');

// Elementos do Histórico da Sessão
const listaHistoricoSessao = document.getElementById('listaHistoricoSessao');
const badgeContadorHistorico = document.getElementById('badgeContadorHistorico');
const btnLimparHistorico = document.getElementById('btnLimparHistorico');
const historicoVazioAviso = document.getElementById('historicoVazioAviso');

// Elementos da Câmara, Ecrã Inteiro e Zoom
const video = document.getElementById('video');
const videoContainer = document.getElementById('videoContainer');
const btnCamera = document.getElementById('btnCamera');
const txtBtnCamera = document.getElementById('txtBtnCamera');
const btnEcraInteiroZoom = document.getElementById('btnEcraInteiroZoom');
const btnFecharEcraInteiro = document.getElementById('btnFecharEcraInteiro');
const painelControlosZoom = document.getElementById('painelControlosZoom');
const sliderZoom = document.getElementById('sliderZoom');
const btnZoomMenos = document.getElementById('btnZoomMenos');
const btnZoomMais = document.getElementById('btnZoomMais');
const badgeZoomNivel = document.getElementById('badgeZoomNivel');
const flashVisualFeedback = document.getElementById('flashVisualFeedback');

// Elementos da Modal de Definições
const modalDefinicoesOverlay = document.getElementById('modalDefinicoesOverlay');
const btnFecharModalTopo = document.getElementById('btnFecharModalTopo');
const btnConcluirModal = document.getElementById('btnConcluirModal');
const tabButtons = document.querySelectorAll('.modal-sidebar .tab-btn');
const tabPaineis = document.querySelectorAll('.modal-content-panel .tab-painel');

const prefAutoAbrirLinks = document.getElementById('prefAutoAbrirLinks');
const prefAutoCopiarLeitura = document.getElementById('prefAutoCopiarLeitura');
const prefSomBeep = document.getElementById('prefSomBeep');
const prefVibracao = document.getElementById('prefVibracao');
const prefFlashVisual = document.getElementById('prefFlashVisual');

const iconeStatusSenhaBox = document.getElementById('iconeStatusSenhaBox');
const txtTituloStatusSenha = document.getElementById('txtTituloStatusSenha');
const txtDescricaoStatusSenha = document.getElementById('txtDescricaoStatusSenha');
const inputNovaSenhaSala = document.getElementById('inputNovaSenhaSala');
const btnToggleVisivelNovaSenha = document.getElementById('btnToggleVisivelNovaSenha');
const btnGuardarSenhaSala = document.getElementById('btnGuardarSenhaSala');
const btnRemoverSenhaSala = document.getElementById('btnRemoverSenhaSala');
const msgFeedbackSenha = document.getElementById('msgFeedbackSenha');

// Elementos de Bloqueio por Senha
const modalBloqueioSenha = document.getElementById('modalBloqueioSenha');
const inputSenhaDesbloqueio = document.getElementById('inputSenhaDesbloqueio');
const btnToggleVisivelSenhaDesbloqueio = document.getElementById('btnToggleVisivelSenhaDesbloqueio');
const btnDesbloquearSala = document.getElementById('btnDesbloquearSala');
const msgErroDesbloqueio = document.getElementById('msgErroDesbloqueio');

// Visibilidade de Rede
const chkVisivelRedeSala = document.getElementById('chkVisivelRedeSala');
const txtStatusVisibilidade = document.getElementById('txtStatusVisibilidade');

// ==========================================================================
// Estado e Variáveis Globais
// ==========================================================================
let streamCamera = null;
let scanInterval = null;
let trackVideo = null;
let zoomAtual = 1.0;
let maxZoomHardware = 1.0;
let temZoomHardware = false;

let ultimoDadosLidos = null;
const historicoSessao = [];
const historicoSessaoCodigos = [];

// Chaves de Armazenamento Local
const codSalaAtual = codigoSala ? codigoSala.innerText.trim().toUpperCase() : '';
const STORAGE_PREFS_KEY = 'syncqr_prefs_v1';
const STORAGE_AUTH_KEY = 'syncqr_auth_' + codSalaAtual;

// ==========================================================================
// 1. Preferências (localStorage)
// ==========================================================================
function carregarPreferencias() {
  try {
    const salvas = JSON.parse(localStorage.getItem(STORAGE_PREFS_KEY) || '{}');
    if (prefAutoAbrirLinks) prefAutoAbrirLinks.checked = !!salvas.autoAbrirLinks;
    if (chkAutoAbrir) chkAutoAbrir.checked = !!salvas.autoAbrirLinks;
    if (prefAutoCopiarLeitura) prefAutoCopiarLeitura.checked = !!salvas.autoCopiar;
    if (prefSomBeep) prefSomBeep.checked = salvas.somBeep !== false;
    if (prefVibracao) prefVibracao.checked = salvas.vibracao !== false;
    if (prefFlashVisual) prefFlashVisual.checked = salvas.flashVisual !== false;
  } catch (e) {
    console.error('Erro ao ler preferências:', e);
  }
}

function guardarPreferencias() {
  try {
    const prefs = {
      autoAbrirLinks: prefAutoAbrirLinks ? prefAutoAbrirLinks.checked : false,
      autoCopiar: prefAutoCopiarLeitura ? prefAutoCopiarLeitura.checked : false,
      somBeep: prefSomBeep ? prefSomBeep.checked : true,
      vibracao: prefVibracao ? prefVibracao.checked : true,
      flashVisual: prefFlashVisual ? prefFlashVisual.checked : true
    };
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
    if (chkAutoAbrir && prefAutoAbrirLinks) {
      chkAutoAbrir.checked = prefAutoAbrirLinks.checked;
    }
  } catch (e) {
    console.error('Erro ao salvar preferências:', e);
  }
}

carregarPreferencias();

if (chkAutoAbrir && prefAutoAbrirLinks) {
  chkAutoAbrir.addEventListener('change', () => {
    prefAutoAbrirLinks.checked = chkAutoAbrir.checked;
    guardarPreferencias();
  });
}

// ==========================================================================
// 2. Feedback Multissensorial (Beep, Vibração, Flash)
// ==========================================================================
let audioCtx = null;
function tocarBeepSucesso() {
  if (prefSomBeep && !prefSomBeep.checked) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Nota Lá (A5)
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    // Web Audio não suportado ou bloqueado por política de autoplay
  }
}

function dispararVibracao() {
  if (prefVibracao && !prefVibracao.checked) return;
  if (navigator.vibrate) {
    navigator.vibrate(120);
  }
}

function dispararFlashVisual() {
  if (prefFlashVisual && !prefFlashVisual.checked) return;
  if (!flashVisualFeedback) return;
  flashVisualFeedback.classList.add('piscar');
  setTimeout(() => {
    flashVisualFeedback.classList.remove('piscar');
  }, 220);
}

function emitirFeedbackLeituraCompleta() {
  tocarBeepSucesso();
  dispararVibracao();
  dispararFlashVisual();
}

// ==========================================================================
// 3. Socket.io e Gestão de Sala Protegida
// ==========================================================================
const socket = io();

function tentarLigarSocket() {
  const senhaArmazenada = sessionStorage.getItem(STORAGE_AUTH_KEY) || '';
  socket.emit('entrar-sala', {
    codigoSala: codSalaAtual,
    senha: senhaArmazenada
  });
}

socket.on('connect', () => {
  tentarLigarSocket();
});

socket.on('autenticado-sucesso', (dados) => {
  if (estadoLigacao) estadoLigacao.innerHTML = '<span class="dot-status">●</span> Ligado';
  if (modalBloqueioSenha) modalBloqueioSenha.style.display = 'none';
  sessionStorage.setItem(STORAGE_AUTH_KEY, 'autorizado');
  atualizarUiEstadoSenhaSala(dados && dados.temSenha);
});

socket.on('erro-autenticacao-sala', (msg) => {
  if (estadoLigacao) estadoLigacao.innerHTML = '<span style="color: #eab308;">●</span> Protegido por Palavra-Passe';
  if (modalBloqueioSenha) {
    modalBloqueioSenha.style.display = 'flex';
    if (msgErroDesbloqueio) msgErroDesbloqueio.innerText = msg || 'Palavra-passe necessária';
  }
});

socket.on('atualizar-contagem', (totalPessoas) => {
  if (numPessoasLigadas) {
    numPessoasLigadas.innerText = `👥 ${totalPessoas} ligado${totalPessoas === 1 ? '' : 's'}`;
  }
});

socket.on('disconnect', () => {
  if (estadoLigacao) estadoLigacao.innerHTML = '<span style="color: #ef4444;">●</span> Desligado';
});

socket.on('sala-senha-atualizada', (info) => {
  atualizarUiEstadoSenhaSala(info.temSenha);
});

// Receber link ou conteúdo lido em tempo real
socket.on('receber-link', (info) => {
  processarConteudoRecebido(info.link, info.hora);
});

// Desbloquear sala via modal
if (btnDesbloquearSala && inputSenhaDesbloqueio) {
  btnDesbloquearSala.addEventListener('click', () => {
    submeterDesbloqueioSala();
  });

  inputSenhaDesbloqueio.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submeterDesbloqueioSala();
  });
}

function submeterDesbloqueioSala() {
  const senha = (inputSenhaDesbloqueio.value || '').trim();
  if (!senha) {
    if (msgErroDesbloqueio) msgErroDesbloqueio.innerText = 'Digita a palavra-passe da sala.';
    return;
  }
  if (msgErroDesbloqueio) msgErroDesbloqueio.innerText = 'A validar...';
  sessionStorage.setItem(STORAGE_AUTH_KEY, senha);
  socket.emit('entrar-sala', {
    codigoSala: codSalaAtual,
    senha: senha
  });
}

if (btnToggleVisivelSenhaDesbloqueio && inputSenhaDesbloqueio) {
  btnToggleVisivelSenhaDesbloqueio.addEventListener('click', () => {
    const ePassword = inputSenhaDesbloqueio.type === 'password';
    inputSenhaDesbloqueio.type = ePassword ? 'text' : 'password';
    btnToggleVisivelSenhaDesbloqueio.querySelector('.material-symbols-outlined').textContent = ePassword ? 'visibility_off' : 'visibility';
  });
}

// ==========================================================================
// 4. Smart Actions (Parser de Tipos de QR Code)
// ==========================================================================
function analisarTipoQRCode(raw) {
  const texto = (raw || '').trim();
  if (!texto) return { tipo: 'vazio', raw: '' };

  // 0. Contacto vCard ou MeCard
  if (/BEGIN:VCARD/i.test(texto) || /^MECARD:/i.test(texto)) {
    let nome = 'Contacto';
    let tel = '';
    let email = '';
    
    const fnMatch = texto.match(/FN:(.+?)(?:\r?\n|$)/i);
    const nMatch = texto.match(/N:(.+?)(?:\r?\n|$)/i);
    if (fnMatch) {
      nome = fnMatch[1].trim();
    } else if (nMatch) {
      nome = nMatch[1].split(';').filter(Boolean).reverse().join(' ').trim();
    }
    
    const mecardN = texto.match(/N:([^;]+);/i);
    if (!fnMatch && !nMatch && mecardN) {
      nome = mecardN[1].replace(',', ' ').trim();
    }

    const telMatch = texto.match(/TEL(?:;[^:]*)?:(.+?)(?:\r?\n|$|;)/i);
    if (telMatch) tel = telMatch[1].trim();

    const emailMatch = texto.match(/EMAIL(?:;[^:]*)?:(.+?)(?:\r?\n|$|;)/i);
    if (emailMatch) email = emailMatch[1].trim();

    return {
      tipo: 'vcard',
      nome: nome || 'Contacto',
      tel: tel,
      email: email,
      raw: texto
    };
  }

  // 1. Rede Wi-Fi (WIFI:S:Rede;T:WPA;P:Senha;;)
  if (/^WIFI:/i.test(texto)) {
    const ssidMatch = texto.match(/S:([^;]+)/i);
    const senhaMatch = texto.match(/P:([^;]+)/i);
    const tipoMatch = texto.match(/T:([^;]+)/i);
    return {
      tipo: 'wifi',
      ssid: ssidMatch ? ssidMatch[1] : 'Desconhecida',
      senha: senhaMatch ? senhaMatch[1] : '',
      seguranca: tipoMatch ? tipoMatch[1] : 'WPA/WPA2',
      raw: texto
    };
  }

  // 2. Link / URL
  if (/^https?:\/\//i.test(texto) || /^www\./i.test(texto) || /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(texto)) {
    let urlFormatada = texto;
    if (!/^https?:\/\//i.test(urlFormatada)) {
      urlFormatada = 'https://' + urlFormatada;
    }
    return {
      tipo: 'link',
      url: urlFormatada,
      raw: texto
    };
  }

  // 3. Email
  if (/^mailto:/i.test(texto)) {
    return {
      tipo: 'email',
      email: texto.replace(/^mailto:/i, '').split('?')[0],
      raw: texto
    };
  }

  // 4. Telefone
  if (/^tel:/i.test(texto)) {
    return {
      tipo: 'tel',
      tel: texto.replace(/^tel:/i, ''),
      raw: texto
    };
  }

  // 5. Texto Puro / Notas
  return {
    tipo: 'texto',
    texto: texto,
    raw: texto
  };
}

let ultimaAberturaTimestamp = 0;
function abrirNovoSeparador(url) {
  const agora = Date.now();
  if (agora - ultimaAberturaTimestamp < 400) return; // Debounce de 400ms
  ultimaAberturaTimestamp = agora;
  if (url) {
    window.open(url, '_blank');
  }
}

async function copiarParaClipboard(texto, btnElement, feedbackTexto = 'Copiado!') {
  try {
    await navigator.clipboard.writeText(texto);
    if (btnElement) {
      const originalHtml = btnElement.innerHTML;
      btnElement.innerText = feedbackTexto;
      setTimeout(() => {
        btnElement.innerHTML = originalHtml;
      }, 1800);
    }
  } catch (e) {
    console.error('Falha ao copiar:', e);
  }
}

function processarConteudoRecebido(rawConteudo, horaLeitura) {
  const dados = analisarTipoQRCode(rawConteudo);
  ultimoDadosLidos = dados;

  const horaFormatada = horaLeitura || new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Renderiza Cartão Dinâmico
  if (blocoResultadoLink) blocoResultadoLink.style.display = 'none';
  if (blocoResultadoWifi) blocoResultadoWifi.style.display = 'none';
  if (blocoResultadoTexto) blocoResultadoTexto.style.display = 'none';
  if (btnAcaoSecundaria) btnAcaoSecundaria.style.display = 'inline-flex';
  if (chkAutoAbrirWrapper) chkAutoAbrirWrapper.style.display = 'none';

  if (dados.tipo === 'vcard') {
    badgeTexto = '👤 Contacto';
    conteudoTexto = `Contacto: ${dados.nome}`;
  } else if (dados.tipo === 'wifi') {
    if (tituloResultadoLeitura) tituloResultadoLeitura.innerText = 'Rede Wi-Fi Detetada';
    if (badgeTipoConteudo) {
      badgeTipoConteudo.innerText = '📶 Wi-Fi';
      badgeTipoConteudo.style.color = '#34d399';
    }
    if (blocoResultadoWifi) {
      blocoResultadoWifi.style.display = 'block';
      if (wifiSsidValor) wifiSsidValor.innerText = dados.ssid;
      if (wifiSegurancaValor) wifiSegurancaValor.innerText = dados.seguranca;
      if (wifiSenhaValor) wifiSenhaValor.value = dados.senha;
    }
    if (txtAcaoPrincipal) txtAcaoPrincipal.innerText = 'Copiar Senha';
    if (iconeAcaoPrincipal) iconeAcaoPrincipal.textContent = 'key';
    if (txtAcaoSecundaria) txtAcaoSecundaria.innerText = 'Copiar Detalhes';
    if (iconeAcaoSecundaria) iconeAcaoSecundaria.textContent = 'content_copy';
  } else if (dados.tipo === 'link') {
    if (tituloResultadoLeitura) tituloResultadoLeitura.innerText = 'Link Lido';
    if (badgeTipoConteudo) {
      badgeTipoConteudo.innerText = '🔗 Link';
      badgeTipoConteudo.style.color = '#79DDE1';
    }
    if (blocoResultadoLink) {
      blocoResultadoLink.style.display = 'block';
      if (inputLinkLido) inputLinkLido.value = dados.url;
    }
    if (txtAcaoPrincipal) txtAcaoPrincipal.innerText = 'Abrir Link';
    if (iconeAcaoPrincipal) iconeAcaoPrincipal.textContent = 'open_in_new';
    if (txtAcaoSecundaria) txtAcaoSecundaria.innerText = 'Copiar Link';
    if (iconeAcaoSecundaria) iconeAcaoSecundaria.textContent = 'content_copy';
    if (chkAutoAbrirWrapper) chkAutoAbrirWrapper.style.display = 'block';

    // Auto-abrir se configurado
    const deveAbrir = (chkAutoAbrir && chkAutoAbrir.checked) || (prefAutoAbrirLinks && prefAutoAbrirLinks.checked);
    if (deveAbrir) {
      abrirNovoSeparador(dados.url);
    }
  } else if (dados.tipo === 'vcard') {
    if (tituloResultadoLeitura) tituloResultadoLeitura.innerText = 'Contacto Detetado';
    if (badgeTipoConteudo) {
      badgeTipoConteudo.innerText = '👤 Contacto (.vcf)';
      badgeTipoConteudo.style.color = '#38bdf8';
    }
    if (blocoResultadoLink) blocoResultadoLink.style.display = 'none';
    if (blocoResultadoWifi) blocoResultadoWifi.style.display = 'none';
    if (blocoResultadoTexto) blocoResultadoTexto.style.display = 'none';
    if (blocoResultadoContacto) blocoResultadoContacto.style.display = 'block';

    if (contactoNomeValor) contactoNomeValor.innerText = dados.nome || 'Contacto';
    if (wrapContactoTel && contactoTelValor) {
      if (dados.tel) {
        wrapContactoTel.style.display = 'flex';
        contactoTelValor.innerText = dados.tel;
      } else {
        wrapContactoTel.style.display = 'none';
      }
    }
    if (wrapContactoEmail && contactoEmailValor) {
      if (dados.email) {
        wrapContactoEmail.style.display = 'flex';
        contactoEmailValor.innerText = dados.email;
      } else {
        wrapContactoEmail.style.display = 'none';
      }
    }

    if (btnAcaoPrincipal) btnAcaoPrincipal.style.display = 'inline-flex';
    if (txtAcaoPrincipal) txtAcaoPrincipal.innerText = 'Descarregar .vcf';
    if (iconeAcaoPrincipal) iconeAcaoPrincipal.textContent = 'contact_page';

    if (btnAcaoSecundaria) {
      btnAcaoSecundaria.style.display = 'inline-flex';
      if (txtAcaoSecundaria) txtAcaoSecundaria.innerText = 'Copiar Dados';
    }
  } else if (dados.tipo === 'email') {
    if (tituloResultadoLeitura) tituloResultadoLeitura.innerText = 'Email Detetado';
    if (badgeTipoConteudo) badgeTipoConteudo.innerText = '✉️ Email';
    if (blocoResultadoLink) {
      blocoResultadoLink.style.display = 'block';
      if (inputLinkLido) inputLinkLido.value = dados.email;
    }
    if (txtAcaoPrincipal) txtAcaoPrincipal.innerText = 'Enviar Email';
    if (iconeAcaoPrincipal) iconeAcaoPrincipal.textContent = 'mail';
    if (txtAcaoSecundaria) txtAcaoSecundaria.innerText = 'Copiar Email';
  } else if (dados.tipo === 'tel') {
    if (tituloResultadoLeitura) tituloResultadoLeitura.innerText = 'Telefone Detetado';
    if (badgeTipoConteudo) badgeTipoConteudo.innerText = '📞 Telefone';
    if (blocoResultadoLink) {
      blocoResultadoLink.style.display = 'block';
      if (inputLinkLido) inputLinkLido.value = dados.tel;
    }
    if (txtAcaoPrincipal) txtAcaoPrincipal.innerText = 'Telefonar';
    if (iconeAcaoPrincipal) iconeAcaoPrincipal.textContent = 'call';
    if (txtAcaoSecundaria) txtAcaoSecundaria.innerText = 'Copiar Número';
  } else {
    // Texto Puro
    if (tituloResultadoLeitura) tituloResultadoLeitura.innerText = 'Texto / Nota';
    if (badgeTipoConteudo) {
      badgeTipoConteudo.innerText = '�� Texto';
      badgeTipoConteudo.style.color = '#cbd5e1';
    }
    if (blocoResultadoTexto) {
      blocoResultadoTexto.style.display = 'block';
      if (textoLidoArea) textoLidoArea.value = dados.texto;
    }
    if (txtAcaoPrincipal) txtAcaoPrincipal.innerText = 'Copiar Texto';
    if (iconeAcaoPrincipal) iconeAcaoPrincipal.textContent = 'content_copy';
    if (btnAcaoSecundaria) btnAcaoSecundaria.style.display = 'none';
  }

  // Auto-copiar se ativado nas preferências
  if (prefAutoCopiarLeitura && prefAutoCopiarLeitura.checked) {
    const textoCopiar = dados.tipo === 'wifi' ? dados.senha : (dados.url || dados.texto || dados.raw);
    if (textoCopiar) navigator.clipboard.writeText(textoCopiar).catch(() => {});
  }

  // Adiciona ao Histórico da Sessão
  adicionarAoHistorico(dados, horaFormatada);
}

// Botões de Ação Contextual
if (btnAcaoPrincipal) {
  btnAcaoPrincipal.addEventListener('click', () => {
    if (!ultimoDadosLidos) return;
    if (ultimoDadosLidos.tipo === 'wifi') {
      copiarParaClipboard(ultimoDadosLidos.senha, btnAcaoPrincipal, 'Senha Copiada!');
    } else if (ultimoDadosLidos.tipo === 'vcard') {
      descarregarVcard(ultimoDadosLidos.raw, ultimoDadosLidos.nome);
    } else if (ultimoDadosLidos.tipo === 'link') {
      abrirNovoSeparador(ultimoDadosLidos.url);
    } else if (ultimoDadosLidos.tipo === 'email') {
      window.location.href = 'mailto:' + ultimoDadosLidos.email;
    } else if (ultimoDadosLidos.tipo === 'tel') {
      window.location.href = 'tel:' + ultimoDadosLidos.tel;
    } else {
      copiarParaClipboard(ultimoDadosLidos.texto || ultimoDadosLidos.raw, btnAcaoPrincipal, 'Texto Copiado!');
    }
  });
}

if (btnAcaoSecundaria) {
  btnAcaoSecundaria.addEventListener('click', () => {
    if (!ultimoDadosLidos) return;
    if (ultimoDadosLidos.tipo === 'wifi') {
      const detalhes = `Wi-Fi: ${ultimoDadosLidos.ssid}\nSegurança: ${ultimoDadosLidos.seguranca}\nSenha: ${ultimoDadosLidos.senha}`;
      copiarParaClipboard(detalhes, btnAcaoSecundaria, 'Detalhes Copiados!');
    } else {
      let texto = ultimoDadosLidos.url || ultimoDadosLidos.texto || ultimoDadosLidos.raw;
      if (ultimoDadosLidos.tipo === 'vcard') {
        texto = `Nome: ${ultimoDadosLidos.nome}\nTelefone: ${ultimoDadosLidos.tel}\nEmail: ${ultimoDadosLidos.email}`.trim();
      }
      copiarParaClipboard(texto, btnAcaoSecundaria, 'Copiado!');
    }
  });
}

if (btnToggleVisivelSenhaWifi && wifiSenhaValor) {
  btnToggleVisivelSenhaWifi.addEventListener('click', () => {
    const ePass = wifiSenhaValor.type === 'password';
    wifiSenhaValor.type = ePass ? 'text' : 'password';
    btnToggleVisivelSenhaWifi.querySelector('.material-symbols-outlined').textContent = ePass ? 'visibility_off' : 'visibility';
  });
}

// ==========================================================================
// 5. Histórico da Sessão & Rejeição Inteligente de Códigos Repetidos
// ==========================================================================
function obterUltimoCodigoHistorico() {
  if (historicoSessaoCodigos.length === 0) return null;
  return historicoSessaoCodigos[historicoSessaoCodigos.length - 1];
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function adicionarAoHistorico(dados, hora) {
  historicoSessao.unshift({ dados, hora });
  historicoSessaoCodigos.push(dados.raw);

  if (historicoVazioAviso) historicoVazioAviso.style.display = 'none';
  if (badgeContadorHistorico) badgeContadorHistorico.innerText = `${historicoSessao.length} ite${historicoSessao.length === 1 ? 'm' : 'ns'}`;

  const itemElemento = document.createElement('div');
  itemElemento.className = 'cartao-item-historico';

  let badgeTexto = '🔗 Link';
  let conteudoTexto = dados.url || dados.raw;
  if (dados.tipo === 'vcard') {
    badgeTexto = '👤 Contacto';
    conteudoTexto = `Contacto: ${dados.nome}`;
  } else if (dados.tipo === 'wifi') {
    badgeTexto = '📶 Wi-Fi';
    conteudoTexto = `Rede: ${dados.ssid}`;
  } else if (dados.tipo === 'texto') {
    badgeTexto = '📝 Texto';
    conteudoTexto = dados.texto;
  }

  const safeBadge = escapeHtml(badgeTexto);
  const safeHora = escapeHtml(hora);
  const safeConteudo = escapeHtml(conteudoTexto);
  const safeRaw = escapeHtml(dados.raw || "");

  itemElemento.innerHTML = `
    <div class="item-historico-info">
      <div class="item-historico-topo">
        <span class="badge-item-tipo">${safeBadge}</span>
        <span class="hora-item">${safeHora}</span>
      </div>
      <span class="conteudo-item-texto" title="${safeRaw}">${safeConteudo}</span>
    </div>
    <div class="item-historico-botoes">
      ${dados.tipo === 'link' ? `<button class="btn-item-acao btn-abrir-hist" title="Abrir"><span class="material-symbols-outlined" style="font-size:16px;">open_in_new</span></button>` : ''}
      ${dados.tipo === 'vcard' ? `<button class="btn-item-acao btn-vcf-hist" title="Descarregar .vcf"><span class="material-symbols-outlined" style="font-size:16px;">download</span></button>` : ''}
      <button class="btn-item-acao btn-copiar-hist" title="Copiar"><span class="material-symbols-outlined" style="font-size:16px;">content_copy</span></button>
    </div>
  `;

  const btnVcf = itemElemento.querySelector('.btn-vcf-hist');
  if (btnVcf) {
    btnVcf.addEventListener('click', (e) => {
      e.stopPropagation();
      descarregarVcard(dados.raw, dados.nome);
    });
  }

  const btnAbrir = itemElemento.querySelector('.btn-abrir-hist');
  if (btnAbrir) {
    btnAbrir.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirNovoSeparador(dados.url);
    });
  }

  const btnCopiar = itemElemento.querySelector('.btn-copiar-hist');
  if (btnCopiar) {
    btnCopiar.addEventListener('click', (e) => {
      e.stopPropagation();
      const txtCopiar = dados.tipo === 'wifi' ? dados.senha : (dados.url || dados.texto || dados.raw);
      copiarParaClipboard(txtCopiar, btnCopiar, '✓');
    });
  }

  if (listaHistoricoSessao) {
    listaHistoricoSessao.insertBefore(itemElemento, listaHistoricoSessao.firstChild);
  }
}

if (btnLimparHistorico) {
  btnLimparHistorico.addEventListener('click', () => {
    historicoSessao.length = 0;
    historicoSessaoCodigos.length = 0;
    if (listaHistoricoSessao) {
      listaHistoricoSessao.innerHTML = `
        <div class="historico-vazio" id="historicoVazioAviso">
          <span class="material-symbols-outlined">qr_code_2</span>
          <p>Nenhum código lido ainda nesta sessão.</p>
        </div>
      `;
    }
    if (badgeContadorHistorico) badgeContadorHistorico.innerText = '0 itens';
  });
}

// ==========================================================================
// 6. Câmara, Scanner Universal, Ecrã Inteiro e Zoom
// ==========================================================================
if (btnCamera && video) {
  btnCamera.addEventListener('click', async () => {
    if (streamCamera) {
      pararCamera();
    } else {
      iniciarCamera();
    }
  });
}

if (btnEcraInteiroZoom) {
  btnEcraInteiroZoom.addEventListener('click', () => {
    entrarModoEcraInteiro();
  });
}

if (btnFecharEcraInteiro) {
  btnFecharEcraInteiro.addEventListener('click', () => {
    sairModoEcraInteiro();
  });
}

function entrarModoEcraInteiro() {
  document.body.classList.add('camera-em-ecra-inteiro');
  if (videoContainer) videoContainer.classList.add('modo-ecra-inteiro');
}

function sairModoEcraInteiro() {
  document.body.classList.remove('camera-em-ecra-inteiro');
  if (videoContainer) videoContainer.classList.remove('modo-ecra-inteiro');
}

function definirZoom(novoNivel) {
  zoomAtual = Math.max(1.0, Math.min(novoNivel, maxZoomHardware > 1.0 ? maxZoomHardware : 4.0));
  const zoomFormatado = zoomAtual.toFixed(1) + 'x';
  if (badgeZoomNivel) badgeZoomNivel.innerText = zoomFormatado;
  if (sliderZoom) sliderZoom.value = zoomAtual;

  // Atualiza botões de preset
  document.querySelectorAll('.btn-preset-zoom').forEach(btn => {
    const pVal = parseFloat(btn.dataset.zoom);
    btn.classList.toggle('sel', Math.abs(pVal - zoomAtual) < 0.15);
  });

  if (temZoomHardware && trackVideo) {
    trackVideo.applyConstraints({
      advanced: [{ zoom: zoomAtual }]
    }).catch(() => {});
  } else if (video) {
    video.style.transform = `scale(${zoomAtual})`;
  }
}

if (sliderZoom) {
  sliderZoom.addEventListener('input', (e) => {
    definirZoom(parseFloat(e.target.value));
  });
}

if (btnZoomMais) {
  btnZoomMais.addEventListener('click', () => {
    definirZoom(zoomAtual + 0.3);
  });
}

if (btnZoomMenos) {
  btnZoomMenos.addEventListener('click', () => {
    definirZoom(zoomAtual - 0.3);
  });
}

document.querySelectorAll('.btn-preset-zoom').forEach(btn => {
  btn.addEventListener('click', () => {
    definirZoom(parseFloat(btn.dataset.zoom));
  });
});

// Duplo clique/toque no vídeo para alternar zoom 1x / 2x
if (video) {
  video.addEventListener('dblclick', () => {
    definirZoom(zoomAtual > 1.4 ? 1.0 : 2.0);
  });
}

async function iniciarCamera() {
  try {
    streamCamera = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    video.srcObject = streamCamera;
    trackVideo = streamCamera.getVideoTracks()[0];

    // Deteção de capacidades de hardware (zoom ótico/sensor)
    if (trackVideo && trackVideo.getCapabilities) {
      const caps = trackVideo.getCapabilities();
      if ('zoom' in caps) {
        temZoomHardware = true;
        maxZoomHardware = caps.zoom.max || 4.0;
        if (sliderZoom) sliderZoom.max = maxZoomHardware;
      }
    }

    if (txtBtnCamera) txtBtnCamera.innerText = 'Desativar câmera';
    if (btnEcraInteiroZoom) btnEcraInteiroZoom.style.display = 'inline-flex';

    // Scanner com fallback jsQR
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const temBarcodeDetector = ('BarcodeDetector' in window);
    const barcodeDetector = temBarcodeDetector ? new BarcodeDetector({ formats: ['qr_code'] }) : null;

    scanInterval = setInterval(async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          let qrValor = null;
          if (temBarcodeDetector) {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes.length > 0) qrValor = barcodes[0].rawValue;
          } else if (typeof jsQR !== 'undefined') {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });
            if (code && code.data) qrValor = code.data;
          }

          if (qrValor) {
            processarLeituraScanner(qrValor);
          }
        } catch (e) {
          // Ignora frame imperfeito
        }
      }
    }, 350);
  } catch (err) {
    console.error('Erro ao aceder à câmara:', err);
    alert('Não foi possível aceder à câmara.');
  }
}

function processarLeituraScanner(qrValor) {
  if (!qrValor) return;

  // Rejeição de Código Vinculada ao Histórico da Sessão do Leitor
  const ultimoLido = obterUltimoCodigoHistorico();
  if (qrValor === ultimoLido) {
    return; // Rejeita repetição imediata
  }

  // Emite feedback multissensorial
  emitirFeedbackLeituraCompleta();

  // Se estiver em modo ecrã inteiro, sai para que o utilizador veja o cartão
  if (document.body.classList.contains('camera-em-ecra-inteiro')) {
    sairModoEcraInteiro();
  }

  // Envia via socket para toda a sala
  socket.emit('enviar-link', {
    codigoSala: codSalaAtual,
    link: qrValor
  });

  // Processa localmente
  processarConteudoRecebido(qrValor);
}

function pararCamera() {
  if (streamCamera) {
    streamCamera.getTracks().forEach(track => track.stop());
    streamCamera = null;
    trackVideo = null;
    video.srcObject = null;
  }
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  if (txtBtnCamera) txtBtnCamera.innerText = 'Ativar câmera';
  if (btnEcraInteiroZoom) btnEcraInteiroZoom.style.display = 'none';
  sairModoEcraInteiro();
}

// ==========================================================================
// 7. Modal de Definições (Layout Dashboard com Abas)
// ==========================================================================
if (btnAbrirDefinicoes && modalDefinicoesOverlay) {
  btnAbrirDefinicoes.addEventListener('click', () => {
    modalDefinicoesOverlay.classList.add('ativo');
  });
}

function fecharModalDefinicoes() {
  if (modalDefinicoesOverlay) modalDefinicoesOverlay.classList.remove('ativo');
  guardarPreferencias();
}

if (btnFecharModalTopo) btnFecharModalTopo.addEventListener('click', fecharModalDefinicoes);
if (btnConcluirModal) btnConcluirModal.addEventListener('click', fecharModalDefinicoes);

if (modalDefinicoesOverlay) {
  modalDefinicoesOverlay.addEventListener('click', (e) => {
    if (e.target === modalDefinicoesOverlay) fecharModalDefinicoes();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalDefinicoesOverlay && modalDefinicoesOverlay.classList.contains('ativo')) {
    fecharModalDefinicoes();
  }
});

// Alternador de Abas na Modal
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('sel'));
    tabPaineis.forEach(p => p.classList.remove('sel'));

    btn.classList.add('sel');
    const tabNome = btn.dataset.tab;
    const painelAlvo = document.getElementById(`painelTab${tabNome.charAt(0).toUpperCase() + tabNome.slice(1)}`);
    if (painelAlvo) painelAlvo.classList.add('sel');
  });
});

// Gestão de Senha da Sala dentro da Modal
function atualizarUiEstadoSenhaSala(temSenha) {
  if (iconeStatusSenhaBox && txtTituloStatusSenha && txtDescricaoStatusSenha) {
    if (temSenha) {
      iconeStatusSenhaBox.textContent = 'lock';
      iconeStatusSenhaBox.style.color = '#eab308';
      txtTituloStatusSenha.innerText = 'Sala Protegida com Palavra-Passe';
      txtDescricaoStatusSenha.innerText = 'Apenas utilizadores com a senha podem aceder.';
      if (btnRemoverSenhaSala) btnRemoverSenhaSala.style.display = 'inline-flex';
    } else {
      iconeStatusSenhaBox.textContent = 'lock_open';
      iconeStatusSenhaBox.style.color = '#79DDE1';
      txtTituloStatusSenha.innerText = 'Sala Sem Palavra-Passe';
      txtDescricaoStatusSenha.innerText = 'Qualquer pessoa com o código pode entrar e participar.';
      if (btnRemoverSenhaSala) btnRemoverSenhaSala.style.display = 'none';
    }
  }
}

if (btnGuardarSenhaSala && inputNovaSenhaSala) {
  btnGuardarSenhaSala.addEventListener('click', async () => {
    const novaSenha = (inputNovaSenhaSala.value || '').trim();
    if (!novaSenha) {
      if (msgFeedbackSenha) {
        msgFeedbackSenha.innerText = 'Digita uma senha válida.';
        msgFeedbackSenha.style.color = '#ef4444';
      }
      return;
    }

    try {
      const res = await fetch('/syncqr/sala/senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados: { codigo: codSalaAtual, senha: novaSenha } })
      });
      const dados = await res.json();
      if (dados.success) {
        if (msgFeedbackSenha) {
          msgFeedbackSenha.innerText = '✓ Senha guardada com sucesso!';
          msgFeedbackSenha.style.color = '#10B981';
        }
        inputNovaSenhaSala.value = '';
        socket.emit('definir-senha-sala', { codigoSala: codSalaAtual, senha: novaSenha });
        sessionStorage.setItem(STORAGE_AUTH_KEY, novaSenha);
        atualizarUiEstadoSenhaSala(true);
      }
    } catch (e) {
      if (msgFeedbackSenha) {
        msgFeedbackSenha.innerText = 'Erro ao guardar senha.';
        msgFeedbackSenha.style.color = '#ef4444';
      }
    }
  });
}

if (btnRemoverSenhaSala) {
  btnRemoverSenhaSala.addEventListener('click', async () => {
    try {
      const res = await fetch('/syncqr/sala/senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados: { codigo: codSalaAtual, senha: '' } })
      });
      const dados = await res.json();
      if (dados.success) {
        if (msgFeedbackSenha) {
          msgFeedbackSenha.innerText = '✓ Senha removida da sala.';
          msgFeedbackSenha.style.color = '#10B981';
        }
        socket.emit('definir-senha-sala', { codigoSala: codSalaAtual, senha: '' });
        sessionStorage.removeItem(STORAGE_AUTH_KEY);
        atualizarUiEstadoSenhaSala(false);
      }
    } catch (e) {
      console.error('Erro ao remover senha:', e);
    }
  });
}

if (btnToggleVisivelNovaSenha && inputNovaSenhaSala) {
  btnToggleVisivelNovaSenha.addEventListener('click', () => {
    const ePass = inputNovaSenhaSala.type === 'password';
    inputNovaSenhaSala.type = ePass ? 'text' : 'password';
    btnToggleVisivelNovaSenha.querySelector('.material-symbols-outlined').textContent = ePass ? 'visibility_off' : 'visibility';
  });
}

// ==========================================================================
// 8. Visibilidade na Rede Local (Wi-Fi)
// ==========================================================================
if (chkVisivelRedeSala) {
  chkVisivelRedeSala.addEventListener('change', async () => {
    const visivel = chkVisivelRedeSala.checked;
    if (txtStatusVisibilidade) {
      txtStatusVisibilidade.innerText = visivel ? 'Visível na rede local' : 'Privada (Oculta na rede)';
    }

    if (socket && socket.connected) {
      socket.emit('toggle-visibilidade-rede', { codigoSala: codSalaAtual, visivel: visivel });
    }

    try {
      await fetch('/syncqr/sala/visibilidade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados: { codigo: codSalaAtual, visivel: visivel } })
      });
    } catch (e) {
      console.error('Erro ao atualizar visibilidade:', e);
    }
  });

  socket.on('visibilidade-atualizada', (visivel) => {
    chkVisivelRedeSala.checked = !!visivel;
    if (txtStatusVisibilidade) {
      txtStatusVisibilidade.innerText = visivel ? 'Visível na rede local' : 'Privada (Oculta na rede)';
    }
  });
}

// Sair da Sala
if (btnSairSala) {
  btnSairSala.addEventListener('click', (e) => {
    e.preventDefault();
    pararCamera();
    if (socket.connected) {
      socket.emit('sair-sala', codSalaAtual);
      socket.disconnect();
    }
    window.location.href = '/syncqr';
  });
}

// Copiar código da sala ao clicar no título
if (codigoSala) {
  codigoSala.addEventListener('click', async () => {
    const originalTexto = codigoSala.innerText.trim();
    if (originalTexto === 'Copiado!') return;
    await copiarParaClipboard(originalTexto, null);
    codigoSala.innerText = 'Copiado!';
    codigoSala.style.borderColor = '#10B981';
    codigoSala.style.color = '#10B981';
    setTimeout(() => {
      codigoSala.innerText = originalTexto;
      codigoSala.style.borderColor = '';
      codigoSala.style.color = '';
    }, 1500);
  });
}
