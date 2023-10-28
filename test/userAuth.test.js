const app = require('../app');
const supertest = require("supertest");
const UserModel = require("../server/models/User");
const { connect } = require("./database");

describe("User authentication when logging in", () => {
    let connection;

    beforeAll(async() => {
    connection = await connect;
    });

    beforeEach(async() => {
    await connection.cleanup();
    });

    afterAll(async() => {
        await connection.close();
    });

    it('should login a user', async() => {
        const response = await supertest(app).post("/adminn")
        .set("contentType", 'text/html')
        .send({ username: "francis", password: "francis"});

        expect(response.status).toEqual(302);
        expect(response.toMatchObject({ username:"francis" }));


    })
    
})