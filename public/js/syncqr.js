const btnEntrarSala = document.getElementById('btnEntrarSala');
const inputCodigoSala = document.getElementById('inputCodigoSala');
const infError = document.getElementById('infError');
const btnCriarSala = document.getElementById('btnCriarSala');
const chkVisivelRede = document.getElementById('chkVisivelRede');
const blocoSalasLocais = document.getElementById('blocoSalasLocais');
const listaSalasLocais = document.getElementById('listaSalasLocais');
const badgeSalasLocais = document.getElementById('badgeSalasLocais');

if (btnEntrarSala && inputCodigoSala) {
  btnEntrarSala.addEventListener('click', async (e) => {
    processarSala(inputCodigoSala.value, "entrar");
  });

  inputCodigoSala.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      processarSala(inputCodigoSala.value, "entrar");
    }
  });
}

if (btnCriarSala) {
  btnCriarSala.addEventListener('click', async (e) => {
    e.preventDefault();
    processarSala("", "criar");
  });
}

function processarSala(codigo, tipo) {
  const visivel = chkVisivelRede ? chkVisivelRede.checked : true;
  const dados = {
    codigo: (codigo || '').trim().toUpperCase(),
    visivelNaRede: visivel
  };

  if (dados.codigo.length === 6 || tipo === "criar") {
    if (infError) infError.innerText = "";
    fetch(`/syncqr/sala/${tipo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dados: dados })
    })
      .then(resposta => {
        if (!resposta.ok) {
          throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        return resposta.json();
      })
      .then(dadosRecebidos => {
        let cod = dadosRecebidos.codigo;
        if (cod && cod !== "") {
          window.location.href = `/syncqr/sala/${cod}`;
        } else if (infError) {
          infError.innerText = dadosRecebidos.error || "Erro ao processar sala";
        }
      })
      .catch(erro => {
        console.error('Ocorreu um erro ao processar sala:', erro);
        if (infError) infError.innerText = "Erro de ligação ao servidor";
      });
  } else if (infError) {
    infError.innerText = "Código inválido (deve ter 6 caracteres)";
  }
}

// ==========================================
// Deteção Automática de Salas na Rede Local (Wi-Fi)
// ==========================================
async function carregarSalasLocais() {
  try {
    const resposta = await fetch('/syncqr/salas-locais');
    if (!resposta.ok) return;
    const data = await resposta.json();
    renderizarSalasLocais(data.salas || []);
  } catch (erro) {
    console.error('Erro ao pesquisar salas na rede:', erro);
  }
}

function renderizarSalasLocais(salas) {
  if (!blocoSalasLocais || !listaSalasLocais) return;

  if (salas.length === 0) {
    blocoSalasLocais.style.display = 'none';
    listaSalasLocais.innerHTML = '';
    return;
  }

  blocoSalasLocais.style.display = 'block';
  if (badgeSalasLocais) {
    badgeSalasLocais.innerText = `${salas.length} sala${salas.length === 1 ? '' : 's'}`;
  }

  listaSalasLocais.innerHTML = salas.map(s => {
    const safeCodigo = String(s.codigo || "").replace(/[^a-zA-Z0-9]/g, "");
    const rota = (window.location.pathname.startsWith("/syncqr") ? "/syncqr/sala/" : "/sala/") + encodeURIComponent(safeCodigo);
    return `
    <div class="cartao-sala-local" onclick="window.location.href='${rota}'">
      <div class="info-sala-local">
        <span class="codigo-sala-local">${safeCodigo}</span>
        <span class="membros-sala-local">👥 ${Number(s.totalPessoas) || 0} ligado${s.totalPessoas === 1 ? "" : "s"}</span>
      </div>
      <button class="btn-entrar-direto" title="Entrar de imediato sem código manual">
        <span>Entrar</span>
        <span class="material-symbols-outlined icone-seta">arrow_forward</span>
      </button>
    </div>
  `;
  }).join('');
}

// Inicia deteção imediata e faz polling a cada 5 segundos
carregarSalasLocais();
setInterval(carregarSalasLocais, 5000);
