const { merge } = require('lodash');
const { combineResolvers } = require('graphql-resolvers');
const {
  tagResolvers,
  tagdetailResolvers,
  statusResolvers,
  userResolvers,
  missionResolver,
  discoveryResolvers,
  coordinateResolvers,
} = require('./map_resolvers');

const queryResolvers = {
  Query: {
    tagRenderList: async (_, __, { dataSources }) =>
      dataSources.firebaseAPI.getTagList(),
    tagDetail: async (_, { id }, { dataSources }) =>
      dataSources.firebaseAPI.getTagDetail({ tagID: id }),
    missionList: async (_, __, { dataSources }) =>
      dataSources.firebaseAPI.getList('missionList'),
    discoveryList: async (_, __, { dataSources }) =>
      dataSources.firebaseAPI.getList('discoveryList'),
    intentAnswer: async (_, { intent }, { dataSources }) =>
      dataSources.firebaseAPI.getAnswer(intent),
  },
};

const mutationResolvers = {
  Mutation: {
    addNewTagData: combineResolvers(
      // isAuthenticated,
      // isTagOwner,
      async (_, { data }, { dataSources, me }) => {
        return dataSources.firebaseAPI.addNewTagData({ data, me });
      }
    ),
    updateTagStatus: async (_, { tagId, statusName }, { dataSources }) => {
      return dataSources.firebaseAPI.updateTagStatus({ tagId, statusName });
    },
    addNewIntent: (_, { userIntent, userAnswer }, { dataSources }) => {
      return dataSources.firebaseAPI.addNewIntent({ userIntent, userAnswer });
    },
  },
};

const resolvers = merge(
  queryResolvers,
  mutationResolvers,
  tagResolvers,
  tagdetailResolvers,
  statusResolvers,
  userResolvers,
  missionResolver,
  discoveryResolvers,
  coordinateResolvers
);

module.exports = resolvers;
