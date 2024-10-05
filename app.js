document.getElementById('searchBtn').addEventListener('click', function () {
    const pokemonName = document.getElementById('pokemonName').value.toLowerCase();
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Pokémon no encontrado');
            }
            return response.json();
        })
        .then(pokemonData => {
            console.log(pokemonData);  // Imprime el JSON completo para inspeccionar
            addPokemonCard(pokemonData);
            getEvolutionChain(pokemonData.species.url);
            getWeaknesses(pokemonData.types);
        })
        .catch(error => {
            document.getElementById('pokemonInfo').innerHTML = '<p>' + error.message + '</p>';
        });

});

// Initialize particles.js
document.addEventListener('DOMContentLoaded', function () {
    particlesJS('particles-js', {
        particles: {
            number: { value: 200 },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            move: { enable: true, speed: 1 }
        }
    });
});

// Añadir tarjeta de Pokémon
function addPokemonCard(pokemon) {
    const template = document.getElementById('pokemonCardTemplate').content.cloneNode(true);
    const pokemonCard = template.querySelector('.pokemon-card');
    const pokemonImg = template.querySelector('.pokemon-img');

    // Asegúrate de que el ID, altura, peso y tipo están correctamente asignados
    pokemonCard.setAttribute('data-id', pokemon.id);  
    pokemonImg.src = pokemon.sprites.front_default || 'ruta-a-imagen-placeholder.png'; // Añade una imagen por defecto si no se encuentra

    template.querySelector('.pokemon-name').textContent = capitalizeFirstLetter(pokemon.name);
    template.querySelector('.pokemon-id').textContent = pokemon.id;
    template.querySelector('.pokemon-height').textContent = (pokemon.height / 10).toFixed(1); // Convertir a metros
    template.querySelector('.pokemon-weight').textContent = (pokemon.weight / 10).toFixed(1); // Convertir a kilogramos
    template.querySelector('.pokemon-type').textContent = pokemon.types.map(type => capitalizeFirstLetter(type.type.name)).join(', '); // Mostrar tipos

    pokemonCard.addEventListener('dragstart', dragStart);
    pokemonImg.addEventListener('dragstart', dragStart);

    document.getElementById('pokemonInfo').innerHTML = ''; // Limpiar resultados anteriores
    document.getElementById('pokemonInfo').appendChild(template);
}




function dragStart(event) {
    const pokemonId = event.target.getAttribute('data-id');
    console.log('ID arrastrado:', pokemonId); 
    event.dataTransfer.setData('text/plain', pokemonId);
}


// Drop Zone events
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', function (event) {
    event.preventDefault(); // Prevent default to allow drop
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', function (event) {
    event.preventDefault();
    console.log('¡Drop detectado!');  
    dropZone.classList.remove('dragover');

    const pokemonId = event.dataTransfer.getData('text/plain');
    console.log('ID del Pokémon soltado:', pokemonId);  // Asegúrate de que esto esté mostrando un ID

    if (pokemonId) {
        fetchPokemonById(pokemonId);
    } else {
        console.error('El ID del Pokémon es inválido o está vacío.');
    }
});



// Fetch Pokémon by ID
function fetchPokemonById(id) {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;

    fetch(url)
        .then(response => response.json())
        .then(pokemonData => {
            alert(`Has soltado a ${capitalizeFirstLetter(pokemonData.name)} (ID: ${pokemonData.id})`);
        })
        .catch(error => {
            alert('No se pudo encontrar el Pokémon');
        });
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Obtener la cadena evolutiva del Pokémon
function getEvolutionChain(speciesUrl) {
    fetch(speciesUrl)
        .then(response => response.json())
        .then(speciesData => {
            return fetch(speciesData.evolution_chain.url);
        })
        .then(response => response.json())
        .then(evolutionData => {
            displayEvolutionChain(evolutionData.chain);
        });
}

// Mostrar la línea evolutiva
function displayEvolutionChain(chain) {
    let evolutionHTML = '<h3>Línea Evolutiva</h3>';
    let currentStage = chain;

    while (currentStage) {
        evolutionHTML += `<span>${capitalizeFirstLetter(currentStage.species.name)}</span>`;
        if (currentStage.evolves_to.length > 0) {
            evolutionHTML += ' ⟶ ';
        }
        currentStage = currentStage.evolves_to[0];
    }

    document.getElementById('pokemonInfo').insertAdjacentHTML('beforeend', `<div class="pokemon-evolution">${evolutionHTML}</div>`);
}

// Obtener las debilidades del Pokémon en función de sus tipos
function getWeaknesses(types) {
    const typePromises = types.map(type => fetch(type.type.url).then(response => response.json()));

    Promise.all(typePromises).then(typeData => {
        const weaknesses = new Set();
        
        typeData.forEach(typeInfo => {
            typeInfo.damage_relations.double_damage_from.forEach(weaknessType => {
                weaknesses.add(capitalizeFirstLetter(weaknessType.name));
            });
        });

        const weaknessesArray = Array.from(weaknesses);
        displayWeaknesses(weaknessesArray);
    });
}

// Mostrar las debilidades
function displayWeaknesses(weaknesses) {
    let weaknessesHTML = '<h3>Debilidades</h3>';
    weaknessesHTML += weaknesses.map(w => `<span>${w}</span>`).join(' ');

    document.getElementById('pokemonInfo').insertAdjacentHTML('beforeend', `<div class="pokemon-weaknesses">${weaknessesHTML}</div>`);
}


// Capitalizar primera letra de una cadena
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
