// JS para a aplicação de cadastro de pizzas

var isCordova = !!window.cordova;  

if (isCordova) {
    document.addEventListener('deviceready', onDeviceReady, false);
} else {
    window.onload = onDeviceReady;
}

// ID da pizzaria (deve ser alterado para cada pizzaria)

var PIZZARIA_ID = "pizzaria_da_andrezza";

var listaPizzasCadastradas = [];

var pizzaAtualId = null;


function httpGet(url, onSuccess, onError) {
    if (isCordova && cordova.plugin && cordova.plugin.http) {
        cordova.plugin.http.get(url, {}, {}, onSuccess, onError);
    } else {
        fetch(url)
            .then(response => response.text())
            .then(data => { 
                onSuccess({ data: data });
            })
            .catch(err => {
                onError(err);
            });
    }
}

// Função para fazer requisição POST

function httpPost(url, data, onSuccess, onError) {
    if (isCordova && cordova.plugin && cordova.plugin.http) {
        cordova.plugin.http.post(url, data, {}, onSuccess, onError);
    } else {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(respData => {
            onSuccess({ data: respData });
        })
        .catch(err => onError(err));
    }
}

// Função para fazer requisição PUT
function httpPut(url, data, onSuccess, onError) {
    if (isCordova && cordova.plugin && cordova.plugin.http) {
        cordova.plugin.http.put(url, data, {}, onSuccess, onError);
    } else {
        fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(respData => {
            onSuccess({ data: respData });
        })
        .catch(err => onError(err));
    }
}

// Função para fazer requisição DELETE
function httpDelete(url, onSuccess, onError) {
    if (isCordova && cordova.plugin && cordova.plugin.http) {
        cordova.plugin.http.delete(url, {}, {}, onSuccess, onError);
    } else {
        fetch(url, { method: 'DELETE' })
            .then(response => response.text())
            .then(respData => {
                onSuccess({ data: respData });
            })
            .catch(err => onError(err));
    }
}



/**
 * @param {string} base64Image 
 * @param {number} maxWidth 
 * @param {number} maxHeight
 * @param {function} callback
 */



function redimensionarImagem(base64Image, maxWidth, maxHeight, callback) {
    const img = new Image();
    img.src = base64Image;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 0.7 é a qualidade
        callback(resizedBase64);
    };

    img.onerror = function() {
        console.error("Erro ao carregar a imagem.");
        callback(null);
    };
}

// Função que será chamada quando o dispositivo estiver pronto

