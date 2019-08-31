'use strict';

process.env.SECRET='test';

const jwt = require('jsonwebtoken');

const server = require('../../../src/app').server;
const supergoose = require('../../supergoose.js');

const mockRequest = supergoose.server(server);

let users = {
  admin: {username: 'admin', password: 'password', role: 'admin'},
  editor: {username: 'editor', password: 'password', role: 'editor'},
  user: {username: 'user', password: 'password', role: 'user'},
};

// let testToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkNjg2NGVmY2RlYjM1ZDQzYWYyMTMzNCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTY3MTIyNjcxfQ.psQ02E1pkFZ8oEV4w2F5ZsLq_dnyKh9sDDlBSsML0_s';

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Auth Router', () => {
  
  Object.keys(users).forEach( userType => {
    
    describe(`${userType} users`, () => {
      
      let encodedToken;
      let id;
      
      test('can create one', () => {
        return mockRequest.post('/signup')
          .send(users[userType])
          .then(results => {
            let token = jwt.verify(results.text, process.env.SECRET);
            id = token.id;
            encodedToken = results.text;
            expect(token.id).toBeDefined();
          });
      });

      test('can signin with basic', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            let token = jwt.verify(results.text, process.env.SECRET);
            expect(token.id).toEqual(id);
          });
      });

      // superagent bearer token authorization
      //
      // it('can signin with bearer', () => {
      //   return mockRequest.post('/signin')
      //     .auth(testToken, {type: bearer})
      //     .then(results => {
      //       // var token = jwt.verify(results.text, process.env.SECRET);
      //       expect(results).toEqual(id);
      //     });
      // });


      // it('can generate an auth key', () => {
      //   return mockRequest.post('/key')
      //
      //   });
      // });
    });
    
  });
  
});