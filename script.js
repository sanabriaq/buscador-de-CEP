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

function mostrarMensagem(texto, tipo) { // Função para exibir mensagens de erro ou carregamento
  resultado.className = `mensagem mensagem--${tipo}`; // Adiciona a classe correspondente ao tipo de mensagem
  resultado.textContent = texto; // Define o texto da mensagem
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
  try { // Faz a requisição para a API do ViaCEP
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);// Faz a requisição para a API do ViaCEP
    const dados = await resposta.json();// Converte a resposta em JSON

    if (dados.erro) {
      mostrarMensagem("CEP não encontrado.", "erro");
      return;
    }

    const lista = document.createElement("dl");
    lista.className = "endereco";
    lista.append(
      ...linha("CEP", dados.cep), // Adiciona o CEP à lista
      ...linha("Rua", dados.logradouro), // Adiciona a rua à lista
      ...linha("Bairro", dados.bairro), // Adiciona o bairro à lista
      ...linha("Cidade", dados.localidade), // Adiciona a cidade à lista
      ...linha("Estado", dados.estado ? `${dados.estado} (${dados.uf})` : dados.uf) // Adiciona o estado à lista
    );
    resultado.className = ""; // Limpa a classe do resultado
    resultado.replaceChildren(lista); // Substitui o conteúdo do resultado pelo endereço encontrado
  } catch (erro) { // Caso ocorra algum erro na requisição, exibe uma mensagem de erro
    mostrarMensagem("Erro ao buscar o CEP. Verifique sua conexão.", "erro"); // Exibe uma mensagem de erro
  } finally { // Sempre executa, independentemente de sucesso ou erro
    botao.disabled = false; // Habilita o botão novamente
  }
});