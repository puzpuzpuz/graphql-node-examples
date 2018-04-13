const express = require('express')
const graphqlHTTP = require('express-graphql')
const graphql = require('graphql')

// Maps id to User object
const fakeDatabase = {
  'a': {
    id: 'a',
    name: 'alice'
  },
  'b': {
    id: 'b',
    name: 'bob'
  }
}

/*
The code below is equivalent to this notation:
  type User {
    id: String
    name: String
  }

  type Query {
    user(id: String): User
  }
*/

// Define the User type
const UserType = new graphql.GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString }
  }
})

// Define the Query type
const QueryType = new graphql.GraphQLObjectType({
  name: 'Query',
  description: 'The service API',
  fields: {
    user: {
      type: UserType,
      description: 'Find user by id',
      // `args` describes the arguments that the `user` query accepts
      args: {
        id: { type: graphql.GraphQLString }
      },
      resolve: function (_, {id}) {
        return fakeDatabase[id]
      }
    }
  }
})

const schema = new graphql.GraphQLSchema({query: QueryType})

const app = express()
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}))
app.listen(4000)
console.log('Running a GraphQL API server at localhost:4000/graphql')
