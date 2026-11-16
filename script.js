const form      = document.getElementById('form-busca')
const inputCep  = document.getElementById('cep')
const botao     = document.getElementById('btn-buscar')
const resultado = document.getElementById('resultado')

inputCep.addEventListener('input', () => {
  let valor = inputCep.value.replace(/\D/g, '')
  if (valor.length > 5) {
    valor = valor.slice(0, 5) + '-' + valor.slice(5, 8)
  }
  inputCep.value = valor
  inputCep.removeAttribute('aria-invalid')
})

form.addEventListener('submit', async (evento) => {
  evento.preventDefault()

  const cep = inputCep.value.replace(/\D/g, '')

  if (cep.length !== 8) {
    inputCep.setAttribute('aria-invalid', 'true')
    mostrarErro('CEP inválido. Digite 8 números.')
    return
  }

  mostrarCarregando()
  botao.disabled = true

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const dados = await resposta.json()

    if (dados.erro) {
      mostrarErro('CEP não encontrado. Verifique e tente novamente.')
    } else {
      mostrarEndereco(dados)
    }

  } catch (erro) {
    mostrarErro('Falha na conexão. Verifique sua internet.')
    console.error(erro)

  } finally {
    botao.disabled = false
  }
})

function mostrarCarregando() {
  resultado.innerHTML = '<div class="mensagem mensagem--carregando">Buscando endereço…</div>'
}

function mostrarErro(texto) {
  resultado.innerHTML = `<div class="mensagem mensagem--erro">⚠ ${texto}</div>`
}

function mostrarEndereco(d) {
  const campos = [
    ['CEP',         d.cep],
    ['Rua',  d.logradouro],
    ['Complemento', d.complemento],
    ['Bairro',      d.bairro],
    ['Cidade / UF', d.localidade && d.uf ? `${d.localidade} - ${d.uf}` : ''],
    ['DDD',         d.ddd],
  ].filter(([, valor]) => valor)

  const dl = document.createElement('dl')
  dl.className = 'endereco'

  campos.forEach(([rotulo, valor]) => {
    const dt = document.createElement('dt')
    dt.textContent = rotulo
    const dd = document.createElement('dd')
    dd.textContent = valor
    dl.appendChild(dt)
    dl.appendChild(dd)
  })

  resultado.innerHTML = ''
  resultado.appendChild(dl)
}