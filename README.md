# virtual_minds_task_backend

RESTful API for Virtaul Minds CRM, including CRUD operations for a postgreSQL database, and an Express JS server

### Installation instructions

As our RDBMS i am using postgreSQL

1- Create a database with desired name and adjust .env file accordingly.
2- Setup the .env file with required data sent in the email.
3- Run npm install.
4- Run npx sequelize-cli db:migrate to implement migrations.
5- Run npm start.

You should see Server listening on port "Specified port on .env"
