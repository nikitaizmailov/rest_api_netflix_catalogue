// Building a REST API server for front end to interact
// Building endpoints to interact with the REST API server
const Joi = require("joi");
const express = require("express");
const path = require('path');

// importing App class from express
const app = express();

// to parse JSON file/raw to body data
app.use(express.json());

// data of films, authors, ratings, etc.
const films_shows_data = [
    {
        id: 1,
        title: "The Social Network", 
        genre: "Drama",
        cast: ["Jesse Eisenberg", "Justin Timberlake", "Andrew Garfield"],
        imdb_rating: 7.8,
        director: "David Fincher",
        budget: 40000000,
        gross_worldwide: 224920375,
        release_date: 2010
    },
    {
        id: 2,
        title: "American Psycho", 
        genre: "Drama",
        cast: ["Christian Bale", "Jared Leto", "Matt Ross", "Willem Dafoe"],
        imdb_rating: 7.6,
        director: "Mary Harron",
        budget: 7000000,
        gross_worldwide: 34266564,
        release_date: 2000
    },
    {
        id: 3,
        title: "Icahn: The Restless Billionaire", 
        genre: "Documentary",
        cast: ["Carl Icahn"],
        imdb_rating: 7.0,
        director: "Bruce David Klein",
        budget: null,
        gross_worldwide: null,
        release_date: 2022
    }

]

// basic handler
// get request handler
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../templates', 'homepage.html'));
})

// Filtering functionality.
// Filter in descending or ascending order by each parameter of the object.
// Example filter by genre
app.get("/api/films", (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        const filters = req.query;
        const filteredFilms = films_shows_data.filter(film => {
            let isValid = true;
            for (let key in filters) {
                isValid = isValid && film[key] === filters[key];
            }
            return isValid;
        });
        res.send(filteredFilms);
        return;
    }
    res.send(films_shows_data);
});

// Implementing CRUD functionality for the REST API
// Create, Read, Update, Delete endpoints in the API to send such request to the Database.

app.get("/api/films/:id", (req, res) => {
    
    // grap the film with specific id provided
    const film_selected = films_shows_data.find((elem) => elem.id === parseInt(req.params.id));
    // if value is undefined hence the film id was not found return the if block below
    // return 404 status, as such object was NOT found
    if (!film_selected) {
        res.status(404).send("Sorry, such film was not found")
        return;
    }
    res.send(JSON.stringify(film_selected));
})

// POST request handler
// Creating a new record with provided JSON data

app.post("/api/films", (req, res) => {

    // If the req.body is provided in not correct form or missing data in required fields
    // raise status 400 Bad request error 
    const result = validateInput(req.body);
    if (result.error) {
        res.status(400).send(result.error);
        return;
    }
    // if the JSON data for film provided is valid
    // create and append new object to the array
    const film_obj = {
        id: films_shows_data.length + 1,
        title: req.body.title, 
        genre: req.body.genre,
        cast: req.body.cast,
        imdb_rating: parseFloat(req.body.imdb_rating),
        director: req.body.director,
        budget: parseInt(req.body.budget),
        gross_worldwide: parseInt(req.body.gross_worldwide),
        release_date: parseInt(req.body.release_date)
    }

    films_shows_data.push(film_obj);
    res.send(film_obj);


})

// update existing record in the array/database of the films database.
app.put("/api/films/:id", (req, res) => {
    // Check if such id exists at all or not
    const film_selected = films_shows_data.find((elem) => elem.id === parseInt(req.params.id));
    // if value is undefined hence the film id was not found return the if block below
    // return 404 status, as such object was NOT found
    if (!film_selected) {
        res.status(404).send("Sorry, such film was not found")
        return;
    }

    // If the req.body is provided in not correct form or missing data in required fields
    // raise status 400 Bad request error 
    const result = validateInput(req.body);
    if (result.error) {
        res.status(400).send(result.error);
        return;
    }

    // making the change asked
    // looping through passed parameters to make changes to the film's object parameters
    for (const property in req.body) {
        film_selected[property] = req.body[property];
    }
    res.send(film_selected);
})

app.delete("/api/films/:id", (req, res) => {
    // Look up the film
    // Not existing, return 404
    const film = films_shows_data.find(elem => elem.id === parseInt(req.params.id))
    // coursebool = False
    if (!film) {
        res.status(404).send("The film with the given id was not found");
        return;
    }

    // Delete
    const index = films_shows_data.indexOf(film);
    films_shows_data.splice(index, 1);

    // Return the same course
    res.send(film);
})

// Helper Functions to help handlers
function validateInput(film) {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        genre: Joi.string().min(3),
        cast: Joi.array().items(Joi.string()),
        imdb_rating: Joi.number().integer().min(0).max(10),
        director: Joi.string(),
        budget: Joi.number().integer(),
        gross_worldwide: Joi.number().integer(),
        release_date: Joi.number().integer()
    });

    // checks whether the provided film object follows the schema provided.
    return schema.validate(film);
}

// Throw 404 error page for wrong api endpoint request
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '../templates', 'error404.html'));
})

//switching on the server to listen for the request at the endpoints
// sever location: http://localhost:3000 or port
// Enviroment variable
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on Port ${port}`));