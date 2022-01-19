const nedb = require('nedb-promise');
const database = new nedb({ filename: 'database.db', autoload: true });

/** Database operations
* Insert - lägg till ny data i en databas
* Update - Uppdatera befintlig data i en databas, kan vara både lägg till och ta bort
* Find - Hitta specifik data i databasen och returnera
* Remove - Ta bort data
*/

database.insert({ name: 'Christoffer', age: 33 });
database.insert({ name: 'Ada', age: 30 });

async function getPerson() {
    const person = await database.find({ name: 'Christoffer' });
    console.log(person);
}

getPerson();

//Först vilket objekt ska vi uppdatera och sen vad ska vi uppdatera
database.update({ name: 'Ada' }, { $set: { age: 31 } });

database.remove({ name: 'Ada' });
