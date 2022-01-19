const express = require('express');
const cookieParser = require('cookie-parser');
const nedb = require('nedb-promise');
const app = express();
const database = new nedb({ filename: 'accounts.db', autoload: true });

app.use(express.static('../frontend'));
app.use(express.json());
app.use(cookieParser());

let accounts = [];

app.post('/api/signup', async (request, response) => {
    const credentials = request.body;
    // { username: 'Alice', email:'alice@wonderland.com', password: 'pwd123' }
    const resObj = {
        success: true,
        usernameExists: false,
        emailExists: false
    }

    const usernameExists = await database.find({ username: credentials.username });
    const emailExists = await database.find({ email: credentials.email });

    console.log(usernameExists);
    console.log(emailExists);

    if (usernameExists.length > 0) {
        resObj.usernameExists = true;
    }
    if (emailExists.length > 0) {
        resObj.emailExists = true;
    }

    if(resObj.usernameExists == true || resObj.emailExists == true) {
        resObj.success = false;
    } else {
        database.insert(credentials);
    }

    response.json(resObj);
});

app.post('/api/login', async (request, response) => {
    const credentials = request.body;
    // { username: 'Ada', password: 'pwd123' }

    const resObj = {
        success: false
    }

    const account = await database.find({ username: credentials.username });
    console.log(account);

    if (account.length > 0) {
        if (account[0].password == credentials.password) {
            resObj.success = true;

            const cookieId = Math.round(Math.random() * 10000);

            database.update({ username: credentials.username }, { $set: { cookie: cookieId }});

            response.cookie('loggedIn', cookieId);
        }
    }

    response.json(resObj);
});

app.get('/api/loggedin', async (request, response) => {
    const cookie = request.cookies.loggedIn;

    let resObj = {
        loggedIn: false
    }

    const account = await database.find({ cookie: parseInt(cookie) });

    if (account.length > 0 ) {
        resObj.loggedIn = true;
    }

    response.json(resObj);
});

app.get('/api/logout', (request, response) => {
    response.clearCookie('loggedIn');

    const resObj = {
        success: true
    }

    response.json(resObj);
});

app.get('/api/account', async (request, response) => {
    const cookie = request.cookies.loggedIn;

    const resObj = {
        email: ''
    }

    const account = await database.find({ cookie: cookie });

    if (account.length > 0) {
        resObj.email = account[0].email;
    }

    response.json(resObj);
});

app.get('/api/remove', (request, response) => {
    const cookie = request.cookies.loggedIn;

    const resObj = {
        success: true
    }

    accounts = accounts.filter((account) => {
        if (account.cookie !== parseInt(cookie)) {
            return account;
        }
    });

    console.log(accounts);
    response.clearCookie('loggedIn');
    response.json(resObj);
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});