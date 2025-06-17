// Referenciando HTML com querySelector
const pesquisaInput = document.querySelector(".input-pesquisa");
const botaoLocalizacao = document.querySelector(".local-botao");
const divClimaAtual = document.querySelector(".clima-atual");
const divClimaporHora = document.querySelector(".hora-clima");

// Chace disponibilizada pela API
const API_KEY = "76d4a373c13544ccb90181812252804";

// Códigos da API para cada tipo de clima
const climaCodigos = {
    clear: [1000],
    clouds: [1003, 1006, 1009],
    mist: [1030, 1135, 1147],
    rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
    moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
    snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
    thunder: [1087, 1279, 1282],
    thunder_rain: [1273, 1276],
};

const exibirPrevisaoPorHora = (dadosPorHora) => {
    const horaAtual = new Date().setMinutes(0, 0, 0);
    const prox24Horas = horaAtual + 24 * 60 * 60 * 1000;

    // Filtrar para incluir somente as próximas 24 horas
    const prox24HorasDados = dadosPorHora.filter(({ time }) => {
        const previsaoHora = new Date(time).getTime();
        return previsaoHora >= horaAtual && previsaoHora <= prox24Horas;
    });

    // Gerando HTML corretamente com a <ul class="lista-clima">
    divClimaporHora.innerHTML = `
        <ul class="lista-clima">
            ${prox24HorasDados.map(item => {
                const temperatura = Math.floor(item.temp_c);
                const horario = item.time.split(" ") [1].substring(0, 5);
                const climaIcone = Object.keys(climaCodigos).find(icon => climaCodigos[icon].includes(item.condition.code));

                return `
                    <li class="clima-item">
                        <p class="hora">${horario}</p>
                        <img src="icons/${climaIcone}.svg" class="icone-clima">
                        <p class="temperatura">${temperatura}&deg;</p>
                    </li>
                `;
            }).join("")}
        </ul>
    `;
};

const buscarInfoClima = async (API_URL) => {
    window.innerWidth <= 768 && pesquisaInput.blur();
    document.body.classList.remove("exibir-resultado-erro");
    
    try {
     // Pegar informação da API e trazer como JSON
     const resultado = await fetch(API_URL);
    const dados = await resultado.json();

    // Extraindo informações atuais do clima
    const temperatura = Math.floor(dados.current.temp_c);
    const descricao = dados.current.condition.text;
    const climaIcone = Object.keys(climaCodigos).find(icon => climaCodigos[icon].includes(dados.current.condition.code));

    // Atualizando visor de clima atual
     divClimaAtual.querySelector(".icone-clima").src = `icons/${climaIcone}.svg`;
     divClimaAtual.querySelector(".temperatura").innerHTML = `${temperatura}<span>&deg;C</span>`;
     divClimaAtual.querySelector(".descricao").innerText = descricao;

    // Combinando clima por horário do dia atual e do dia seguinte
     const climaPorHora = [...dados.forecast.forecastday[0].hour, ...dados.forecast.forecastday[1].hour];
     exibirPrevisaoPorHora(climaPorHora);

     pesquisaInput.value = dados.location.name;
     console.log(dados.location.name);
    } catch (error) {
        document.body.classList.add("exibir-resultado-erro");
    }
};

// Configurando pedido de previsão para cidade específica
const configurarPedidoClima = (nomeCidade) => {
    const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${nomeCidade}&days=2`;
    buscarInfoClima(API_URL);
}

// Computando input do usuário
pesquisaInput.addEventListener("keyup", (e) => {
    const nomeCidade = pesquisaInput.value.trim();

    if (e.key == "Enter" && nomeCidade) {
        configurarPedidoClima(nomeCidade);
    }
});

// Coletando coordenadas do usuário
botaoLocalizacao.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
        buscarInfoClima(API_URL);
    }, error => {
        alert("Erro! Habilite a opção de localização no seu navegador ou tente novamente mais tarde.");
    })
});
