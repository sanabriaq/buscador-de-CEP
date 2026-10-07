const form = document.getElementById("form-busca"); // Seleciona o formulário de busca
const input = document.getElementById("cep"); // Seleciona o campo de entrada do CEP
const botao = document.getElementById("btn-buscar"); // Seleciona o botão de busca
const resultado = document.getElementById("resultado"); // Seleciona o elemento onde o resultado será exibido

// máscara 00000-000 enquanto digita
input.addEventListener("input", () => {
  const digitos = input.value.replace(/\D/g, "").slice(0, 8);
  input.value = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
  input.removeAttribute("aria-invalid");
});

function mostrarMensagem(texto, tipo) {
  resultado.className = `mensagem mensagem--${tipo}`;
  resultado.textContent = texto;
}

function linha(rotulo, valor) {
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = rotulo;
  dd.textContent = valor || "—";
  return [dt, dd];
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const cep = input.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    input.setAttribute("aria-invalid", "true");
    mostrarMensagem("O CEP precisa ter 8 dígitos.", "erro");
    input.focus();
    return;
  }

  botao.disabled = true;
  mostrarMensagem("Buscando endereço…", "carregando");

  //API do ViaCEP para buscar o endereço com base no CEP
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      mostrarMensagem("CEP não encontrado.", "erro");
      return;
    }

    const lista = document.createElement("dl");
    lista.className = "endereco";
    lista.append(
      ...linha("CEP", dados.cep),
      ...linha("Rua", dados.logradouro),
      ...linha("Bairro", dados.bairro),
      ...linha("Cidade", dados.localidade),
      ...linha("Estado", dados.estado ? `${dados.estado} (${dados.uf})` : dados.uf)
    );
    resultado.className = "";
    resultado.replaceChildren(lista);
  } catch (erro) {
    mostrarMensagem("Erro ao buscar o CEP. Verifique sua conexão.", "erro");
  } finally {
    botao.disabled = false;
  }
});