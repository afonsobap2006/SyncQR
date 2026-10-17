const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const caminhoSync = path.join(__dirname, 'data', 'syncqr.json');

// ==========================================
// Identificação de IP de Rede (Wi-Fi / LAN)
// ==========================================
function obterIpCliente(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.headers["x-real-ip"] || req.socket?.remoteAddress || req.ip || "";
}

function obterIpSocket(socket) {
    const forwarded = socket.handshake.headers["x-forwarded-for"];
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return socket.handshake.headers["x-real-ip"] || socket.handshake.address || "";
}

// ==========================================
// Gestão de Salas e Persistência
// ==========================================
function carregarSalas() {
    try {
        if (!fs.existsSync(caminhoSync)) {
            const dir = path.dirname(caminhoSync);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const inicial = { salas: [] };
            fs.writeFileSync(caminhoSync, JSON.stringify(inicial, null, 4));
            return inicial;
        }
        return JSON.parse(fs.readFileSync(caminhoSync, 'utf-8'));
    } catch (e) {
        console.error('Erro ao ler salas:', e);
        return { salas: [] };
    }
}

function salvarSalas(dados) {
    try {
        const dirSync = path.dirname(caminhoSync);
        if (!fs.existsSync(dirSync)) {
            fs.mkdirSync(dirSync, { recursive: true });
        }
        const tempPath = `${caminhoSync}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(dados, null, 4), 'utf-8');
        fs.renameSync(tempPath, caminhoSync);
    } catch (e) {
        console.error('Erro ao gravar salas:', e);
    }
}

function atualizarDataApagarSala(codigoSala, dataApagar) {
    try {
        const syncDados = carregarSalas();
        const codigoFormatado = (codigoSala || '').trim().toUpperCase();
        const sala = syncDados.salas.find(s => s.codigo.toUpperCase() === codigoFormatado);
        if (sala) {
            sala.dataApagar = dataApagar;
            salvarSalas(syncDados);
        }
    } catch (e) {
        console.error('Erro ao atualizar dataApagar:', e);
    }
}

let intervaloLimpezaIniciado = false;
function iniciarRotinaLimpeza() {
    if (intervaloLimpezaIniciado) return;
    intervaloLimpezaIniciado = true;

    setInterval(() => {
        try {
            const syncDados = carregarSalas();
            const agora = Date.now();
            const totalAntes = syncDados.salas.length;

            syncDados.salas = syncDados.salas.filter(sala => {
                if (sala.dataApagar && new Date(sala.dataApagar).getTime() <= agora) {
                    console.log(`🗑️ Sala [${sala.codigo}] apagada automaticamente após 10min sem utilizadores.`);
                    return false;
                }
                return true;
            });

            if (syncDados.salas.length !== totalAntes) {
                salvarSalas(syncDados);
            }
        } catch (e) {
            console.error('Erro na limpeza de salas:', e);
        }
    }, 60 * 1000);
}

// ==========================================
// Configuração Modular do SyncQR
// ==========================================
function configurarSyncQR(targetApp, targetIo, options = {}) {
    const syncqrViewsDir = path.join(__dirname, 'views');
    const currentViews = targetApp.get('views');
    if (currentViews) {
        const list = Array.isArray(currentViews) ? currentViews : [currentViews];
        if (!list.includes(syncqrViewsDir)) {
            targetApp.set('views', [...list, syncqrViewsDir]);
        }
    } else {
        targetApp.set('views', syncqrViewsDir);
    }
    targetApp.use(express.static(path.join(__dirname, 'public')));
    const isStandalone = options.isStandalone !== undefined ? options.isStandalone : false;

    iniciarRotinaLimpeza();

    // Rotas HTTP
    const renderHome = (req, res) => {
        res.render('syncqr', { urlAtual: '/syncqr' });
    };

    const renderSala = (req, res) => {
        const codigo = (req.params.codigo || '').trim().toUpperCase();
        const syncDados = carregarSalas();
        const sala = syncDados.salas.find(s => s.codigo.toUpperCase() === codigo);
        if (!sala) {
            return res.status(404).send('Sala não encontrada');
        }
        const args = {
            codigo: codigo,
            visivelNaRede: sala.visivelNaRede !== false,
            temSenha: !!sala.senha
        };
        res.render('syncqr-sala', { args, urlAtual: '/syncqr' });
    };

    const obterSalasLocais = (req, res) => {
        try {
            const ipCliente = obterIpCliente(req);
            const syncDados = carregarSalas();
            const salasLocais = syncDados.salas.filter(s => {
                const numLigados = targetIo ? (targetIo.sockets.adapter.rooms.get(s.codigo)?.size || s.totalPessoas || 0) : s.totalPessoas || 0;
                return s.visivelNaRede && s.ipRede && s.ipRede === ipCliente && numLigados > 0;
            }).map(s => ({
                codigo: s.codigo,
                totalPessoas: targetIo ? (targetIo.sockets.adapter.rooms.get(s.codigo)?.size || s.totalPessoas || 1) : s.totalPessoas || 1,
                temSenha: !!s.senha
            }));
            res.json({ salas: salasLocais });
        } catch (e) {
            console.error('Erro ao obter salas locais:', e);
            res.json({ salas: [] });
        }
    };

    const processarAcaoSala = (req, res) => {
        const acao = req.params.acao;
        if (acao === "criar") {
            const gerarCodigoRapido = () => Math.random().toString(36).substring(2, 8).toUpperCase();
            const novoCodigo = gerarCodigoRapido();
            const visivelNaRede = req.body.dados?.visivelNaRede !== undefined ? !!req.body.dados.visivelNaRede : true;
            const ipCliente = obterIpCliente(req);

            const syncDados = carregarSalas();
            const dataApagar = new Date(Date.now() + 10 * 60 * 1000).toISOString();
            syncDados.salas.push({
                codigo: novoCodigo,
                dataApagar: dataApagar,
                visivelNaRede: visivelNaRede,
                ipRede: visivelNaRede ? ipCliente : null,
                totalPessoas: 0
            });
            salvarSalas(syncDados);

            res.json({ codigo: novoCodigo });
        } else if (acao === "entrar") {
            const codigo = (req.body.dados?.codigo || '').trim().toUpperCase();
            const senha = (req.body.dados?.senha || '').trim();
            const syncDados = carregarSalas();
            const sala = syncDados.salas.find(s => s.codigo.toUpperCase() === codigo);
            if (!sala) {
                return res.status(404).json({ codigo: "", error: "Sala não encontrada" });
            }
            if (sala.senha && sala.senha.trim().length > 0) {
                if (!senha || senha !== sala.senha) {
                    return res.status(401).json({ codigo: "", precisaSenha: true, error: "Palavra-passe obrigatória ou incorreta" });
                }
            }
            res.json({ codigo: codigo });
        } else if (acao === "senha") {
            const codigo = (req.body.dados?.codigo || '').trim().toUpperCase();
            const novaSenha = req.body.dados?.senha !== undefined ? (req.body.dados.senha || '').trim() : null;
            const syncDados = carregarSalas();
            const sala = syncDados.salas.find(s => s.codigo.toUpperCase() === codigo);
            if (!sala) {
                return res.status(404).json({ error: "Sala não encontrada" });
            }
            sala.senha = (novaSenha && novaSenha.length > 0) ? novaSenha : null;
            salvarSalas(syncDados);
            if (targetIo) targetIo.to(codigo).emit("sala-senha-atualizada", { temSenha: !!sala.senha });
            res.json({ success: true, temSenha: !!sala.senha });
        } else if (acao === "visibilidade") {
            const codigo = (req.body.dados?.codigo || '').trim().toUpperCase();
            const visivel = !!req.body.dados?.visivel;
            const ipCliente = obterIpCliente(req);

            const syncDados = carregarSalas();
            const sala = syncDados.salas.find(s => s.codigo.toUpperCase() === codigo);
            if (!sala) {
                return res.status(404).json({ error: "Sala não encontrada" });
            }
            sala.visivelNaRede = visivel;
            sala.ipRede = visivel ? ipCliente : null;
            salvarSalas(syncDados);
            res.json({ success: true, visivelNaRede: sala.visivelNaRede });
        }
    };

    // Rotas de namespace /syncqr
    targetApp.get('/syncqr', renderHome);
    targetApp.get('/syncqr/sala/:codigo', renderSala);
    targetApp.get('/syncqr/salas-locais', obterSalasLocais);
    targetApp.post('/syncqr/sala/:acao', processarAcaoSala);

    // Se estiver a correr standalone, regista também rotas na raiz
    if (isStandalone) {
        targetApp.get('/', renderHome);
        targetApp.get('/sala/:codigo', renderSala);
        targetApp.get('/salas-locais', obterSalasLocais);
        targetApp.post('/sala/:acao', processarAcaoSala);
    }

    // Sockets em tempo real
    if (targetIo) {
        targetIo.on('connection', (socket) => {
            let salaAtual = null;

            socket.on('entrar-sala', (payload) => {
                const codigoSala = (typeof payload === 'object' ? payload.codigoSala : payload || '').trim().toUpperCase();
                const senhaFornecida = (typeof payload === 'object' ? payload.senha : '') || '';
                if (!codigoSala) return;

                const syncDados = carregarSalas();
                const sala = syncDados.salas.find(s => s.codigo.toUpperCase() === codigoSala);

                // Validação de senha caso a sala esteja protegida
                if (sala && sala.senha && sala.senha.trim().length > 0) {
                    if (senhaFornecida !== sala.senha) {
                        socket.emit('erro-autenticacao-sala', 'Palavra-passe incorreta ou não fornecida.');
                        return;
                    }
                }

                salaAtual = codigoSala;
                socket.join(codigoSala);
                socket.emit('autenticado-sucesso', { codigo: codigoSala, temSenha: !!(sala && sala.senha) });

                // Cancela data de exclusão porque agora há alguém conectado
                atualizarDataApagarSala(codigoSala, null);

                const totalPessoas = targetIo.sockets.adapter.rooms.get(codigoSala)?.size || 0;
                console.log(`🔌 Novo utilizador na sala [${codigoSala}]. Total: ${totalPessoas}`);

                // Atualiza registo da sala
                const dadosSalasAtuais = carregarSalas();
                const salaAtualRegistro = dadosSalasAtuais.salas.find(s => s.codigo.toUpperCase() === codigoSala);
                if (salaAtualRegistro) {
                    salaAtualRegistro.totalPessoas = totalPessoas;
                    if (salaAtualRegistro.visivelNaRede && !salaAtualRegistro.ipRede) {
                        salaAtualRegistro.ipRede = obterIpSocket(socket);
                    }
                    salvarSalas(dadosSalasAtuais);
                }

                targetIo.to(codigoSala).emit('atualizar-contagem', totalPessoas);
            });

            socket.on('definir-senha-sala', ({ codigoSala, senha }) => {
                if (!codigoSala) return;
                const codigoFormatado = (codigoSala || '').trim().toUpperCase();
                const novaSenha = (senha || '').trim();
                const syncDados = carregarSalas();
                const sala = syncDados.salas.find(s => s.codigo.toUpperCase() === codigoFormatado);
                if (sala) {
                    sala.senha = novaSenha.length > 0 ? novaSenha : null;
                    salvarSalas(syncDados);
                    targetIo.to(codigoFormatado).emit('sala-senha-atualizada', { temSenha: !!sala.senha });
                }
            });

            socket.on('toggle-visibilidade-rede', ({ codigoSala, visivel }) => {
                if (!codigoSala) return;
                const syncDados = carregarSalas();
                const sala = syncDados.salas.find(s => s.codigo.toUpperCase() === codigoSala);
                if (sala) {
                    sala.visivelNaRede = !!visivel;
                    sala.ipRede = visivel ? obterIpSocket(socket) : null;
                    salvarSalas(syncDados);
                    targetIo.to(codigoSala).emit('visibilidade-atualizada', sala.visivelNaRede);
                }
            });

            socket.on('enviar-link', ({ codigoSala, link }) => {
                if (!codigoSala || !link) return;

                const info = {
                    link: link,
                    hora: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };

                console.log(`📡 Novo link recebido na sala [${codigoSala}]: ${link}`);
                targetIo.to(codigoSala).emit('receber-link', info);
            });

            socket.on('disconnect', () => {
                if (salaAtual) {
                    const totalPessoas = targetIo.sockets.adapter.rooms.get(salaAtual)?.size || 0;
                    console.log(`❌ Utilizador saiu da sala [${salaAtual}]. Restantes: ${totalPessoas}`);

                    if (totalPessoas === 0) {
                        const dataApagar = new Date(Date.now() + 10 * 60 * 1000).toISOString();
                        atualizarDataApagarSala(salaAtual, dataApagar);
                        console.log(`⏳ Sala [${salaAtual}] agendada para apagar em: ${dataApagar}`);
                    }

                    const syncDados = carregarSalas();
                    const sala = syncDados.salas.find(s => s.codigo.toUpperCase() === salaAtual);
                    if (sala) {
                        sala.totalPessoas = totalPessoas;
                        salvarSalas(syncDados);
                    }

                    targetIo.to(salaAtual).emit('atualizar-contagem', totalPessoas);
                }
            });

            socket.on('sair-sala', (codigoSala) => {
                if (!codigoSala) return;

                socket.leave(codigoSala);
                const totalPessoas = targetIo.sockets.adapter.rooms.get(codigoSala)?.size || 0;
                console.log(`🚪 Utilizador saiu manualmente da sala [${codigoSala}]. Restantes: ${totalPessoas}`);

                if (totalPessoas === 0) {
                    const dataApagar = new Date(Date.now() + 10 * 60 * 1000).toISOString();
                    atualizarDataApagarSala(codigoSala, dataApagar);
                    console.log(`⏳ Sala [${codigoSala}] agendada para apagar em: ${dataApagar}`);
                }

                targetIo.to(codigoSala).emit('atualizar-contagem', totalPessoas);
            });
        });
    }
}

let appStandalone = null;
let serverStandalone = null;
let ioStandalone = null;

if (require.main === module) {
    appStandalone = express();
    serverStandalone = http.createServer(appStandalone);
    ioStandalone = new Server(serverStandalone);

    appStandalone.use(express.json());
    appStandalone.use(express.urlencoded({ extended: true }));
    appStandalone.use(express.static(path.join(__dirname, 'public')));
    appStandalone.set('view engine', 'ejs');
    appStandalone.set('views', path.join(__dirname, 'views'));

    configurarSyncQR(appStandalone, ioStandalone, { isStandalone: true });

    serverStandalone.listen(PORT, () => {
        console.log(`🚀 SyncQR a rodar em http://localhost:${PORT}`);
    });
}

module.exports = {
    configurarSyncQR,
    carregarSalas,
    salvarSalas,
    atualizarDataApagarSala,
    obterIpCliente,
    obterIpSocket,
    app: appStandalone,
    server: serverStandalone,
    io: ioStandalone
};
