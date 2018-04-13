const express = require('express')
const graphqlHTTP = require('express-graphql')
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLSchema
} = require('graphql')

/*
The code below is equivalent to this notation:
  type Message {
    id: ID!
    content: String
    author: User
  }

  type User {
    id: ID!
    name: String
  }

  type Query {
    getMessage(id: ID!): Message
  }
*/

// Construct a schema, using GraphQL library API

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'App user',
  fields: {
    // notice GraphQLNonNull wrapper
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: {
      type: GraphQLString,
      resolve: function (root, args) {
        return root.name + ' (employee)'
      }
    }
  }
})

const MessageType = new GraphQLObjectType({
  name: 'Message',
  description: 'In app message',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: GraphQLString },
    author: {
      type: UserType,
      description: 'Message author',
      // notice `req` parameter - we could be doing AuthZ here
      resolve: function (root, args, req) {
        let id = root.authorId
        return findUser(id)
      }
    }
  }
})

const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'The service API',
  fields: {
    getMessage: {
      type: MessageType,
      description: 'Finds message by id',
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: function (_, {id}) {
        return findMessage(id)
      }
    }
  }
})

const schema = new GraphQLSchema({query: QueryType})

// a small comment for the programmatic schema declaration:
// notice that if we had `messages` in user type, in a real app
// we would have to deal with cyclic dependencies
// (as messages depend on user and vice versa);
// to avoid this we could be using graphql-tools's generate-schema
// (https://www.apollographql.com/docs/graphql-tools/generate-schema.html)

// Now we need to emulate DB layer

class Message {
  constructor (id, {content, authorId}) {
    this.id = id
    this.content = content
    this.authorId = authorId
  }
}

class User {
  constructor (id, {name}) {
    this.id = id
    this.name = name
  }
}

const fakeDatabase = {
  'message001': {
    content: 'Test message 001',
    authorId: 'author001'
  },
  'author001': {
    name: 'Test author 001'
  }
}

async function findMessage (id) {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        if (!fakeDatabase[id]) {
          reject(new Error('no message exists with id ' + id))
        }
        resolve(new Message(id, fakeDatabase[id]))
      },
      500
    )
  })
}

async function findUser (id) {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        if (!fakeDatabase[id]) {
          reject(new Error('no user exists with id ' + id))
        }
        resolve(new User(id, fakeDatabase[id]))
      },
      500
    )
  })
}

// start the server
const app = express()
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}))
app.listen(4000, () => {
  console.log('Running a GraphQL API server at localhost:4000/graphql')
})