function onDeviceReady() {
    console.log("onDeviceReady (ou onload) disparado");
    if (isCordova) {
        alert("Rodando em ambiente Cordova!");
        if (cordova.plugin && cordova.plugin.http) {
            cordova.plugin.http.setDataSerializer('json');
        }
    } else {
        console.log("Rodando no navegador (sem Cordova)");
    }

    window.applista    = document.getElementById('applista');
    window.appcadastro = document.getElementById('appcadastro');
    window.listaPizzas = document.getElementById('listaPizzas');
    window.imagem      = document.getElementById('imagem');
    window.pizza       = document.getElementById('pizza');
    window.preco       = document.getElementById('preco');
    window.btnNovo     = document.getElementById('btnNovo');
    window.btnFoto     = document.getElementById('btnFoto');
    window.btnSalvar   = document.getElementById('btnSalvar');
    window.btnExcluir  = document.getElementById('btnExcluir');
    window.btnCancelar = document.getElementById('btnCancelar');
    window.inputFoto   = document.getElementById('inputFoto');

    if (!isCordova) {
        inputFoto.style.display = 'block';
    }

    btnNovo.addEventListener('click', function() {
        pizzaAtualId = null;
        pizza.value = "";
        preco.value = "";
        imagem.style.backgroundImage = "";
        applista.style.display = 'none';
        appcadastro.style.display = 'flex';
    });

    btnCancelar.addEventListener('click', function() {
        appcadastro.style.display = 'none';
        applista.style.display = 'flex';
    });

    btnFoto.addEventListener('click', function() {
        if (isCordova && navigator.camera) {
            navigator.camera.getPicture(onSuccessFoto, onFailFoto, {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 300,
                correctOrientation: true
            });
        } else {
            inputFoto.click();
        }
    });

    inputFoto.addEventListener('change', function(e) {
        if (inputFoto.files && inputFoto.files[0]) {
            const file = inputFoto.files[0];
            const reader = new FileReader();
            reader.onload = function(evt) {
                imagem.style.backgroundImage = `url(${evt.target.result})`;
            };
            reader.readAsDataURL(file);
        }
    });

    btnSalvar.addEventListener('click', function() {
        const bgImage = imagem.style.backgroundImage;
        const imagemBase64 = bgImage.slice(5, -2); 

        if (imagemBase64) {
            redimensionarImagem(imagemBase64, 300, 300, function(resizedBase64) {
                if (resizedBase64) {
                    var data = {
                        pizzaria: PIZZARIA_ID,
                        pizza: pizza.value,
                        preco: preco.value,
                        imagem: resizedBase64
                    };

                    if (pizzaAtualId === null) {
                        httpPost('https://pedidos-pizzaria.glitch.me/admin/pizza/', data,
                            function(response) {
                                alert("Pizza cadastrada com sucesso!");
                                carregarPizzas();
                                appcadastro.style.display = 'none';
                                applista.style.display = 'flex';
                            },
                            function(error) {
                                alert("Erro ao cadastrar pizza: " + JSON.stringify(error));
                            }
                        );
                    } else {
                        data.pizzaid = listaPizzasCadastradas[pizzaAtualId]._id;
                        httpPut('https://pedidos-pizzaria.glitch.me/admin/pizza/', data,
                            function(response) {
                                alert("Pizza atualizada com sucesso!");
                                carregarPizzas();
                                appcadastro.style.display = 'none';
                                applista.style.display = 'flex';
                            },
                            function(error) {
                                alert("Erro ao atualizar pizza: " + JSON.stringify(error));
                            }
                        );
                    }
                } else {
                    alert("Erro ao redimensionar a imagem.");
                }
            });
        } else {
            alert("Adicione uma imagem antes de salvar.");
        }
    });


    // Excluir pizza
    btnExcluir.addEventListener('click', function() {
        if (pizzaAtualId !== null) {
            var nomePizza = listaPizzasCadastradas[pizzaAtualId].pizza;
            var url = 'https://pedidos-pizzaria.glitch.me/admin/pizza/'
                       + PIZZARIA_ID + '/' + encodeURIComponent(nomePizza);

            httpDelete(url,
                function(response) {
                    alert("Pizza excluída com sucesso!");
                    carregarPizzas();
                    appcadastro.style.display = 'none';
                    applista.style.display = 'flex';
                },
                function(error) {
                    alert("Erro ao excluir pizza: " + JSON.stringify(error));
                }
            );
        } else {
            alert("Selecione uma pizza para excluir.");
        }
    });
    carregarPizzas();
}

// Funções para capturar a foto
function onSuccessFoto(imageData) {
    const imagemBase64 = `data:image/jpeg;base64,${imageData}`;
    imagem.style.backgroundImage = `url(${imagemBase64})`;
}

function onFailFoto(message) {
    alert('Falha ao capturar a foto: ' + message);
}


function carregarPizzas() {
    listaPizzas.innerHTML = "";
    var url = 'https://pedidos-pizzaria.glitch.me/admin/pizzas/' + PIZZARIA_ID;

    httpGet(url,
        function(response) {
            if (response.data && response.data !== "") {
                try {
                    listaPizzasCadastradas = JSON.parse(response.data);
                } catch (e) {
                    alert("Erro ao processar os dados: " + e);
                    listaPizzasCadastradas = [];
                }
            } else {
                listaPizzasCadastradas = [];
            }
            listaPizzasCadastradas.forEach((item, idx) => {
                var novo = document.createElement('div');
                novo.classList.add('list-group-item', 'list-group-item-action', 'flex-column', 'align-items-start');
                novo.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${item.pizza}</h5>
                        <small>${item.preco}</small>
                    </div>
                    <div class="mb-1">
                        <img src="${item.imagem}" alt="${item.pizza}" style="max-width: 100px; max-height: 100px;">
                    </div>
                `;
                novo.id = idx;
                novo.addEventListener('click', function() {
                    carregarDadosPizza(idx);
                });
                listaPizzas.appendChild(novo);
            });
        },
        function(error) {
            alert("Erro ao carregar as pizzas: " + JSON.stringify(error));
        }
    );
}


// Função para carregar os dados da pizza selecionada
function carregarDadosPizza(id) {
    pizzaAtualId = id;
    applista.style.display = 'none';
    appcadastro.style.display = 'flex';

    var item = listaPizzasCadastradas[id];
    pizza.value = item.pizza;
    preco.value = item.preco;
    imagem.style.backgroundImage = `url(${item.imagem})`;
}