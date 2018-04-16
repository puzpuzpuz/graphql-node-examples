const express = require('express')
const graphqlHTTP = require('express-graphql')
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLSchema
} = require('graphql')

// Construct a schema, using GraphQL library API

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'App user',
  fields: {
    // notice GraphQLNonNull wrapper
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: {
      type: GraphQLString,
      resolve: function () {
        throw new Error('Name resolve error here')
      }
    },
    role: {
      type: GraphQLString,
      resolve: function () {
        throw new Error('Role resolve error here')
      }
    }
  }
})

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getCurrentUser: {
      type: UserType,
      resolve: function () {
        return {
          id: 'user001',
          name: 'Test name',
          role: 'Test role'
        }
      }
    }
  }
})

const schema = new GraphQLSchema({query: QueryType})

// start the server
const app = express()
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}))
app.listen(4000, () => {
  console.log('Running a GraphQL API server at localhost:4000/graphql')
})
