// console.log("Hello Salam")
// 1 recuperer le pacquet express dans le node modules
const express = require("express");
// On n'a creer une instance
const app = express();
const { Sequelize, DataTypes } = require('sequelize')
const port = 3000;
const { success, getUniqueId } = require('./helper')
const morgan = require('morgan')
const bodyParser = require('body-parser')
let pokemons = require("./mock-pokemon");
const pokemonModel = require('./src/models/pokemon')

const sequelize = new Sequelize(
    'pokedex',
    'root',
    '',
    {
        host: 'localhost',
        dialect: 'mariadb',
        dialectOptions: {
            timezone: 'Etc/GMT-2'
        },
        logging: false
    }
)
sequelize.authenticate()
    .then(_ => console.log('La connexion à la base de données à bien été etablie'))
    .catch(error => console.log(`Impossible de se connecter à la base de donnée ${error}`))

const Pokemon = pokemonModel(sequelize, DataTypes)
// On fait la synchronisation avec notre base de données
sequelize.sync({ force: true })
    .then(_ => {
        console.log('La base de donnée "Pokedex" a bien eté synchronisée')
        pokemons.map(pokemon => {
            Pokemon.create({
                name: pokemon.name,
                hp: pokemon.hp,
                cp: pokemon.cp,
                picture: pokemon.picture,
                types: pokemon.types.join()
            }).then(bulbizzare => console.log(bulbizzare.toJSON()))
        })
        // Pokemon.create({
        //     name: 'Bulbizzare',
        //     hp: 25,
        //     cp: 5,
        //     picture: "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/001.png",
        //     types: ['Plante', 'Poisson'].join()
        // }).then(bulbizzare => console.log(bulbizzare.toJSON()))
    })
// const pokemons = require("./mock-pokemon");
// const helper = require('./helper')
// Ce sont les endpoints
app.get("/", (req, res) => {
    res.send("Hello voici mon appli express 1 !!!");
});
// Les middleweare 
// const logger = (req, res, next) => {
//     console.log(`URL : ${req.url}`)
//     next()
// }
// app.use(logger)
app.use(morgan('dev'))
app.use(bodyParser.json())
// app.get('/api/pokemons/1', (req, res) => res.send('Hello , Bulbizarre !!!!!'))
// app.get('/api/pokemons/:id', (req, res)=> {
//     const id = req.params.id
//     res.send(`Vous avez demander le pokemons num ${id}`)
// })
// app.get('/api/pokemons/:id/:name', (req, res)=> {
//     const id = req.params.id
//     const name = req.params.name
//     res.send(`Vous avez demander le pokemons num ${id} est le ${name}`)
// })
app.get("/api/pokemons/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const pokemon = pokemons.find((pokemon) => pokemon.id === id);
    const message = 'Un pokemon à bien été trouvé'
    res.json(success(message, pokemon))
    // res.send(`Vous avez demander le pokemon ${pokemon.name}`)
    //   res.json(pokemon);
});
// Ajout de nouveau pokemon dans notre pokedex
app.post('/api/pokemons', (req, res) => {
    const id = getUniqueId(pokemons)
    const pokemonCreated = { ...req.body, ...{ id: id, created: new Date() } }
    pokemons.push(pokemonCreated)
    const message = `Le pokemon ${pokemonCreated.name} à bien été crée.`
    res.send(success(message, pokemonCreated))
})
// Modification d'un pokemon
app.put('/api/pokemons/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const updatedPokemon = { ...req.body, id: id }
    pokemons = pokemons.map(pokemon => {
        return pokemon.id === id ? updatedPokemon : pokemon
    })
    const message = `Le pokemon ${updatedPokemon.name} à été modifié`
    res.send(success(message, updatedPokemon))
})
// Suppression d'un pokemon
app.delete('/api/pokemons/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const pokemonDeleted = pokemons.find(pokemon => pokemon.id === id)
    pokemons = pokemons.filter(pokemon => pokemon.id !== id)
    const message = `Le pokémon ${pokemonDeleted.name} a bien été supprimé.`
    res.json(success(message, pokemonDeleted))
});
// Un nouveau endpoint de terminaison ,affichant le nombre total de pokemons
// app.get("/api/pokemons", (req, res) => {
//   res.send(`Il ya ${pokemons.length} pokemons dans le pokedex pour le moment`);
// });
// La liste des pokemons au format JSON avec un message
app.get('/api/pokemons', (req, res) => {
    const message = 'Un pokemon à bien été recuperer'
    res.json(success(message, pokemons))
})
app.listen(port, () =>
    console.log(
        `Notre application node est demarée sur : http://localhost:${port}`
    )
);
