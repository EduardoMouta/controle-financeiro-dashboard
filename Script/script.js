/* SELEÇÃO DE ELEMENTOS DO DOM */
const inputRenda = document.getElementById("input-renda");
const btnSalvarRenda = document.getElementById("btn-salvar-renda");

const valRenda = document.getElementById("val-renda");
const valGastos = document.getElementById("val-gastos");
const valSaldo = document.getElementById("val-saldo");
const valPorcentagem = document.getElementById("val-porcentagem");

const formTransacao = document.getElementById("form-transacao");
const inputDescricao = document.getElementById("descricao");
const inputValor = document.getElementById("valor");
const inputCategoria = document.getElementById("categoria");
const listaTransacoes = document.getElementById("lista-transacoes");
const anuncioDashboard = document.getElementById("anuncio-dashboard");

/* ESTADO DA APLICAÇÃO (LOAD & SAVE) */
function carregarDados() {
  const dadosSalvos = localStorage.getItem("controle_financeiro");
  if (dadosSalvos) {
    return JSON.parse(dadosSalvos);
  }
  return {
    renda: 0,
    transacoes: [],
  };
}

function salvarDados(dados) {
  localStorage.setItem("controle_financeiro", JSON.stringify(dados));
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO (DASHBOARD) */
function atualizarDashboard({ anunciar = false } = {}) {
  /*desestruturação de objetos com valor padrão*/
  const dados = carregarDados();

  let totalGastos = 0;

  for (let i = 0; i < dados.transacoes.length; i++) {
    totalGastos += dados.transacoes[i].valor;
  }

  const saldoRestante = dados.renda - totalGastos;

  let porcentagem = 0;

  if (dados.renda > 0) {
    porcentagem = (totalGastos / dados.renda) * 100;
  }

  const rendaFormatada = formatarMoeda(dados.renda);
  const gastosFormatados = formatarMoeda(totalGastos);
  const saldoFormatado = formatarMoeda(Math.abs(saldoRestante));
  const porcentagemTexto = porcentagem.toFixed(1) + "%";

  // Atualização visual dos quatro cards
  valRenda.textContent = rendaFormatada;
  valGastos.textContent = gastosFormatados;
  valPorcentagem.textContent = porcentagemTexto;

  // Tratamento do saldo negativo
  let saldoAcessivel = "";

  if (saldoRestante < 0) {
    valSaldo.textContent = `-${saldoFormatado}`;
    valSaldo.style.color = "var(--danger-color)";

    saldoAcessivel = `Saldo restante negativo: ${saldoFormatado}`;
  } else {
    valSaldo.textContent = formatarMoeda(saldoRestante);
    valSaldo.style.color = "var(--success-color)";

    saldoAcessivel = `Saldo restante: ${formatarMoeda(saldoRestante)}`;
  }

  // Atualização dos nomes acessíveis dos cards
  // O aria-labelledby utiliza os textos e valores atuais.

  if (dados.renda > 0 && inputRenda.value === "") {
    inputRenda.value = dados.renda;
  }

  if (saldoRestante < 0) {
    valSaldo.textContent = `-${saldoFormatado}`;

    valSaldo.setAttribute("aria-label", `Saldo negativo de ${saldoFormatado}`);

    valSaldo.style.color = "var(--danger-color)";
  } else {
    valSaldo.textContent = formatarMoeda(saldoRestante);

    valSaldo.setAttribute(
      "aria-label",
      `Saldo positivo de ${formatarMoeda(saldoRestante)}`,
    );

    valSaldo.style.color = "var(--success-color)";
  }

  // Anúncio das atualizações para leitores de tela
  if (anunciar) {
    anuncioDashboard.textContent =
      `Indicadores atualizados. ` +
      `Total gasto: ${gastosFormatados}. ` +
      `${saldoAcessivel}. ` +
      `Comprometido: ${porcentagemTexto}.`;
  }
}

/* EVENTO: SALVAR RENDA MENSAL */
btnSalvarRenda.addEventListener("click", function () {
  const novaRenda = parseFloat(inputRenda.value);

  if (isNaN(novaRenda) || novaRenda < 0) {
    alert("Por favor, insira um valor de renda válido.");
    return;
  }

  const dados = carregarDados();
  dados.renda = novaRenda;
  salvarDados(dados);

  atualizarDashboard();
  alert("Renda salva com sucesso!");
});

/* RENDERIZAR TABELA DE TRANSAÇÕES */
function atualizarTabela() {
  const dados = carregarDados();
  listaTransacoes.innerHTML = "";

  if (dados.transacoes.length === 0) {
    listaTransacoes.innerHTML = `
        <tr class="vazio">
            <td colspan="4">Nenhum gasto cadastrado ainda.</td>
        </tr>
    `;
    return;
  }

  dados.transacoes.forEach(function (transacao) {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${transacao.descricao}</td>
      <td>${transacao.categoria}</td>
      <td>${formatarMoeda(transacao.valor)}</td>
      <td>
          <button class="btn-excluir" aria-label="Excluir gasto
           ${transacao.descricao}" onclick="removerTransacao
           (${transacao.id})">Excluir</button>
      </td>
    `;

    listaTransacoes.appendChild(linha);
  });
}

/* EVENTO: ADICIONAR NOVA TRANSAÇÃO */
formTransacao.addEventListener("submit", function (event) {
  event.preventDefault();

  const descricao = inputDescricao.value.trim();
  const valor = parseFloat(inputValor.value);
  const categoria = inputCategoria.value;

  if (!descricao || isNaN(valor) || valor <= 0 || !categoria) {
    alert("Por favor, preencha todos os campos corretamente.");
    return;
  }

  const novaTransacao = {
    id: Date.now(),
    descricao: descricao,
    valor: valor,
    categoria: categoria,
  };

  const dados = carregarDados();
  dados.transacoes.push(novaTransacao);
  salvarDados(dados);

  atualizarDashboard({ anunciar: true });
  atualizarTabela();
  formTransacao.reset();
});

/* REMOVER TRANSAÇÃO */
function removerTransacao(id) {
  const dados = carregarDados();

  dados.transacoes = dados.transacoes.filter(function (transacao) {
    return transacao.id !== id;
  });

  salvarDados(dados);
  atualizarDashboard({ anunciar: true });
  atualizarTabela();
}

/* INICIALIZAÇÃO DA APLICAÇÃO */
document.addEventListener("DOMContentLoaded", function () {
  atualizarDashboard();
  atualizarTabela();
});
