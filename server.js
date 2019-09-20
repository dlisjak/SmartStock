const nextJS = require('next');
const nextRoutes = require('next-routes');
const { GraphQLServer } = require('graphql-yoga');
const uuidv4 = require('uuidv4').default;

const nextJSApp = nextJS({ dev: process.env.NODE_ENV !== 'production' });
const nextJSRoutes = nextRoutes()
  .add({ pattern: '/', page: '/' })
  .add({ pattern: '/signin', page: '/signin' })
  .getRequestHandler(nextJSApp);

// GraphQL Endpoint
const gqlEndpoint = '/graphql';

const users = [
  {
    id: '1',
    name: 'Domen',
    email: 'd.lisjak@emakina.at',
  },
  {
    id: '2',
    name: 'Sladi',
    email: 's.ristic@emakina.at',
  },
  {
    id: '3',
    name: 'Anh Tu',
    email: 'a.nguyen@emakina.at',
  },
];

const images = [
  {
    id: '1',
    author: '1',
    title: 'Demo image',
    comments: [],
    likes: 1,
  },
  {
    id: '2',
    author: '3',
    title: 'Don Giovanni',
    comments: [],
    likes: 3,
  },
  {
    id: '3',
    author: '2',
    title: 'NordSee photo',
    comments: [],
    likes: 5,
  },
];

const typeDefs = `
  type Query {
    users(query: String): [User!]!
    images(query: String): [Image!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    postImage(title: String!, author: ID!, published: Boolean!): Image!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    images: [Image!]!
  }

  type Image {
    id: ID!
    author: User!
    title: String!
    published: Boolean!
    comments: [String!]
    likes: Int
  }
`;
const resolvers = {
  Query: {
    images(parent, args, ctx, info) {
      if (!args.query) return images;

      return images.filter((image) => {
        const isTitleMatch = image.title
          .toLowerCase()
          .includes(args.query.toLowerCase());
        return isTitleMatch;
      });
    },
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => user.email === args.email);

      if (emailTaken) throw new Error('Email already taken');

      const user = {
        id: uuidv4(),
        name: args.name,
        email: args.email,
      };

      users.push(user);

      return user;
    },
    postImage(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.author);

      if (!userExists) throw new Error('User not valid');

      const image = {
        id: uuidv4(),
        title: args.title,
        published: args.published,
        author: args.author,
      };

      images.push(image);

      return image;
    },
  },
  Image: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
  },
  User: {
    images(parent, args, ctx, info) {
      return images.filter((image) => {
        return image.author === parent.id;
      });
    },
  },
};

const gqlServer = new GraphQLServer({
  typeDefs,
  resolvers,
  context: (data) => ({ ...data }),
});

nextJSApp.prepare().then(() => {
  // ...check if GraphQL endpoint is pinged...
  gqlServer.use((req, res, next) => {
    if (req.path.startsWith(gqlEndpoint)) return next();
    // ... if not, use NextJS routes.
    nextJSRoutes(req, res, next);
  });

  // Start server.
  gqlServer
    .start(
      {
        endpoint: gqlEndpoint,
        playground: gqlEndpoint,
        subscriptions: gqlEndpoint,
        port: process.env.PORT || 3000,
      },
      () => console.log(`\n🚀 GraphQL server ready at http://localhost:4000`)
    )
    .then((httpServer) => {
      async function cleanup() {
        console.log(`\n\nDisconnecting...`);
        httpServer.close();
        console.log(`\nDone.\n`);
      }
      // process.on('SIGINT', cleanup)
      process.on('SIGTERM', cleanup);
    })
    .catch((err) => {
      console.error('Server start failed ', err);
      process.exit(1);
    });
});
