const { ApolloServer, gql } = require('apollo-server');

// 1. 在假資料中補充朋友資訊
const intents = [
  { id: 1, u_intent: 'hungry', u_answer: 'get food' },
  { id: 2, u_intent: 'horney', u_answer: 'get sex' },
  { id: 3, u_intent: 'sleepy', u_answer: 'get sleep' },
];

const typeDefs = gql`
  type Intent {
    id: ID!
    u_inent: String
    u_answer: String
  }

  type Query {
    intentAnswer(intent: String!): String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    intentAnswer: (_, { intent }, ___) => {
      console.log(intent);
      const targetIntent = intents.find(function (item) {
        console.log(item.u_intent);
        return item.u_intent === intent;
      });
      console.log(targetIntent);
      return targetIntent.u_answer;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`);
});
